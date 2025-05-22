const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { MongoClient } = require('mongodb');
const archiver = require('archiver');
const { createLogger, format, transports } = require('winston');
const promClient = require('prom-client');

// Logger configuration
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                format.timestamp(),
                format.prettyPrint()
            )
        }),
        new transports.File({ filename: 'backup.log' })
    ]
});

// Prometheus metrics
const register = new promClient.Registry();

// Backup metrics
const backupMetrics = {
    success: new promClient.Counter({
        name: 'mongodb_backup_success_total',
        help: 'Total successful MongoDB backups'
    }),
    failure: new promClient.Counter({
        name: 'mongodb_backup_failure_total',
        help: 'Total failed MongoDB backups'
    }),
    duration: new promClient.Histogram({
        name: 'mongodb_backup_duration_seconds',
        help: 'MongoDB backup duration in seconds',
        buckets: [0.1, 0.5, 1, 5, 10, 30, 60]
    })
};

// Backup configuration
const config = {
    backupDir: process.env.BACKUP_DIR || path.join(__dirname, '..', '..', 'backups'),
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 7,
    backupInterval: parseInt(process.env.BACKUP_INTERVAL_MINUTES) || 60,
    compression: process.env.BACKUP_COMPRESSION === 'true',
    maxBackupSize: parseInt(process.env.MAX_BACKUP_SIZE_MB) * 1024 * 1024 || 100 * 1024 * 1024, // 100MB default
    maxBackupFiles: parseInt(process.env.MAX_BACKUP_FILES) || 10
};

// Create backup directory if it doesn't exist
if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
}

// Backup function
async function backupDatabase() {
    const start = process.hrtime();
    
    try {
        const client = new MongoClient(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await client.connect();
        const db = client.db();
        const collections = await db.listCollections().toArray();
        
        const backupPath = path.join(
            config.backupDir,
            `backup-${moment().format('YYYY-MM-DD-HH-mm-ss')}`
        );
        
        // Create backup directory
        fs.mkdirSync(backupPath, { recursive: true });

        // Backup each collection
        for (const collection of collections) {
            const collectionName = collection.name;
            const collectionPath = path.join(backupPath, `${collectionName}.json`);
            
            const cursor = db.collection(collectionName).find();
            const data = await cursor.toArray();
            
            fs.writeFileSync(
                collectionPath,
                JSON.stringify(data, null, 2)
            );
        }

        // Create metadata file
        const metadata = {
            timestamp: new Date().toISOString(),
            collections: collections.map(c => c.name),
            size: fs.statSync(backupPath).size
        };
        fs.writeFileSync(
            path.join(backupPath, 'metadata.json'),
            JSON.stringify(metadata, null, 2)
        );

        // Compress backup if enabled
        if (config.compression) {
            const archivePath = `${backupPath}.zip`;
            const archive = archiver('zip', {
                zlib: { level: 9 }
            });

            const output = fs.createWriteStream(archivePath);
            archive.pipe(output);

            archive.directory(backupPath, false);
            await archive.finalize();

            // Remove uncompressed backup
            fs.rmdirSync(backupPath, { recursive: true });
        }

        // Clean up old backups
        await cleanupOldBackups();

        const duration = process.hrtime(start);
        const seconds = duration[0] + duration[1] / 1e9;
        backupMetrics.duration.observe(seconds);
        backupMetrics.success.inc();

        logger.info('Database backup completed successfully', {
            backupPath,
            duration: seconds,
            timestamp: new Date()
        });

        return backupPath;

    } catch (error) {
        backupMetrics.failure.inc();
        logger.error('Database backup failed', {
            error: error.message,
            timestamp: new Date()
        });
        throw error;
    }
}

// Restore function
async function restoreDatabase(backupPath) {
    try {
        const client = new MongoClient(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await client.connect();
        const db = client.db();

        // Read metadata
        const metadataPath = path.join(backupPath, 'metadata.json');
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

        // Restore each collection
        for (const collectionName of metadata.collections) {
            const collectionPath = path.join(backupPath, `${collectionName}.json`);
            const data = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

            await db.collection(collectionName).deleteMany({});
            await db.collection(collectionName).insertMany(data);
        }

        logger.info('Database restore completed successfully', {
            backupPath,
            timestamp: new Date()
        });

        return true;

    } catch (error) {
        logger.error('Database restore failed', {
            error: error.message,
            timestamp: new Date()
        });
        throw error;
    }
}

// Cleanup old backups
async function cleanupOldBackups() {
    try {
        const cutoffDate = moment().subtract(config.retentionDays, 'days').toDate();
        const backups = fs.readdirSync(config.backupDir)
            .filter(file => file.startsWith('backup-'))
            .map(file => ({
                name: file,
                path: path.join(config.backupDir, file),
                timestamp: moment(file.replace('backup-', '')).toDate()
            }))
            .sort((a, b) => b.timestamp - a.timestamp);

        // Remove backups older than retention period
        for (const backup of backups) {
            if (backup.timestamp < cutoffDate) {
                fs.rmdirSync(backup.path, { recursive: true });
            }
        }

        // Keep only maxBackupFiles newest backups
        const filesToKeep = Math.min(config.maxBackupFiles, backups.length);
        for (let i = filesToKeep; i < backups.length; i++) {
            fs.rmdirSync(backups[i].path, { recursive: true });
        }

    } catch (error) {
        logger.error('Backup cleanup failed', {
            error: error.message,
            timestamp: new Date()
        });
        throw error;
    }
}

// Backup verification
async function verifyBackup(backupPath) {
    try {
        const metadataPath = path.join(backupPath, 'metadata.json');
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

        for (const collectionName of metadata.collections) {
            const collectionPath = path.join(backupPath, `${collectionName}.json`);
            const data = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

            if (!Array.isArray(data)) {
                throw new Error(`Invalid data format in ${collectionName}`);
            }
        }

        logger.info('Backup verification successful', {
            backupPath,
            timestamp: new Date()
        });

        return true;

    } catch (error) {
        logger.error('Backup verification failed', {
            error: error.message,
            backupPath,
            timestamp: new Date()
        });
        throw error;
    }
}

// Export all components
module.exports = {
    backupDatabase,
    restoreDatabase,
    cleanupOldBackups,
    verifyBackup,
    metrics: {
        register,
        backupMetrics
    },
    logger
};

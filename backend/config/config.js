require('dotenv').config();

const config = {
    // MongoDB Configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/itsm_db',
    
    // Application Configuration
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Security Configuration
    JWT_SECRET: process.env.JWT_SECRET || 'your-default-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    
    // Firebase Configuration
    FIREBASE_PROJECT_ID: 'itsm-project-bb01a',
    FIREBASE_CONFIG: {
        projectId: 'itsm-project-bb01a',
        storageBucket: 'itsm-project-bb01a.appspot.com',
        databaseURL: `https://itsm-project-bb01a.firebaseio.com`
    },
    
    // Backup Configuration
    BACKUP_DIR: process.env.BACKUP_DIR || './backups',
    BACKUP_RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS) || 7,
    BACKUP_INTERVAL_MINUTES: parseInt(process.env.BACKUP_INTERVAL_MINUTES) || 60,
    MAX_BACKUP_SIZE_MB: parseInt(process.env.MAX_BACKUP_SIZE_MB) || 100,
    MAX_BACKUP_FILES: parseInt(process.env.MAX_BACKUP_FILES) || 10,
    
    // Rate Limiting
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    
    // CORS Configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // External Services
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    
    // Analytics
    ANALYTICS_ENABLED: process.env.ANALYTICS_ENABLED === 'true',
    ANALYTICS_ID: process.env.ANALYTICS_ID
};

module.exports = config;

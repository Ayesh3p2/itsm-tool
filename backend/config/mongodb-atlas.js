const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const promClient = require('prom-client');
const { createLogger, format, transports } = require('winston');

// Prometheus metrics
const register = new promClient.Registry();

// Database connection metrics
const dbConnectionMetrics = new promClient.Gauge({
    name: 'mongodb_connection_status',
    help: 'MongoDB connection status',
    labelNames: ['status']
});

const dbQueryMetrics = new promClient.Counter({
    name: 'mongodb_query_total',
    help: 'Total number of MongoDB queries',
    labelNames: ['operation', 'collection', 'status']
});

const dbLatencyMetrics = new promClient.Histogram({
    name: 'mongodb_query_latency_seconds',
    help: 'MongoDB query latency in seconds',
    labelNames: ['operation', 'collection'],
    buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
});

// Winston logger configuration
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
        new transports.File({ filename: 'mongodb.log' })
    ]
});

// MongoDB Atlas configuration
const atlasConfig = {
    uri: process.env.MONGODB_ATLAS_URI,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 60000,
        retryWrites: true,
        retryReads: true,
        w: 'majority',
        ssl: true,
        sslValidate: true,
        sslCA: process.env.MONGODB_SSL_CA,
        sslCert: process.env.MONGODB_SSL_CERT,
        sslKey: process.env.MONGODB_SSL_KEY,
        sslPass: process.env.MONGODB_SSL_PASS,
        auth: {
            user: process.env.MONGODB_ATLAS_USER,
            password: process.env.MONGODB_ATLAS_PASS
        },
        tls: true,
        tlsCAFile: process.env.MONGODB_SSL_CA,
        tlsCertificateKeyFile: process.env.MONGODB_SSL_KEY,
        tlsCertificateFile: process.env.MONGODB_SSL_CERT,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
        tlsInsecure: false,
        tlsDisableCertificateRevocationCheck: false,
        tlsDisableOCSPEndpointCheck: false,
        // Additional security options
        heartbeatFrequencyMS: 10000,
        minHeartbeatFrequencyMS: 5000,
        serverSelectionTryOnce: false,
        autoEncryption: {
            keyVaultNamespace: 'encryption.datakeys',
            kmsProviders: {
                local: {
                    key: Buffer.from(process.env.MONGODB_ENCRYPTION_KEY, 'base64')
                }
            }
        }
    }
};

// Enhanced connection monitoring
mongoose.connection.on('connected', () => {
    dbConnectionMetrics.labels('connected').set(1);
    logger.info('MongoDB Atlas connection established');
});

mongoose.connection.on('error', (err) => {
    dbConnectionMetrics.labels('error').set(1);
    logger.error('MongoDB Atlas connection error:', {
        error: err.message,
        timestamp: new Date()
    });
});

mongoose.connection.on('disconnected', () => {
    dbConnectionMetrics.labels('disconnected').set(1);
    logger.warn('MongoDB Atlas connection disconnected');
});

mongoose.connection.on('reconnected', () => {
    dbConnectionMetrics.labels('connected').set(1);
    logger.info('MongoDB Atlas connection reestablished');
});

// Database operation monitoring middleware
const dbOperationMonitor = (operation, collection) => {
    return async (next) => {
        const start = process.hrtime();
        try {
            const result = await next();
            const duration = process.hrtime(start);
            const seconds = duration[0] + duration[1] / 1e9;

            dbQueryMetrics.labels(operation, collection, 'success').inc();
            dbLatencyMetrics.labels(operation, collection).observe(seconds);

            return result;
        } catch (error) {
            dbQueryMetrics.labels(operation, collection, 'error').inc();
            logger.error('MongoDB operation failed', {
                operation,
                collection,
                error: error.message,
                timestamp: new Date()
            });
            throw error;
        }
    };
};

// Health check middleware
const healthCheck = async (req, res) => {
    try {
        const start = process.hrtime();
        const result = await mongoose.connection.db.command({ ping: 1 });
        const duration = process.hrtime(start);
        const seconds = duration[0] + duration[1] / 1e9;

        dbLatencyMetrics.labels('ping', 'health').observe(seconds);
        
        res.json({
            status: 'ok',
            timestamp: new Date(),
            dbStatus: result,
            latency: seconds
        });
    } catch (error) {
        logger.error('Health check failed', {
            error: error.message,
            timestamp: new Date()
        });
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date()
        });
    }
};

// Export all components
module.exports = {
    atlasConfig,
    healthCheck,
    dbOperationMonitor,
    logger,
    metrics: {
        register,
        dbConnectionMetrics,
        dbQueryMetrics,
        dbLatencyMetrics
    }
};

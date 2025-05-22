const express = require('express');
const promClient = require('prom-client');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json, prettyPrint } = format;

// Prometheus metrics
const register = new promClient.Registry();

// Request metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_microseconds',
    help: 'Duration of HTTP requests in microseconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 5, 15, 50, 100, 500]
});

// Error metrics
const httpErrors = new promClient.Counter({
    name: 'http_errors_total',
    help: 'Total number of HTTP errors',
    labelNames: ['method', 'route', 'code']
});

// Database metrics
const dbQueryDuration = new promClient.Histogram({
    name: 'db_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['collection', 'operation'],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5]
});

// Winston logger configuration
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new transports.Console({
            format: combine(
                timestamp(),
                prettyPrint()
            )
        }),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' })
    ]
});

// Monitoring middleware
const monitoringMiddleware = (req, res, next) => {
    const start = process.hrtime();
    const method = req.method;
    const route = req.route.path;

    res.on('finish', () => {
        const duration = process.hrtime(start);
        const microseconds = duration[0] * 1e6 + duration[1] / 1e3;
        
        httpRequestDurationMicroseconds
            .labels(method, route, res.statusCode)
            .observe(microseconds);

        if (res.statusCode >= 400) {
            httpErrors.labels(method, route, res.statusCode).inc();
        }

        logger.info('Request completed', {
            method,
            route,
            statusCode: res.statusCode,
            duration: microseconds,
            timestamp: new Date()
        });
    });

    next();
};

// Database monitoring middleware
const dbMonitoringMiddleware = (method, collection) => {
    return async (next) => {
        const start = process.hrtime();
        try {
            await next();
            const duration = process.hrtime(start);
            const seconds = duration[0] + duration[1] / 1e9;
            dbQueryDuration.labels(collection, method).observe(seconds);
        } catch (error) {
            logger.error('Database error', {
                method,
                collection,
                error: error.message,
                timestamp: new Date()
            });
            throw error;
        }
    };
};

// Prometheus metrics endpoint
const metricsRouter = express.Router();
metricsRouter.get('/metrics', (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
});

module.exports = {
    register,
    monitoringMiddleware,
    dbMonitoringMiddleware,
    metricsRouter,
    logger
};

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import cors from 'cors';
import { createLogger, format, transports } from 'winston';
import promClient from 'prom-client';

// Security logger
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
        new transports.File({ filename: 'security.log' })
    ]
});

// Prometheus metrics
const register = new promClient.Registry();

// Security metrics
const securityMetrics = {
    rateLimit: new promClient.Counter({
        name: 'security_rate_limit_exceeded',
        help: 'Number of rate limit exceeded attempts',
        labelNames: ['ip', 'endpoint']
    }),
    corsBlocked: new promClient.Counter({
        name: 'security_cors_blocked',
        help: 'Number of CORS blocked requests',
        labelNames: ['origin']
    }),
    xssAttempts: new promClient.Counter({
        name: 'security_xss_attempts',
        help: 'Number of XSS attempts detected',
        labelNames: ['type']
    }),
    csrfAttempts: new promClient.Counter({
        name: 'security_csrf_attempts',
        help: 'Number of CSRF attempts detected',
        labelNames: ['method']
    }),
    sqlInjectionAttempts: new promClient.Counter({
        name: 'security_sql_injection_attempts',
        help: 'Number of SQL injection attempts detected',
        labelNames: ['type']
    })
};

// Rate limiting with enhanced features
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Allow requests from specific IPs
        const allowedIps = process.env.ALLOWED_IPS?.split(',') || [];
        return allowedIps.includes(req.ip);
    },
    handler: (req, res, next) => {
        securityMetrics.rateLimit.labels(req.ip, req.path).inc();
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            endpoint: req.path,
            timestamp: new Date()
        });
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.'
        });
    }
});

// Enhanced security headers
const securityHeaders = (req, res, next) => {
    // Content Security Policy
    const csp = [
        "default-src 'self' https:;",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;",
        "style-src 'self' 'unsafe-inline' https:;",
        "img-src 'self' data: https:;",
        "connect-src 'self' https:;",
        "font-src 'self' https:;",
        "object-src 'none';",
        "media-src 'self' https:;",
        "frame-src 'self' https:;",
        "child-src 'self' https:;",
        "form-action 'self' https:;",
        "base-uri 'self';",
        "manifest-src 'self' https:;",
        "frame-ancestors 'none';"
    ].join(' ');

    res.setHeader('Content-Security-Policy', csp);
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Expect-CT', 'max-age=86400, enforce');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-WebKit-CSP', csp);
    
    next();
};

// Enhanced CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['*'];
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            securityMetrics.corsBlocked.labels(origin).inc();
            logger.warn('CORS blocked request', {
                origin,
                timestamp: new Date()
            });
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// XSS protection middleware
const xssProtection = (req, res, next) => {
    const xss = require('xss');
    const xssFilter = new xss.FilterXSS({
        whiteList: {
            a: ['href', 'title', 'target'],
            img: ['src', 'alt', 'title'],
            br: [],
            strong: [],
            em: [],
            p: [],
            span: ['class', 'style'],
            div: ['class', 'style']
        },
        stripIgnoreTagBody: { script: true, style: true }
    });

    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                const originalValue = req.body[key];
                const sanitizedValue = xssFilter.process(originalValue);
                if (originalValue !== sanitizedValue) {
                    securityMetrics.xssAttempts.labels('body').inc();
                    logger.warn('XSS attempt detected in body', {
                        field: key,
                        timestamp: new Date()
                    });
                }
                req.body[key] = sanitizedValue;
            }
        });
    }

    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                const originalValue = req.query[key];
                const sanitizedValue = xssFilter.process(originalValue);
                if (originalValue !== sanitizedValue) {
                    securityMetrics.xssAttempts.labels('query').inc();
                    logger.warn('XSS attempt detected in query', {
                        field: key,
                        timestamp: new Date()
                    });
                }
                req.query[key] = sanitizedValue;
            }
        });
    }

    next();
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
    const csrf = require('csurf')();
    
    if (req.method === 'GET') {
        next();
        return;
    }

    const token = req.body._csrf || req.query._csrf || req.headers['x-csrf-token'];
    
    if (!token) {
        securityMetrics.csrfAttempts.labels(req.method).inc();
        logger.warn('CSRF token missing', {
            method: req.method,
            endpoint: req.path,
            timestamp: new Date()
        });
        res.status(403).json({
            success: false,
            message: 'CSRF token missing'
        });
        return;
    }

    csrf(req, res, (err) => {
        if (err) {
            securityMetrics.csrfAttempts.labels(req.method).inc();
            logger.warn('CSRF token invalid', {
                method: req.method,
                endpoint: req.path,
                timestamp: new Date()
            });
            res.status(403).json({
                success: false,
                message: 'Invalid CSRF token'
            });
            return;
        }
        next();
    });
};

// Security monitoring middleware
const securityMonitoring = (req, res, next) => {
    const start = process.hrtime();
    
    res.on('finish', () => {
        const duration = process.hrtime(start);
        const seconds = duration[0] + duration[1] / 1e9;
        
        logger.info('Request completed', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: seconds,
            timestamp: new Date()
        });
    });

    next();
};

const securityMiddleware = (app) => {
    // Rate limiting
    app.use(apiLimiter);

    // Security headers
    app.use(securityHeaders);

    // Force HTTPS
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(`https://${req.hostname}${req.url}`);
        }
        next();
    });

    // CORS
    app.use(cors(corsOptions));

    // XSS protection
    app.use(xssProtection);

    // CSRF protection
    app.use(csrfProtection);

    // Security monitoring
    app.use(securityMonitoring);

    // XSS Protection
    app.use(helmet.xssFilter());
    app.use(helmet.frameguard({ action: 'deny' }));
    app.use(helmet.noSniff());
    app.use(helmet.ieNoOpen());

    // Request validation middleware
    app.use((req, res, next) => {
        // Validate request body for SQL injection
        if (req.body) {
            for (const key in req.body) {
                if (req.body[key]) {
                    if (req.body[key].match(/[-'";]+/)) {
                        return res.status(400).json({
                            error: 'Invalid input detected',
                            details: 'Special characters not allowed in input'
                        });
                    }
                }
            }
        }
        next();
    });

    // Enable CORS with security
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
        next();
    });

    // Request ID for tracking
    app.use((req, res, next) => {
        req.requestId = crypto.randomBytes(16).toString('hex');
        res.header('X-Request-ID', req.requestId);
        next();
    });
};

module.exports = securityMiddleware;

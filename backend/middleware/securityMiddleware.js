import rateLimit from 'express-rate-limit';
import { IpBlacklist } from '../models/IpBlacklist.js';
import { AuditLog } from '../models/AuditLog.js';
import { validatePassword, generateToken } from '../utils/security.js';

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Check if IP is blacklisted
const checkIpBlacklist = async (req, res, next) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const blacklist = await IpBlacklist.findOne({
            ipAddress: ip,
            active: true
        });

        if (blacklist) {
            await AuditLog.create({
                action: 'BLACKLISTED_IP_ACCESS',
                ipAddress: ip,
                userAgent: req.headers['user-agent'] || 'Unknown',
                success: false,
                details: {
                    reason: blacklist.reason
                }
            });

            return res.status(403).json({
                error: 'Access denied. Your IP address is blacklisted.',
                reason: blacklist.reason
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

// IP-based rate limiting
const ipRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per minute
    message: 'Too many requests from this IP address.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress;
    }
});

// Request validation
const validateRequest = (req, res, next) => {
    // Check for common attack patterns
    const attackPatterns = [
        /<script>/i,
        /alert\(/i,
        /onerror=/i,
        /onload=/i,
        /onclick=/i,
        /onchange=/i,
        /eval\(/i,
        /\bwindow\./i,
        /document\.cookie/i,
        /document\.write/i
    ];

    // Check request body
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                for (const pattern of attackPatterns) {
                    if (pattern.test(req.body[key])) {
                        return res.status(400).json({
                            error: 'Invalid input detected',
                            details: 'Suspicious input pattern detected'
                        });
                    }
                }
            }
        }
    }

    // Check URL parameters
    if (req.query) {
        for (const key in req.query) {
            if (typeof req.query[key] === 'string') {
                for (const pattern of attackPatterns) {
                    if (pattern.test(req.query[key])) {
                        return res.status(400).json({
                            error: 'Invalid input detected',
                            details: 'Suspicious URL parameter detected'
                        });
                    }
                }
            }
        }
    }

    next();
};

// Security headers
const addSecurityHeaders = (req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Content-Security-Policy', `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        connect-src 'self' ${process.env.FRONTEND_URL};
        font-src 'self' https:;
        object-src 'none';
        media-src 'self' https:;
        frame-src 'self'
    `);
    next();
};

// Audit logging middleware
const auditLogging = async (req, res, next) => {
    try {
        const action = req.method === 'GET' ? 'REQUEST' : 'ACTION';
        const success = true; // Will be updated if error occurs

        // Create audit log entry
        const auditLog = await AuditLog.create({
            action,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'] || 'Unknown',
            success,
            details: {
                method: req.method,
                path: req.path,
                query: req.query,
                body: req.body
            },
            metadata: {
                requestId: req.requestId
            }
        });

        // Add audit log ID to request for reference
        req.auditLogId = auditLog._id;

        next();
    } catch (error) {
        next(error);
    }
};

export {
    apiLimiter,
    checkIpBlacklist,
    ipRateLimit,
    validateRequest,
    addSecurityHeaders,
    auditLogging
};

import { createLogger, format, transports } from 'winston';
import promClient from 'prom-client';
import { securityMetrics } from '../middleware/security.js';

// Security event types
const EVENT_TYPES = {
    AUTHENTICATION: 'authentication',
    ACCESS: 'access',
    RATE_LIMIT: 'rate_limit',
    XSS: 'xss',
    CSRF: 'csrf',
    CORS: 'cors',
    SQL_INJECTION: 'sql_injection'
};

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
        new transports.File({ filename: 'security_events.log' })
    ]
});

// Prometheus metrics
const securityEvents = new promClient.Counter({
    name: 'security_events_total',
    help: 'Total number of security events',
    labelNames: ['type', 'outcome', 'severity']
});

const securityAlerts = new promClient.Gauge({
    name: 'security_alerts_active',
    help: 'Number of active security alerts',
    labelNames: ['type', 'severity']
});

// IP blocking list
const blockedIps = new Set();
const ipBlockDuration = 15 * 60 * 1000; // 15 minutes

// Security event monitoring service
class SecurityMonitoring {
    constructor() {
        // Initialize alert thresholds
        this.alertThresholds = {
            rateLimit: 50, // Number of rate limit violations per minute
            authFailures: 10, // Number of failed auth attempts per minute
            xssAttempts: 5, // Number of XSS attempts per minute
            csrfAttempts: 3 // Number of CSRF attempts per minute
        };

        // Initialize counters
        this.eventCounters = {
            rateLimit: 0,
            authFailures: 0,
            xssAttempts: 0,
            csrfAttempts: 0
        };

        // Initialize last reset time
        this.lastReset = Date.now();

        // Start periodic monitoring
        this.startMonitoring();
    }

    // Log security event
    logEvent(type, data, severity = 'info') {
        logger[severity]({
            type,
            timestamp: new Date(),
            data,
            severity
        });

        securityEvents.labels(type, data.outcome || 'unknown', severity).inc();
    }

    // Block IP address
    blockIp(ip, duration = ipBlockDuration) {
        blockedIps.add(ip);
        setTimeout(() => {
            blockedIps.delete(ip);
        }, duration);
    }

    // Check if IP is blocked
    isIpBlocked(ip) {
        return blockedIps.has(ip);
    }

    // Monitor security events
    monitorEvents() {
        const now = Date.now();
        const timeDiff = now - this.lastReset;

        if (timeDiff >= 60000) { // 1 minute
            // Check for threshold violations
            Object.entries(this.eventCounters).forEach(([type, count]) => {
                if (count >= this.alertThresholds[type]) {
                    this.logEvent('alert', {
                        type,
                        count,
                        threshold: this.alertThresholds[type],
                        severity: 'high'
                    }, 'warn');

                    securityAlerts.labels(type, 'high').inc();
                }
            });

            // Reset counters
            this.eventCounters = {
                rateLimit: 0,
                authFailures: 0,
                xssAttempts: 0,
                csrfAttempts: 0
            };

            this.lastReset = now;
        }
    }

    // Start periodic monitoring
    startMonitoring() {
        setInterval(() => {
            this.monitorEvents();
        }, 10000); // Check every 10 seconds
    }

    // Track security event
    trackEvent(type, data) {
        if (type in this.eventCounters) {
            this.eventCounters[type]++;
        }

        this.logEvent(type, data);
    }

    // Get current security metrics
    getMetrics() {
        return {
            events: securityEvents.collect(),
            alerts: securityAlerts.collect(),
            blockedIps: Array.from(blockedIps),
            thresholds: this.alertThresholds
        };
    }
}

// Export singleton instance
const securityMonitoring = new SecurityMonitoring();
module.exports = securityMonitoring;

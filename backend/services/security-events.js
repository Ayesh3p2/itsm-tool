import { securityMonitoring } from './security-monitoring.js';

// Security event handler
class SecurityEvents {
    constructor() {
        this.handlers = {
            'authentication': this.handleAuthenticationEvent.bind(this),
            'access': this.handleAccessEvent.bind(this),
            'rate_limit': this.handleRateLimitEvent.bind(this),
            'xss': this.handleXSSEvent.bind(this),
            'csrf': this.handleCSRFEvent.bind(this),
            'cors': this.handleCORSEvent.bind(this),
            'sql_injection': this.handleSQLInjectionEvent.bind(this)
        };
    }

    // Handle authentication events
    handleAuthenticationEvent(event) {
        if (event.outcome === 'failed') {
            securityMonitoring.trackEvent('authFailures', {
                username: event.username,
                ip: event.ip,
                timestamp: event.timestamp
            });

            // Block IP after multiple failed attempts
            if (event.attempts >= 5) {
                securityMonitoring.blockIp(event.ip);
            }
        }
    }

    // Handle access events
    handleAccessEvent(event) {
        if (event.outcome === 'denied') {
            securityMonitoring.trackEvent('access_denied', {
                resource: event.resource,
                ip: event.ip,
                timestamp: event.timestamp
            });
        }
    }

    // Handle rate limit events
    handleRateLimitEvent(event) {
        securityMonitoring.trackEvent('rateLimit', {
            ip: event.ip,
            endpoint: event.endpoint,
            timestamp: event.timestamp
        });
    }

    // Handle XSS events
    handleXSSEvent(event) {
        securityMonitoring.trackEvent('xssAttempts', {
            type: event.type,
            ip: event.ip,
            timestamp: event.timestamp
        });
    }

    // Handle CSRF events
    handleCSRFEvent(event) {
        securityMonitoring.trackEvent('csrfAttempts', {
            method: event.method,
            ip: event.ip,
            timestamp: event.timestamp
        });
    }

    // Handle CORS events
    handleCORSEvent(event) {
        if (event.outcome === 'blocked') {
            securityMonitoring.trackEvent('corsBlocked', {
                origin: event.origin,
                ip: event.ip,
                timestamp: event.timestamp
            });
        }
    }

    // Handle SQL injection events
    handleSQLInjectionEvent(event) {
        securityMonitoring.trackEvent('sql_injection', {
            query: event.query,
            ip: event.ip,
            timestamp: event.timestamp
        });
    }

    // Process security event
    processEvent(event) {
        const handler = this.handlers[event.type];
        if (handler) {
            handler(event);
        }
    }

    // Get current security status
    getStatus() {
        return {
            activeAlerts: securityMonitoring.getMetrics().alerts,
            blockedIps: securityMonitoring.getMetrics().blockedIps,
            recentEvents: securityMonitoring.getMetrics().events
        };
    }
}

// Export singleton instance
const securityEvents = new SecurityEvents();
module.exports = securityEvents;

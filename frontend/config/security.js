const securityConfig = {
    // Content Security Policy (CSP)
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", process.env.REACT_APP_API_URL],
            fontSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "https:"],
            frameSrc: ["'self'"]
        }
    },

    // Console protection
    consoleProtection: {
        enabled: true,
        message: "Developer console access is disabled for security reasons.",
        methods: ['log', 'info', 'warn', 'error', 'debug', 'trace', 'dir', 'table', 'time', 'timeEnd', 'count', 'clear', 'assert']
    },

    // Code integrity
    codeIntegrity: {
        enabled: true,
        checkInterval: 5000, // 5 seconds
        criticalFiles: [
            '/index.html',
            '/static/js/main.*.js',
            '/static/css/main.*.css'
        ]
    },

    // XSS protection
    xssProtection: {
        enabled: true,
        stripHtml: true,
        allowedTags: ['p', 'span', 'div', 'a', 'img', 'strong', 'em', 'ul', 'li', 'br'],
        allowedAttributes: ['href', 'src', 'alt', 'title']
    },

    // CSP headers
    securityHeaders: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    },

    // CSP nonce generation
    nonce: () => {
        return crypto.randomUUID();
    },

    // CSP report URI
    reportUri: process.env.REACT_APP_CSP_REPORT_URI || '/api/security/csp-report'
};

export default securityConfig;

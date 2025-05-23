const securityConfig = {
    jwtSecret: process.env.REACT_APP_JWT_SECRET || 'your-default-secret-key',
    passwordRequirements: {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
    },
    rateLimit: {
        windowMs: parseInt(process.env.REACT_APP_RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.REACT_APP_RATE_LIMIT_MAX) || 100
    },
    passwordReset: {
        tokenExpiration: 24 * 60 * 60 * 1000, // 24 hours
        emailTemplate: 'password-reset-template'
    },
    securityHeaders: {
        xssProtection: '1; mode=block',
        contentSecurityPolicy: "default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;",
        frameOptions: 'DENY',
        referrerPolicy: 'strict-origin-when-cross-origin'
    }
};

export default securityConfig;

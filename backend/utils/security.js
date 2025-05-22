const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Password complexity requirements
const validatePassword = (password) => {
    const requirements = {
        minLength: 8,
        maxLength: 128,
        hasNumber: /[0-9]/,
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
        hasLower: /[a-z]/,
        hasUpper: /[A-Z]/
    };

    const errors = [];

    if (password.length < requirements.minLength) {
        errors.push(`Password must be at least ${requirements.minLength} characters`);
    }

    if (password.length > requirements.maxLength) {
        errors.push(`Password must not exceed ${requirements.maxLength} characters`);
    }

    if (!requirements.hasNumber.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!requirements.hasSpecial.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    if (!requirements.hasLower.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!requirements.hasUpper.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    return errors;
};

// Two-factor authentication
const generate2FA = async (user) => {
    const secret = speakeasy.generateSecret({
        name: 'ITSM Tool - ' + user.email,
        length: 20
    });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    return {
        secret: secret.base32,
        qrCode
    };
};

const verify2FA = (secret, token) => {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1
    });
};

// Session management
const generateSessionToken = (userId, role) => {
    const payload = {
        user: {
            id: userId,
            role
        },
        iat: Date.now()
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m' // 15 minute session timeout
    });
};

const validateSession = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
};

// Secure random token generation
const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Password hashing
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

module.exports = {
    validatePassword,
    generate2FA,
    verify2FA,
    generateSessionToken,
    validateSession,
    generateSecureToken,
    hashPassword,
    comparePassword
};

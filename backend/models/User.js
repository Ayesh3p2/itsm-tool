const mongoose = require('mongoose');
const security = require('../utils/security');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 128
    },
    role: {
        type: String,
        enum: ['employee', 'admin'],
        default: 'employee'
    },
    twoFactorSecret: {
        type: String,
        select: false // Don't return in queries
    },
    is2FAEnabled: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        userAgent: {
            type: String,
            required: true
        },
        ipAddress: {
            type: String,
            required: true
        },
        lastAccess: {
            type: Date,
            default: Date.now
        }
    }],
    googleId: {
        type: String,
        unique: true
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    },
    slackId: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password comparison result:', isMatch);
        return isMatch;
    } catch (err) {
        console.error('Error comparing password:', err);
        throw err;
    }
};

module.exports = mongoose.model('User', UserSchema);

import mongoose from 'mongoose';

const ipBlacklistSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                // Simple IP address validation
                return /^(\d{1,3}\.){3}\d{1,3}$/.test(v);
            },
            message: 'Invalid IP address format'
        }
    },
    reason: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    failedAttempts: {
        type: Number,
        default: 0
    },
    lastFailedAttempt: {
        type: Date
    },
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

// TTL index for automatic cleanup (keep records for 1 year)
ipBlacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export const IpBlacklist = mongoose.model('IpBlacklist', ipBlacklistSchema);

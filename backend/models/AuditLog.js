import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN',
            'LOGOUT',
            'PASSWORD_CHANGE',
            '2FA_ENABLE',
            '2FA_DISABLE',
            'SESSION_CREATE',
            'SESSION_DESTROY',
            'ACCOUNT_LOCK',
            'ACCOUNT_UNLOCK',
            'FAILED_LOGIN',
            'SUCCESSFUL_LOGIN'
        ]
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    details: {
        type: Object,
        default: {}
    },
    success: {
        type: Boolean,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

// Index for faster querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });

// TTL index for automatic cleanup (keep logs for 90 days)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

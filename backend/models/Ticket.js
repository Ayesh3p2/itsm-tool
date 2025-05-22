const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Open'
    },
    priority: {
        type: String,
        default: 'Medium'
    },
    approvalStatus: {
        type: String,
        default: 'Pending'
    },
    approvalLevel: {
        type: Number,
        default: 1
    },
    currentApprover: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalHistory: [{
        level: Number,
        approver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: String,
        comments: String,
        rejectionReason: String,
        timestamp: Date
    }],
    rejectionReason: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        timestamp: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastApprovalReminder: Date,
    escalationLevel: {
        type: Number,
        default: 0
    },
    escalationReason: String,
    approvalTimeout: {
        type: Number,
        default: 24
    }
});

// Update updatedAt timestamp
ticketSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);

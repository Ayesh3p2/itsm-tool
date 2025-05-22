const IpBlacklist = require('../models/IpBlacklist');
const AuditLog = require('../models/AuditLog');
const security = require('../utils/security');

// Add IP to blacklist
const blacklistIp = async (req, res) => {
    try {
        const { ipAddress, reason } = req.body;

        // Validate IP address
        if (!ipAddress.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
            return res.status(400).json({ error: 'Invalid IP address format' });
        }

        // Check if IP is already blacklisted
        const existing = await IpBlacklist.findOne({ ipAddress });
        if (existing && existing.active) {
            return res.status(400).json({ error: 'IP is already blacklisted' });
        }

        // Create or update blacklist entry
        const blacklist = await IpBlacklist.findOneAndUpdate(
            { ipAddress },
            {
                reason,
                createdBy: req.user.id,
                active: true,
                failedAttempts: 0
            },
            { upsert: true, new: true }
        );

        res.json({
            msg: 'IP address blacklisted successfully',
            blacklist
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove IP from blacklist
const unblacklistIp = async (req, res) => {
    try {
        const { ipAddress } = req.body;

        const blacklist = await IpBlacklist.findOneAndUpdate(
            { ipAddress },
            {
                active: false
            },
            { new: true }
        );

        if (!blacklist) {
            return res.status(404).json({ error: 'IP not found in blacklist' });
        }

        res.json({
            msg: 'IP address removed from blacklist',
            blacklist
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get audit logs
const getAuditLogs = async (req, res) => {
    try {
        const { userId, action, startDate, endDate, page = 1, limit = 20 } = req.query;

        const query = {};
        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (startDate) query.timestamp = { $gte: new Date(startDate) };
        if (endDate) {
            if (!query.timestamp) query.timestamp = {};
            query.timestamp.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'name email');

        const total = await AuditLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalLogs: total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get blacklisted IPs
const getBlacklistedIps = async (req, res) => {
    try {
        const { page = 1, limit = 20, active = true } = req.query;

        const blacklisted = await IpBlacklist.find({ active })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('createdBy', 'name email');

        const total = await IpBlacklist.countDocuments({ active });

        res.json({
            blacklisted,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalBlacklisted: total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get suspicious activities
const getSuspiciousActivities = async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 20 } = req.query;

        const query = {
            $or: [
                { action: 'FAILED_LOGIN' },
                { action: 'BLACKLISTED_IP_ACCESS' },
                { success: false }
            ]
        };

        if (startDate) query.timestamp = { $gte: new Date(startDate) };
        if (endDate) {
            if (!query.timestamp) query.timestamp = {};
            query.timestamp.$lte = new Date(endDate);
        }

        const activities = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'name email');

        const total = await AuditLog.countDocuments(query);

        res.json({
            activities,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalActivities: total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    blacklistIp,
    unblacklistIp,
    getAuditLogs,
    getBlacklistedIps,
    getSuspiciousActivities
};

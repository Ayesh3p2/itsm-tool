import express from 'express';
import { securityEvents } from '../services/security-events.js';
import { securityMonitoring } from '../services/security-monitoring.js';

const router = express.Router();

// Get security status
router.get('/status', async (req, res) => {
    try {
        const status = securityEvents.getStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get security status',
            error: error.message
        });
    }
});

// Get security metrics
router.get('/metrics', async (req, res) => {
    try {
        const metrics = securityMonitoring.getMetrics();
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get security metrics',
            error: error.message
        });
    }
});

// Get blocked IPs
router.get('/blocked-ips', async (req, res) => {
    try {
        const blockedIps = Array.from(securityMonitoring.blockedIps);
        res.json({
            success: true,
            data: blockedIps
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get blocked IPs',
            error: error.message
        });
    }
});

// Unblock IP
router.post('/unblock-ip', async (req, res) => {
    try {
        const { ip } = req.body;
        if (!ip) {
            return res.status(400).json({
                success: false,
                message: 'IP address is required'
            });
        }

        securityMonitoring.blockedIps.delete(ip);
        res.json({
            success: true,
            message: `IP ${ip} has been unblocked`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to unblock IP',
            error: error.message
        });
    }
});

// Get recent security events
router.get('/events', async (req, res) => {
    try {
        const events = await securityEvents.getRecentEvents();
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get security events',
            error: error.message
        });
    }
});

module.exports = router;

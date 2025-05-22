const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getApprovalTimeStats } = require('../services/approvalService');

// Get approval time statistics
router.get('/approvals', [auth], async (req, res) => {
    try {
        const stats = await getApprovalTimeStats();
        res.json(stats);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;

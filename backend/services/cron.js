const cron = require('node-cron');
const approvalService = require('./approvalService');

// Every 15 minutes
const checkPendingApprovals = cron.schedule('*/15 * * * *', async () => {
    console.log('Checking for pending approvals...');
    await approvalService.processPendingApprovals();
});

// Start the cron job
checkPendingApprovals.start();

module.exports = {
    checkPendingApprovals
};

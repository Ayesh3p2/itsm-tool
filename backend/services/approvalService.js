const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { sendApprovalNotification, sendRejectionNotification } = require('../config/email');
const { sendApprovalNotification: sendSlackApproval, sendRejectionNotification: sendSlackRejection } = require('../config/slack');

// Check and process pending approvals
const processPendingApprovals = async () => {
    try {
        // Find all tickets pending approval
        const tickets = await Ticket.find({
            approvalStatus: { $in: ['Pending', 'Level1 Approved'] },
            status: { $ne: 'Rejected' }
        });

        for (const ticket of tickets) {
            // Check if approval has timed out
            const timeoutHours = ticket.approvalTimeout;
            const lastReminder = ticket.lastApprovalReminder || ticket.createdAt;
            const timeSinceReminder = (Date.now() - lastReminder.getTime()) / (1000 * 60 * 60);

            if (timeSinceReminder >= timeoutHours) {
                // Check escalation level
                const escalationLevel = ticket.escalationLevel;
                const user = await User.findById(ticket.currentApprover);

                if (escalationLevel === 0) {
                    // First escalation: Send reminder
                    await sendReminder(ticket, user);
                    ticket.lastApprovalReminder = new Date();
                    ticket.escalationLevel = 1;
                    ticket.escalationReason = 'Initial reminder';
                } else if (escalationLevel === 1) {
                    // Second escalation: Escalate to next level
                    await escalateApproval(ticket);
                }

                await ticket.save();
            }
        }
    } catch (error) {
        console.error('Error processing pending approvals:', error);
    }
};

// Send approval reminder
const sendReminder = async (ticket, user) => {
    try {
        const subject = `Reminder: Pending Approval for Ticket #${ticket._id}`;
        const message = `This is a reminder that you have a pending approval for the ticket titled "${ticket.title}".`;
        
        // Send email reminder
        await sendApprovalNotification(user.email, subject, message);
        
        // Send Slack reminder
        await sendSlackApproval(ticket, user, ticket.approvalLevel);
    } catch (error) {
        console.error('Error sending approval reminder:', error);
    }
};

// Escalate approval to next level
const escalateApproval = async (ticket) => {
    try {
        // Get current approver
        const currentApprover = await User.findById(ticket.currentApprover);
        
        // Find next approver based on escalation rules
        let nextApprover = null;
        
        if (ticket.approvalLevel === 1) {
            // Level 1 -> Escalate to CTO
            nextApprover = await User.findOne({ email: 'chaithanya@company.com' });
        } else if (ticket.approvalLevel === 2) {
            // Level 2 -> Escalate to Admin
            nextApprover = await User.findOne({ role: 'admin' });
        }

        if (nextApprover) {
            // Update ticket with new approver
            ticket.currentApprover = nextApprover._id;
            ticket.escalationLevel = 2;
            ticket.escalationReason = 'Escalated due to timeout';
            
            // Add escalation to approval history
            ticket.approvalHistory.push({
                level: ticket.approvalLevel,
                approver: currentApprover._id,
                status: 'Escalated',
                comments: 'Approval timed out',
                escalationLevel: 2,
                escalationReason: 'Escalated due to timeout'
            });

            // Notify new approver
            const subject = `Escalated Approval: Ticket #${ticket._id}`;
            const message = `This approval has been escalated to you due to timeout. Please review ticket titled "${ticket.title}".`;
            
            await sendApprovalNotification(nextApprover.email, subject, message);
            await sendSlackApproval(ticket, nextApprover, ticket.approvalLevel);
        }
    } catch (error) {
        console.error('Error escalating approval:', error);
    }
};

// Get approval time statistics
const getApprovalTimeStats = async () => {
    try {
        const stats = await Ticket.aggregate([
            {
                $match: {
                    status: 'Approved',
                    createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
                }
            },
            {
                $project: {
                    approvalTime: {
                        $subtract: [
                            {
                                $ifNull: [
                                    {
                                        $arrayElemAt: [
                                            "$approvalHistory.timestamp",
                                            {
                                                $subtract: [
                                                    {
                                                        $size: "$approvalHistory"
                                                    },
                                                    1
                                                ]
                                            }
                                        ]
                                    },
                                    "$createdAt"
                                ]
                            },
                            "$createdAt"
                        ]
                    },
                    type: 1
                }
            },
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    avgTime: { $avg: "$approvalTime" },
                    maxTime: { $max: "$approvalTime" },
                    minTime: { $min: "$approvalTime" }
                }
            }
        ]);

        // Convert milliseconds to hours
        return stats.map(stat => ({
            ...stat,
            avgTime: Math.round(stat.avgTime / (1000 * 60 * 60)),
            maxTime: Math.round(stat.maxTime / (1000 * 60 * 60)),
            minTime: Math.round(stat.minTime / (1000 * 60 * 60))
        }));
    } catch (error) {
        console.error('Error getting approval time stats:', error);
        return [];
    }
};

module.exports = {
    processPendingApprovals,
    sendReminder,
    escalateApproval,
    getApprovalTimeStats
};

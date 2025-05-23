import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import canApproveTicket from '../middleware/approval.js';
import { Ticket } from '../models/Ticket.js';
import { User } from '../models/User.js';
import { sendApprovalNotification as emailApproval, sendRejectionNotification as emailRejection } from '../config/email.js';
import { sendApprovalNotification as slackApproval, sendRejectionNotification as slackRejection } from '../config/slack.js';

// Get tickets pending approval for current user
router.get('/pending', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).exec();
        
        // Get tickets pending Level 1 approval if user is manager
        if (user.role === 'manager') {
            const tickets = await Ticket.find({
                approvalStatus: 'Pending',
                approvalLevel: 1
            });
            return res.json(tickets);
        }
        
        // Get tickets pending Level 2 approval if user is CTO
        if (user.role === 'cto') {
            const tickets = await Ticket.find({
                approvalStatus: 'Level1 Approved',
                approvalLevel: 2
            });
            return res.json(tickets);
        }
        
        res.json([]);
    } catch (err) {
        console.error('Error fetching pending approvals:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Approve ticket
router.post('/:ticketId/approve', [auth, canApproveTicket], async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { approvalLevel, comments } = req.body;
        
        if (!comments) {
            return res.status(400).json({
                message: 'Missing required fields',
                error: 'Comments are required for approval'
            });
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ 
                message: 'Ticket not found', 
                error: 'No ticket found with the specified ID' 
            });
        }

        // Update approval status
        if (approvalLevel === 1) {
            ticket.approvalStatus = 'Level1 Approved';
            ticket.status = 'Pending'; // Level 1 approval keeps ticket in pending state
            ticket.currentApprover = null;
        } else if (approvalLevel === 2) {
            ticket.approvalStatus = 'Level2 Approved';
            ticket.status = 'Approved';
            ticket.currentApprover = null;
        } else {
            return res.status(400).json({ 
                message: 'Invalid approval level', 
                error: 'Approval level must be 1 or 2' 
            });
        }

        // Add to approval history
        ticket.approvalHistory.push({
            level: approvalLevel,
            approver: req.user.id,
            status: 'Approved',
            comments,
            timestamp: new Date()
        });

        await ticket.save();
        
        // Send notifications
        await emailApproval(req.user, ticket, comments, 'email');
        slackApproval(req.user, ticket, comments);

        res.json({
            message: 'Ticket approved successfully',
            ticket,
            approvalLevel: approvalLevel
        });
    } catch (err) {
        console.error('Error approving ticket:', err);
        res.status(500).json({ 
            message: 'Server Error', 
            error: err.message 
        });
    }
});

// Reject ticket
router.post('/:ticketId/reject', [auth, canApproveTicket], async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { reason, comments } = req.body;
        
        if (!reason) {
            return res.status(400).json({ 
                message: 'Missing rejection reason', 
                error: 'Rejection reason is required' 
            });
        }

        if (!comments) {
            return res.status(400).json({
                message: 'Missing required fields',
                error: 'Comments are required for rejection'
            });
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ 
                message: 'Ticket not found', 
                error: 'No ticket found with the specified ID' 
            });
        }

        // Update ticket status
        ticket.status = 'Rejected';
        ticket.approvalStatus = 'Rejected';
        ticket.rejectionReason = reason;
        ticket.currentApprover = null;

        // Add to approval history
        ticket.approvalHistory.push({
            level: ticket.approvalLevel,
            approver: req.user.id,
            status: 'Rejected',
            comments,
            rejectionReason: reason,
            timestamp: new Date()
        });

        await ticket.save();
        
        // Send notifications
        await emailRejection(req.user, ticket, reason, comments, 'email');
        slackRejection(req.user, ticket, reason, comments);

        res.json({
            message: 'Ticket rejected successfully',
            ticket,
            rejectionReason: reason
        });
    } catch (err) {
        console.error('Error rejecting ticket:', err);
        res.status(500).json({ 
            message: 'Server Error', 
            error: err.message 
        });
    }
});

// Get approval time statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await Ticket.aggregate([
            {
                $match: {
                    approvalStatus: { $in: ['Level1 Approved', 'Level2 Approved'] }
                }
            },
            {
                $group: {
                    _id: '$approvalLevel',
                    averageTime: {
                        $avg: {
                            $subtract: ['$updatedAt', '$createdAt']
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    approvalLevel: '$_id',
                    averageTime: {
                        $divide: ['$averageTime', 1000 * 60 * 60] // Convert to hours
                    },
                    count: 1,
                    _id: 0
                }
            }
        ]);

        // Add descriptive labels
        const labeledStats = stats.map(stat => ({
            ...stat,
            label: stat.approvalLevel === 1 ? 'Manager Approval' : 'CTO Approval'
        }));

        res.json({
            message: 'Approval statistics retrieved successfully',
            data: labeledStats
        });
    } catch (err) {
        console.error('Error fetching approval statistics:', err);
        res.status(500).json({ 
            message: 'Server Error', 
            error: err.message 
        });
    }
});

export { router as default };

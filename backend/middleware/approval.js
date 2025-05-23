import { User } from '../models/User.js';
import { Ticket } from '../models/Ticket.js';

// Check if user has approval rights
const hasApprovalRights = async (userId, approvalLevel) => {
    const user = await User.findById(userId);
    
    // Level 1 approval (Reporting Manager)
    if (approvalLevel === 1 && user.role === 'manager') {
        return true;
    }
    
    // Level 2 approval (CTO)
    if (approvalLevel === 2 && user.role === 'cto') {
        return true;
    }
    
    return false;
};

// Check if ticket is ready for approval
const isTicketReadyForApproval = (ticket, approvalLevel) => {
    if (approvalLevel === 1) {
        return ticket.approvalStatus === 'Pending';
    }
    if (approvalLevel === 2) {
        return ticket.approvalStatus === 'Level1 Approved';
    }
    return false;
};

// Approval middleware
const canApproveTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.ticketId);
        if (!ticket) {
            return res.status(404).json({ 
                message: 'Ticket not found',
                error: 'No ticket found with the specified ID'
            });
        }

        const approvalLevel = req.body.approvalLevel || 1;
        
        // Check if user has approval rights
        const hasRights = await hasApprovalRights(req.user.id, approvalLevel);
        if (!hasRights) {
            return res.status(403).json({ 
                message: 'Not authorized',
                error: 'User does not have approval rights for this ticket'
            });
        }

        // Check if ticket is ready for approval
        if (!isTicketReadyForApproval(ticket, approvalLevel)) {
            return res.status(400).json({ 
                message: 'Invalid approval state',
                error: 'Ticket is not ready for this level of approval',
                currentStatus: ticket.approvalStatus,
                requiredStatus: approvalLevel === 1 ? 'Pending' : 'Level1 Approved'
            });
        }

        // Check if ticket is already approved at this level
        const isAlreadyApproved = ticket.approvalHistory.some(h => 
            h.level === approvalLevel && h.status === 'Approved'
        );
        if (isAlreadyApproved) {
            return res.status(400).json({ 
                message: 'Duplicate approval',
                error: 'Ticket has already been approved at this level',
                approvalLevel: approvalLevel
            });
        }

        // Check if ticket is currently being approved by someone else
        if (ticket.currentApprover && ticket.currentApprover !== req.user.id) {
            return res.status(400).json({
                message: 'Concurrent approval',
                error: 'Ticket is currently being approved by another user',
                currentApprover: ticket.currentApprover
            });
        }

        // Set current approver only if we're at the right approval level and haven't already approved
        if (isTicketReadyForApproval(ticket, approvalLevel)) {
            ticket.currentApprover = req.user.id;
            await ticket.save();
        }

        req.ticket = ticket;
        next();
    } catch (err) {
        console.error('Error in approval middleware:', err);
        res.status(500).json({ 
            message: 'Server error',
            error: err.message 
        });
    }
};

export { canApproveTicket, hasApprovalRights, isTicketReadyForApproval };

// Export default for compatibility
export default canApproveTicket;

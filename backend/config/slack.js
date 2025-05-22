const { WebClient } = require('@slack/web-api');

// Initialize the Slack client
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Send approval notification to Slack
const sendApprovalNotification = async (ticket, user, approvalLevel) => {
    try {
        const message = `*Ticket Approved - Level ${approvalLevel}*
        
        *Title:* ${ticket.title}
        *Type:* ${ticket.type}
        *Priority:* ${ticket.priority}
        *Status:* ${ticket.status}
        *Created By:* ${user.name}
        *Approved By:* ${user.name}
        *Comments:* ${ticket.approvalHistory[ticket.approvalHistory.length - 1].comments}
        
        <${process.env.APP_URL}/tickets/${ticket._id}|View Ticket>`;

        await slackClient.chat.postMessage({
            channel: process.env.SLACK_APPROVAL_CHANNEL,
            text: message,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: message
                    }
                }
            ]
        });
        return true;
    } catch (error) {
        console.error('Error sending Slack notification:', error);
        return false;
    }
};

// Send rejection notification to Slack
const sendRejectionNotification = async (ticket, user, reason) => {
    try {
        const message = `*Ticket Rejected*
        
        *Title:* ${ticket.title}
        *Type:* ${ticket.type}
        *Priority:* ${ticket.priority}
        *Status:* ${ticket.status}
        *Created By:* ${user.name}
        *Rejected By:* ${user.name}
        *Rejection Reason:* ${reason}
        
        <${process.env.APP_URL}/tickets/${ticket._id}|View Ticket>`;

        await slackClient.chat.postMessage({
            channel: process.env.SLACK_APPROVAL_CHANNEL,
            text: message,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: message
                    }
                }
            ]
        });
        return true;
    } catch (error) {
        console.error('Error sending Slack notification:', error);
        return false;
    }
};

module.exports = {
    sendApprovalNotification,
    sendRejectionNotification
};

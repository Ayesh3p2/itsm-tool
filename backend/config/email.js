const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test connection
transporter.verify((error, success) => {
    if (error) {
        console.log('Email service error:', error);
    } else {
        console.log('Email service ready:', success);
    }
});

// Send approval notification
const sendApprovalNotification = async (to, subject, message) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: `
            <h2>${subject}</h2>
            <p>${message}</p>
            <p>Please log in to the ITSM portal to review the ticket.</p>
            <p><a href="${process.env.APP_URL}">Go to ITSM Portal</a></p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Send rejection notification
const sendRejectionNotification = async (to, subject, message, rejectionReason) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: `
            <h2>${subject}</h2>
            <p>${message}</p>
            <p>Rejection Reason: ${rejectionReason}</p>
            <p>Please contact your IT department for further assistance.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendApprovalNotification,
    sendRejectionNotification
};

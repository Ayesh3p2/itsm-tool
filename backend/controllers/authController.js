const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Google OAuth callback handler
const googleCallback = async (req, res) => {
    try {
        // Generate JWT token
        const payload = {
            user: {
                id: req.user.id,
                role: req.user.role
            }
        };

        const token = await jwt.sign(payload, process.env.JWT_SECRET, { 
            expiresIn: '24h' 
        });

        // Redirect back to frontend with token
        res.redirect(`http://localhost:3000/dashboard?token=${token}`);
    } catch (err) {
        console.error('Error in Google OAuth callback:', err);
        res.redirect('http://localhost:3000/login?error=Authentication failed');
    }
};

module.exports = {
    googleCallback
};

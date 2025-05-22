const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google token and create JWT
router.post('/callback', async (req, res) => {
    try {
        const { credential } = req.body;
        
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        
        // Find or create user
        let user = await User.findOne({ email });
        
        if (!user) {
            user = new User({
                name: payload.name,
                email: payload.email,
                role: 'employee',
                googleId: payload.sub
            });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { user: { id: user.id, role: user.role } },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.status(400).json({ error: 'Invalid credentials' });
    }
});

module.exports = router;

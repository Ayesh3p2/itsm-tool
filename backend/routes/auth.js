import express from 'express';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { validatePassword, generate2FA, verify2FA, generateSessionToken, validateSession, generateSecureToken, hashPassword, comparePassword } from '../utils/security.js';
import { check, validationResult } from 'express-validator';

const router = Router();

// Register route
router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must meet complexity requirements').custom((value) => {
        const errors = security.validatePassword(value);
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password
        });

        await user.save();

        // Generate initial 2FA secret
        const { secret, qrCode } = await user.generate2FA();
        
        res.json({ 
            msg: 'Registration successful',
            user: user.toObject(),
            twoFactorSecret: secret,
            qrCode
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Enable 2FA
router.post('/2fa/enable', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { secret, qrCode } = await user.generate2FA();
        user.is2FAEnabled = true;
        await user.save();

        res.json({ 
            msg: '2FA enabled successfully',
            twoFactorSecret: secret,
            qrCode
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Disable 2FA
router.post('/2fa/disable', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.twoFactorSecret = undefined;
        user.is2FAEnabled = false;
        await user.save();

        res.json({ msg: '2FA disabled successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Verify 2FA token
router.post('/2fa/verify', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { token } = req.body;
        const isValid = user.verify2FA(token);

        if (!isValid) {
            return res.status(400).json({ msg: 'Invalid 2FA token' });
        }

        res.json({ msg: '2FA token verified' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login route with 2FA
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            user.failedLoginAttempts += 1;
            await user.save();
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(400).json({
                msg: 'Account locked. Please try again later',
                unlockTime: user.lockUntil
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            user.failedLoginAttempts += 1;
            await user.save();
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Reset failed attempts on successful login
        user.failedLoginAttempts = 0;
        user.lastLogin = Date.now();

        // Generate new session token
        const token = user.generateSession(req.headers['user-agent'], req.ip);
        await user.save();

        res.json({ 
            token,
            user: user.toObject(),
            twoFactorEnabled: user.is2FAEnabled
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get user data with session info
router.get('/user', async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -twoFactorSecret')
            .populate('sessions');
        
        res.json({
            user,
            sessions: user.sessions
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Logout route
router.post('/logout', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Remove the current session
        user.sessions = user.sessions.filter(session => 
            session.token !== req.headers.authorization.split(' ')[1]
        );

        await user.save();
        res.json({ msg: 'Logged out successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;

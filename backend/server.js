import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import jwt from 'jsonwebtoken';
import { default as authRoutes } from './routes/auth.js';
import { default as ticketRoutes } from './routes/tickets.js';
import { default as slackRoutes } from './routes/slack.js';
import { default as adminRoutes, admin } from './routes/admin.js';
import { default as approvalRoutes } from './routes/approvals.js';
import { default as statsRoutes } from './routes/stats.js';
import { default as securityRoutes } from './routes/security.js';
import { apiLimiter, checkIpBlacklist, ipRateLimit, validateRequest, addSecurityHeaders, auditLogging } from './middleware/securityMiddleware.js';

// Initialize security middleware
const app = express();

// Apply security middleware in order of importance
app.use(securityMiddleware.addSecurityHeaders);
app.use(securityMiddleware.apiLimiter);
app.use(securityMiddleware.checkIpBlacklist);
app.use(securityMiddleware.ipRateLimit);
app.use(securityMiddleware.validateRequest);
app.use(securityMiddleware.auditLogging);

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];


// Apply CORS middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours
}));

// Session middleware
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Ensure session is initialized before routes
app.use((req, res, next) => {
    if (req.session) {
        console.log('Session exists');
    } else {
        console.log('Session does not exist');
    }
    next();
});

// Database connection
const { encryptData, decryptData, dbConnection } = await connectDB();
if (!dbConnection) {
    console.error('Failed to connect to database');
    process.exit(1);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/slack', slackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/security', securityRoutes);

// Google OAuth routes
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Export the server instance for testing
module.exports = app;

// Google Sign-In callback
app.post('/api/auth/google/callback', async (req, res) => {
    try {
        console.log('Google callback received:', req.body);
        
        if (!req.body || !req.body.token) {
            return res.status(400).json({
                error: 'Invalid request',
                details: 'No token provided'
            });
        }

        const { token } = req.body;
        
        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        
        // Find or create user
        let user = await User.findOne({ googleId: payload.sub });
        
        if (!user) {
            user = await User.findOne({ email: payload.email });
            
            if (user) {
                user.googleId = payload.sub;
                user.isGoogleUser = true;
                user.name = payload.name;
                await user.save();
            } else {
                user = new User({
                    name: payload.name,
                    email: payload.email,
                    role: 'employee',
                    googleId: payload.sub,
                    isGoogleUser: true
                });
                await user.save();
            }
        }

        // Generate JWT token
        const jwtPayload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(jwtPayload, process.env.JWT_SECRET, { 
            expiresIn: '24h' 
        }, (err, jwtToken) => {
            if (err) {
                return res.status(500).json({
                    error: 'Token generation failed',
                    details: err.message
                });
            }

            // Return token and user data
            res.status(200).json({ 
                token: jwtToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });

        // Return token and user data
        res.status(200).json({ 
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error in Google callback:', err);
        
        // Handle specific error cases
        if (err.name === 'TokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                details: 'Token verification failed'
            });
        }

        // For other errors, return a clear message
        return res.status(500).json({ 
            error: 'Authentication failed',
            details: err.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.originalUrl} not found`
    });
});

// Start server
const PORT = 5002;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

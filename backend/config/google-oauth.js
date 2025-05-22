const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function() {
    // Initialize Passport
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5001/api/auth/google/callback',
        scope: ['profile', 'email'],
        accessType: 'offline',
        authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
        tokenURL: 'https://oauth2.googleapis.com/token',
        userInfoURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google OAuth profile:', profile);
            
            // First try to find user by Google ID
            let user = await User.findOne({ googleId: profile.id });
            
            // If not found, try to find by email
            if (!user) {
                user = await User.findOne({ email: profile.emails[0].value });
                
                // If user exists but not linked to Google, update their profile
                if (user) {
                    user.googleId = profile.id;
                    user.isGoogleUser = true;
                    user.name = profile.displayName;
                    await user.save();
                } else {
                    // Create new user
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        role: 'employee',
                        googleId: profile.id,
                        isGoogleUser: true
                    });
                    await user.save();
                }
            }

            return done(null, user);
        } catch (err) {
            console.error('Error in Google OAuth:', err);
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};

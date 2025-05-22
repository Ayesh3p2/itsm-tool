const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function() {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5001/api/auth/google/callback',
        scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google profile:', profile);
            
            // Find or create user
            const user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                return done(null, user);
            }

            // Create new user
            const newUser = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                role: 'employee',
                googleId: profile.id
            });

            await newUser.save();
            return done(null, newUser);
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

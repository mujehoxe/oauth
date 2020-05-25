const passport = require('passport')

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const GOOGLE_CLIENT_ID = '374495845688-8ra0nksfosq5s6p91kj7pe40arass74p.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = 'LSE0vXnUaV7_NjTCjnZ6rXJq'

passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://127.0.0.1:3000/auth/google/callback',
    },
    function(accessToken, refreshToken, profile, cb) {
        return cb(null, profile)
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

module.exports = passport
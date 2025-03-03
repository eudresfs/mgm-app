const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const configurePassport = () => {
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Extract relevant profile information
      const userData = {
        email: profile.emails[0].value,
        name: profile.displayName,
        provider: 'google',
        providerId: profile.id
      };
      
      // Handle user data in auth service
      const AuthService = require('../services/auth');
      const result = await AuthService.socialLogin('google', userData);
      return done(null, result.user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Facebook OAuth Strategy
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Extract relevant profile information
      const userData = {
        email: profile.emails[0].value,
        name: `${profile.name.givenName} ${profile.name.familyName}`,
        provider: 'facebook',
        providerId: profile.id
      };
      
      // Handle user data in auth service
      const AuthService = require('../services/auth');
      const result = await AuthService.socialLogin('facebook', userData);
      return done(null, result.user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const User = require('../models/user');
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = configurePassport;
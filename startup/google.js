const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { db, FieldValue } = require('../startup/firebase');
const { generateAuthToken } = require('../models/user.model');

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        // Check if the profile contains an email
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          throw new Error('Email not found in the Google profile.');
        }

        const userRef = await db
          .collection(process.env.USERS_DOC)
          .where('email', '==', profile.emails[0].value)
          .get();

        let newUser;

        if (userRef.empty) {
          const now = FieldValue.serverTimestamp();

          const userDoc = {
            name: profile.displayName,
            email: profile.emails[0].value,
            password: null,
            temporary_password: null,
            dob: null,
            location: 'Leipzig, Germany',
            created_at: now,
            modified_at: now,
          };

          const docRef = await db
            .collection(process.env.USERS_DOC)
            .add(userDoc);
          newUser = { id: docRef.id, ...userDoc };
        } else {
          newUser = { id: userRef.docs[0].id, ...userRef.docs[0].data() };
        }

        // Ensure the generateAuthToken function is correctly implemented
        const token = generateAuthToken(newUser.id, newUser, '7d');

        return done(null, { token });
      } catch (error) {
        // Log the error or handle it in an appropriate way
        console.error('Error in Google OAuth strategy:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;

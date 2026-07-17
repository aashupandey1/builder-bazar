const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userRepository = require('../../modules/user/user.repository');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await userRepository.upsertGoogleUser({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value,
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;
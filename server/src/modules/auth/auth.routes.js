const express = require('express');
const passport = require('../../core/config/passport');
const controller = require('./auth.controller');
const auth = require('../../core/middleware/auth');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  controller.googleCallback
);

router.get('/me', auth, controller.me);
router.post('/logout', controller.logout);

module.exports = router;
const authService = require('./auth.service');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

module.exports.googleCallback = (req, res) => {
  const token = authService.signToken(req.user);
  res.cookie('token', token, COOKIE_OPTS);
  res.redirect(`${process.env.CLIENT_URL}/dashboard`);
};

module.exports.me = (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports.logout = (req, res) => {
  res.clearCookie('token', { ...COOKIE_OPTS, maxAge: undefined });
  res.json({ success: true });
};
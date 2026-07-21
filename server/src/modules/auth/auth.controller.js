const authService = require('./auth.service');

module.exports.googleCallback = (req, res) => {
  const token = authService.signToken(req.user);
  res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
};

module.exports.me = (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports.logout = (_req, res) => {
  res.json({ success: true });
};
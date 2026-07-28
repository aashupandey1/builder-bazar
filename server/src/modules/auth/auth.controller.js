const authService = require('./auth.service');
const userRepository = require('../user/user.repository');

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

module.exports.sendOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ success: false, message: 'Mobile number required' });

    const otp = authService.generateOtp();
    await authService.saveOtp(mobile, otp);

    // TODO: wire a real SMS provider here (MSG91/Twilio) once API keys are available.
    console.log(`[OTP] ${mobile} -> ${otp}`);

    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    next(err);
  }
};

module.exports.verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp, name, email } = req.body;
    if (!mobile || !otp) return res.status(400).json({ success: false, message: 'Mobile and OTP required' });

    const valid = await authService.checkOtp(mobile, otp);
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    let user = await userRepository.findByMobile(mobile);
    if (!user) user = await userRepository.upsertMobileUser({ mobile, email, name });

    const token = authService.signToken(user);
    res.json({ success: true, data: { token, user } });
  } catch (err) {
    next(err);
  }
};
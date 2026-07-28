const jwt = require('jsonwebtoken');
const redis = require('../../core/config/redis');

const OTP_TTL_SECONDS = 5 * 60;

module.exports.generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

module.exports.saveOtp = async (mobile, otp) => {
  await redis.set(`otp:${mobile}`, otp, 'EX', OTP_TTL_SECONDS);
};

module.exports.checkOtp = async (mobile, otp) => {
  const stored = await redis.get(`otp:${mobile}`);
  if (!stored || stored !== otp) return false;
  await redis.del(`otp:${mobile}`);
  return true;
};

module.exports.signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

module.exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
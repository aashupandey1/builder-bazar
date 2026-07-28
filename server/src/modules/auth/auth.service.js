const jwt = require('jsonwebtoken');
const db = require('../../core/config/db');

const OTP_TTL_MINUTES = 15;

module.exports.generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

module.exports.saveOtp = async (mobile, otp) => {
  await db.query(
    `INSERT INTO otps (mobile, otp, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '${OTP_TTL_MINUTES} minutes')
     ON CONFLICT (mobile) DO UPDATE
       SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
    [mobile, otp]
  );
};

module.exports.checkOtp = async (mobile, otp) => {
  const result = await db.query(
    `DELETE FROM otps WHERE mobile = $1 AND otp = $2 AND expires_at > NOW() RETURNING mobile`,
    [mobile, otp]
  );
  return result.rowCount > 0;
};

module.exports.signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

module.exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
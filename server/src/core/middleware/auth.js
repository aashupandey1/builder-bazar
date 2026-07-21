const { verifyToken } = require('../../modules/auth/auth.service');
const userRepository = require('../../modules/user/user.repository');

module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const payload = verifyToken(token);
    const user = await userRepository.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
};
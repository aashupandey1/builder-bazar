const jwt = require('jsonwebtoken');

module.exports.signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

module.exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
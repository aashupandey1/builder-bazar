const repository = require('./profile.repository');
const AppError = require('../../core/errors/AppError');

module.exports.get = (userId) => repository.findById(userId);

module.exports.update = async (userId, { name, email, phone, avatar_url }) => {
  try {
    const updated = await repository.update(userId, { name, email, phone, avatarUrl: avatar_url });
    if (!updated) throw new AppError('User not found', 404);
    return updated;
  } catch (err) {
    if (err.code === '23505') throw new AppError('Email already in use', 409);
    throw err;
  }
};
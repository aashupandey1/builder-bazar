const repository = require('./notification.repository');
const AppError = require('../../core/errors/AppError');

module.exports.list = (userId) => repository.findAllByUser(userId);

module.exports.markRead = async (userId, id) => {
  const updated = await repository.markRead(userId, id);
  if (!updated) throw new AppError('Notification not found', 404);
  return updated;
};

module.exports.markAllRead = (userId) => repository.markAllRead(userId);

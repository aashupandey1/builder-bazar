const repository = require('./template.repository');
const AppError = require('../../core/errors/AppError');

module.exports.list = (filters) => repository.findAll(filters);
module.exports.stats = () => repository.stats();
module.exports.trackUsage = (id) => repository.incrementUsage(id);

module.exports.setFeatured = async (id) => {
  const updated = await repository.setFeatured(id);
  if (!updated) throw new AppError('Template not found', 404);
  return updated;
};

module.exports.create = (data) => repository.create(data);

module.exports.update = async (id, data) => {
  const updated = await repository.update(id, data);
  if (!updated) throw new AppError('Template not found', 404);
  return updated;
};

module.exports.remove = async (id) => {
  const removed = await repository.remove(id);
  if (!removed) throw new AppError('Template not found', 404);
  return removed;
};
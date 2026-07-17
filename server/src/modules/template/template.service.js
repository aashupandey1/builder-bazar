const repository = require('./template.repository');
const AppError = require('../../core/errors/AppError');

module.exports.list = (filters) => repository.findAll(filters);
module.exports.trackUsage = (id) => repository.incrementUsage(id);

module.exports.setFeatured = async (id) => {
  const updated = await repository.setFeatured(id);
  if (!updated) throw new AppError('Template not found', 404);
  return updated;
};
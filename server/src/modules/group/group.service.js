const repository = require('./group.repository');
const AppError = require('../../core/errors/AppError');

module.exports.list = () => repository.findAll();
module.exports.suggestions = () => repository.findSuggestions();
module.exports.create = (data) => repository.create(data);

module.exports.update = async (id, fields) => {
  const updated = await repository.update(id, fields);
  if (!updated) throw new AppError('Group not found', 404);
  return updated;
};

module.exports.remove = async (id) => {
  const removed = await repository.remove(id);
  if (!removed) throw new AppError('Group not found', 404);
  return removed;
};

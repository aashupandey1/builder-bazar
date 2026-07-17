// Business logic for project module
const repository = require('./project.repository');
const AppError = require('../../core/errors/AppError');

module.exports.list = (userId) => repository.findAllByUser(userId);

module.exports.get = async (id, userId) => {
  const project = await repository.findById(id);
  if (!project || project.user_id !== userId) {
    throw new AppError('Project not found', 404);
  }
  return project;
};

module.exports.create = ({ userId, templateId, title, data }) =>
  repository.create({ userId, templateId, title, data });

module.exports.update = async (id, userId, { title, data }) => {
  const project = await repository.findById(id);
  if (!project || project.user_id !== userId) {
    throw new AppError('Project not found', 404);
  }
  return repository.update(id, { title, data });
};

module.exports.remove = async (id, userId) => {
  const project = await repository.findById(id);
  if (!project || project.user_id !== userId) {
    throw new AppError('Project not found', 404);
  }
  return repository.remove(id);
};
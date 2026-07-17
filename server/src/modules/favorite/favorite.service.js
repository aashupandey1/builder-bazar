// Business logic for favorite module
const repository = require('./favorite.repository');
const projectRepository = require('../project/project.repository');
const AppError = require('../../core/errors/AppError');

module.exports.list = (userId) => repository.findAllByUser(userId);

module.exports.add = async (userId, projectId) => {
  const project = await projectRepository.findById(projectId);
  if (!project || project.user_id !== userId) {
    throw new AppError('Project not found', 404);
  }
  return repository.add(userId, projectId);
};

module.exports.remove = (userId, projectId) => repository.remove(userId, projectId);
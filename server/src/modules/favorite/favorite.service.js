const repository = require('./favorite.repository');
const templateRepository = require('../template/template.repository');
const AppError = require('../../core/errors/AppError');

module.exports.list = (userId) => repository.findAllByUser(userId);

module.exports.add = async (userId, templateId) => {
  const template = await templateRepository.findById(templateId);
  if (!template) {
    throw new AppError('Template not found', 404);
  }
  return repository.add(userId, templateId);
};

module.exports.remove = (userId, templateId) => repository.remove(userId, templateId);
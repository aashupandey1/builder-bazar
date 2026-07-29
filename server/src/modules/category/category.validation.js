const Joi = require('joi');

module.exports.idParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports.createCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
});

module.exports.updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
});

// Joi request validation schemas for project
const Joi = require('joi');

module.exports.idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports.createSchema = Joi.object({
  template_id: Joi.number().integer().positive().allow(null),
  title: Joi.string().max(255).allow('', null),
  data: Joi.object().required(),
});

module.exports.updateSchema = Joi.object({
  title: Joi.string().max(255).allow('', null),
  data: Joi.object(),
}).min(1);
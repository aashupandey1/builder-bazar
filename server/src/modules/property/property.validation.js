const Joi = require('joi');

module.exports.idParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports.createPropertySchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().allow(''),
  address: Joi.string().allow(''),
  secondary_name: Joi.string().allow(''),
  category: Joi.string().allow(''),
});

module.exports.updatePropertySchema = Joi.object({
  name: Joi.string(),
  location: Joi.string().allow(''),
  address: Joi.string().allow(''),
  secondary_name: Joi.string().allow(''),
  category: Joi.string().allow(''),
}).min(1);
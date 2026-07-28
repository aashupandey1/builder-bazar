const Joi = require('joi');

module.exports.idParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports.createListingSchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().allow(''),
  address: Joi.string().allow(''),
  secondary_name: Joi.string().allow(''),
  category: Joi.string().allow(''),
  group_id: Joi.number().integer().positive().allow(null),
});

module.exports.updateListingSchema = Joi.object({
  name: Joi.string(),
  location: Joi.string().allow(''),
  address: Joi.string().allow(''),
  secondary_name: Joi.string().allow(''),
  category: Joi.string().allow(''),
  group_id: Joi.number().integer().positive().allow(null),
}).min(1);

const Joi = require('joi');

module.exports.updateSchema = Joi.object({
  name: Joi.string().trim().max(255),
  email: Joi.string().trim().email().max(255),
  phone: Joi.string().trim().max(20).allow('', null),
  avatar_url: Joi.string().uri().allow('', null),
}).min(1);
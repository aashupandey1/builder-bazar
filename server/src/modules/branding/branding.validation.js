const Joi = require('joi');

module.exports.updateSchema = Joi.object({
  company_name: Joi.string().trim().max(255).required(),
  tagline: Joi.string().trim().max(255).allow('', null),
});
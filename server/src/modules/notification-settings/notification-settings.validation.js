const Joi = require('joi');

module.exports.updateSchema = Joi.object({
  push_enabled: Joi.boolean(),
  email_enabled: Joi.boolean(),
  sms_enabled: Joi.boolean(),
}).min(1);
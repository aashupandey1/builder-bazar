const Joi = require('joi');

module.exports.templateIdParamSchema = Joi.object({
  templateId: Joi.number().integer().positive().required(),
});
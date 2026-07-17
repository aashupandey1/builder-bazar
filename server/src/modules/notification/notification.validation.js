const Joi = require('joi');

module.exports.idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
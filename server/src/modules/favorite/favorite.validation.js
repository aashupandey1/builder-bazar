// Joi request validation schemas for favorite
const Joi = require('joi');

module.exports.projectIdParamSchema = Joi.object({
  projectId: Joi.number().integer().positive().required(),
});
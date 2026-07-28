const Joi = require('joi');

module.exports.idParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports.createGroupSchema = Joi.object({
  name: Joi.string().required(),
});

// min(0) so that PUT with only a logo file (empty body) passes validation.
// The controller handles the "nothing to update" guard explicitly.
module.exports.updateGroupSchema = Joi.object({
  name: Joi.string(),
}).min(0);

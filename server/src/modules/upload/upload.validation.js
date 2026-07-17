const Joi = require('joi');

module.exports.uploadBodySchema = Joi.object({
  type: Joi.string().valid('logo', 'background', 'music').required(),
});
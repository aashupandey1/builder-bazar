const Joi = require('joi');

module.exports.listQuerySchema = Joi.object({
  sort: Joi.string().valid('trending', 'latest'),
  project_id: Joi.number().integer().positive(),
  type: Joi.string().valid('Video', 'Reel', 'Poster', 'Story', 'Banner'),
  featured: Joi.boolean(),
});

module.exports.viewParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
const Joi = require('joi');

module.exports.listQuerySchema = Joi.object({
  sort: Joi.string().valid('trending', 'latest'),
  project_id: Joi.number().integer().positive(),
  type: Joi.string().valid('Video', 'Reel', 'Poster', 'Story', 'Banner'),
  featured: Joi.boolean(),
  limit: Joi.number().integer().positive().max(50).default(10),
  offset: Joi.number().integer().min(0).default(0),
});

module.exports.viewParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports.createTemplateSchema = Joi.object({
  title: Joi.string().required(),
  subtitle: Joi.string().allow(''),
  type: Joi.string().valid('Video', 'Reel', 'Poster', 'Story', 'Banner').required(),
  project_id: Joi.number().integer().positive(),
});

module.exports.updateTemplateSchema = Joi.object({
  title: Joi.string(),
  subtitle: Joi.string().allow(''),
  type: Joi.string().valid('Video', 'Reel', 'Poster', 'Story', 'Banner'),
  project_id: Joi.number().integer().positive(),
}).min(1);
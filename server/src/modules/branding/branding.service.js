const repository = require('./branding.repository');

module.exports.get = (userId) => repository.findByUser(userId);

module.exports.update = (userId, { company_name, tagline }) =>
  repository.upsert(userId, { companyName: company_name, tagline });
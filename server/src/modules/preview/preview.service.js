// Business logic for preview module
const repository = require('./preview.repository');

module.exports.list = async () => {
  return repository.findAll();
};

// Business logic for share module
const repository = require('./share.repository');

module.exports.list = async () => {
  return repository.findAll();
};

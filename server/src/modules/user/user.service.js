// Business logic for user module
const repository = require('./user.repository');

module.exports.list = async () => {
  return repository.findAll();
};

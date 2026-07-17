// Business logic for editor module
const repository = require('./editor.repository');

module.exports.list = async () => {
  return repository.findAll();
};

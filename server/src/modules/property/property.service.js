const repository = require('./property.repository');

module.exports.list = () => repository.findAll();

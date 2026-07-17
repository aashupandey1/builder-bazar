const repository = require('./media.repository');

module.exports.list = (userId) => repository.findAllByUser(userId);
module.exports.create = (data) => repository.create(data);
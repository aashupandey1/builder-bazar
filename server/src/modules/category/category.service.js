const repository = require('./category.repository');

module.exports.list = () => repository.findAll();
module.exports.create = (data) => repository.create(data);
module.exports.update = (id, fields) => repository.update(id, fields);
module.exports.remove = (idOrName) => repository.remove(idOrName);

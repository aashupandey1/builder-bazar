const repository = require('./property.repository');
const templateRepository = require('../template/template.repository');
const fs = require('fs/promises');
const path = require('path');

module.exports.list = () => repository.findAll();
module.exports.suggestions = () => repository.findSuggestions();
module.exports.create = (data) => repository.create(data);;
module.exports.update = (id, fields) => repository.update(id, fields);

module.exports.remove = async (id) => {
  const templates = await templateRepository.findAll({ projectId: id, limit: 1000 });

  await Promise.all(templates.map((t) => templateRepository.remove(t.id)));

  templates.forEach((t) => {
    if (t.file_url) {
      fs.unlink(path.join(__dirname, '../../../storage', t.file_url.replace('/storage/', ''))).catch(() => { });
    }
  });

  return repository.remove(id);
};
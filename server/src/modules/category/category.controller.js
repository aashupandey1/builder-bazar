const service = require('./category.service');

module.exports.list = async (req, res, next) => {
  try {
    const data = await service.list();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports.create = async (req, res, next) => {
  try {
    const data = await service.create({ name: req.body.name });
    res.status(201).json({ success: true, message: 'Category created', data });
  } catch (err) {
    next(err);
  }
};

module.exports.update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json({ success: true, message: 'Category updated', data });
  } catch (err) {
    next(err);
  }
};

module.exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

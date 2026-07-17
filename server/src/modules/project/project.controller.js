// HTTP layer only - reads req, calls service, sends res
const service = require('./project.service');

module.exports.list = async (req, res, next) => {
  try {
    const data = await service.list(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports.get = async (req, res, next) => {
  try {
    const data = await service.get(req.params.id, req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports.create = async (req, res, next) => {
  try {
    const data = await service.create({
      userId: req.user.id,
      templateId: req.body.template_id,
      title: req.body.title,
      data: req.body.data,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports.update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.id, req.user.id, {
      title: req.body.title,
      data: req.body.data,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
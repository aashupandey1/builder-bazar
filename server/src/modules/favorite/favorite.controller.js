// HTTP layer only - reads req, calls service, sends res
const service = require('./favorite.service');

module.exports.list = async (req, res, next) => {
  try {
    const data = await service.list(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports.add = async (req, res, next) => {
  try {
    await service.add(req.user.id, req.params.projectId);
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.user.id, req.params.projectId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
const service = require('./media.service');

module.exports.list = async (req, res, next) => {
  try {
    const data = await service.list(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
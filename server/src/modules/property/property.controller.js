const service = require('./property.service');

module.exports.list = async (req, res, next) => {
  try {
    const data = await service.list();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

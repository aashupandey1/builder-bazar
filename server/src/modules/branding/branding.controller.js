const service = require('./branding.service');

module.exports.get = async (req, res, next) => {
  try {
    const data = await service.get(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports.update = async (req, res, next) => {
  try {
    const data = await service.update(req.user.id, req.body);
    res.json({ success: true, message: 'Branding updated', data });
  } catch (err) { next(err); }
};
const service = require('./notification.service');

module.exports.list = async (req, res, next) => {
  try {
    const data = await service.list(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports.markRead = async (req, res, next) => {
  try {
    const data = await service.markRead(req.user.id, req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports.markAllRead = async (req, res, next) => {
  try {
    await service.markAllRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

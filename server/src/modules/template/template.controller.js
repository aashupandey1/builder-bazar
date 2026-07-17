const service = require('./template.service');
const AppError = require('../../core/errors/AppError');

module.exports.list = async (req, res, next) => {
  try {
    const data = await service.list({
      sort: req.query.sort,
      projectId: req.query.project_id,
      type: req.query.type,
      featured: req.query.featured,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports.trackUsage = async (req, res, next) => {
  try {
    await service.trackUsage(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Placeholder for the future admin panel - no UI yet, hits this directly.
module.exports.setFeatured = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') throw new AppError('Admin access required', 403);
    const data = await service.setFeatured(req.params.id);
    res.json({ success: true, message: 'Hero template updated', data });
  } catch (err) {
    next(err);
  }
};
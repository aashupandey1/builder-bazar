const service = require('./template.service');
const AppError = require('../../core/errors/AppError');
const cloudinary = require('../../core/config/cloudinary');
const path = require('path');

const SERVER_BASE_URL = process.env.SERVER_BASE_URL || '';
module.exports.list = async (req, res, next) => {
  try {
    const data = await service.list({
      sort: req.query.sort,
      projectId: req.query.project_id,
      type: req.query.type,
      featured: req.query.featured,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports.stats = async (req, res, next) => {
  try {
    const data = await service.stats();
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

// Bulk upload: req.files aayega multer se (array), sabke liye same title/type body se
module.exports.create = async (req, res, next) => {
  try {
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ success: false, message: 'At least one file required' });

    const templates = await Promise.all(
      files.map((file) =>
        service.create({
          type: req.body.type,
          title: req.body.title,
          subtitle: req.body.subtitle,
          fileUrl: file.path,
          thumbnailUrl: null,
          createdBy: req.user.id,
          projectId: req.body.project_id,
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `${templates.length} template(s) created`,
      data: templates,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json({ success: true, message: 'Template updated', data });
  } catch (err) {
    next(err);
  }
};

module.exports.remove = async (req, res, next) => {
  try {
    const removed = await service.remove(req.params.id);
    if (removed.file_url) {
      const publicId = removed.file_url.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
      cloudinary.uploader.destroy(publicId, { resource_type: 'auto' }).catch(() => {});
    }
    res.json({ success: true, message: 'Template deleted' });
  } catch (err) {
    next(err);
  }
};
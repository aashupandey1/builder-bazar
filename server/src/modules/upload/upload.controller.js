const service = require('./upload.service');

module.exports.create = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }
    const media = await service.create({
      userId: req.user.id,
      type: req.body.type,
      fileUrl: `/storage/media/${req.file.filename}`,
    });
    res.status(201).json({ success: true, data: media });
  } catch (err) {
    next(err);
  }
};
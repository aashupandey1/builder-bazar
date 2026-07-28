const service = require('./group.service');

module.exports.list = async (req, res, next) => {
  try {
    const data = await service.list();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports.suggestions = async (req, res, next) => {
  try {
    const data = await service.suggestions();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports.create = async (req, res, next) => {
  try {
    // req.file is set by multer-logo if a logo was uploaded; logo is optional on create.
    const data = await service.create({
      name: req.body.name,
      logoUrl: req.file?.path || null,
    });
    res.status(201).json({ success: true, message: 'Group created', data });
  } catch (err) {
    next(err);
  }
};

module.exports.update = async (req, res, next) => {
  try {
    const fields = {};
    if (req.body.name) fields.name = req.body.name;
    if (req.file?.path) fields.logo_url = req.file.path;
    if (!Object.keys(fields).length) {
      return res.status(400).json({ success: false, message: 'Nothing to update — send name and/or a logo file' });
    }
    const data = await service.update(req.params.id, fields);
    res.json({ success: true, message: 'Group updated', data });
  } catch (err) {
    next(err);
  }
};

module.exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, message: 'Group deleted' });
  } catch (err) {
    next(err);
  }
};

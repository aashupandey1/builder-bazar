const service = require('./listing.service');

module.exports.list = async (req, res, next) => {
  try {
    const data = await service.list({
      grouped: req.query.grouped,
      groupId: req.query.group_id,
    });
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

module.exports.removeSuggestion = async (req, res, next) => {
  try {
    const type = req.query.type || req.body?.type;
    const value = req.query.value || req.body?.value;
    if (!type || !value) {
      return res.status(400).json({ success: false, message: 'type and value parameters are required' });
    }
    await service.removeSuggestion(type, value);
    res.json({ success: true, message: 'Suggestion deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports.addSuggestion = async (req, res, next) => {
  try {
    const { type, value } = req.body;
    if (!type || !value) {
      return res.status(400).json({ success: false, message: 'type and value are required' });
    }
    await service.addSuggestion(type, value);
    res.json({ success: true, message: 'Suggestion added' });
  } catch (err) {
    next(err);
  }
};

module.exports.create = async (req, res, next) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, message: 'Listing created', data });
  } catch (err) {
    next(err);
  }
};

module.exports.update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json({ success: true, message: 'Listing updated', data });
  } catch (err) {
    next(err);
  }
};

module.exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
};

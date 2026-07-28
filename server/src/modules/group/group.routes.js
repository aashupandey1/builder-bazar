const express = require('express');
const controller = require('./group.controller');
const requireAdmin = require('../../core/middleware/requireAdmin');
const validate = require('../../core/middleware/validate');
const uploadLogo = require('../../core/config/multer-logo');
const { idParamsSchema, createGroupSchema, updateGroupSchema } = require('./group.validation');

const router = express.Router();

// GET — public (same pattern as property routes: auth set at app.js level, not required here)
router.get('/', controller.list);
router.get('/suggestions', controller.suggestions);

// POST — multer-logo runs first (parses multipart body + saves file), then validate, then controller.
// JSON posts (no file) also work — multer passes through non-multipart requests unchanged.
router.post('/', requireAdmin, uploadLogo.single('logo'), validate(createGroupSchema), controller.create);

// PUT — validate :id params first (no file), then multer for optional logo, then body validate.
router.put('/:id', requireAdmin, validate(idParamsSchema, 'params'), uploadLogo.single('logo'), validate(updateGroupSchema), controller.update);

router.delete('/:id', requireAdmin, validate(idParamsSchema, 'params'), controller.remove);

module.exports = router;

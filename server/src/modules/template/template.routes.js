const express = require('express');
const controller = require('./template.controller');
const validate = require('../../core/middleware/validate');
const auth = require('../../core/middleware/auth');
const requireAdmin = require('../../core/middleware/requireAdmin');
const upload = require('../../core/config/multer');
const {
  listQuerySchema,
  viewParamsSchema,
  createTemplateSchema,
  updateTemplateSchema,
} = require('./template.validation');

const router = express.Router();
router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.get('/stats', auth, requireAdmin, controller.stats);
router.post('/:id/view', validate(viewParamsSchema, 'params'), controller.trackUsage);
router.patch('/:id/feature', auth, validate(viewParamsSchema, 'params'), controller.setFeatured);
router.post('/', auth, requireAdmin, upload.array('files', 10), validate(createTemplateSchema), controller.create);
router.put('/:id', auth, requireAdmin, validate(viewParamsSchema, 'params'), validate(updateTemplateSchema), controller.update);
router.delete('/:id', auth, requireAdmin, validate(viewParamsSchema, 'params'), controller.remove);

module.exports = router;
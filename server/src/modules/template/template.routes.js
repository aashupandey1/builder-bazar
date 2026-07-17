const express = require('express');
const controller = require('./template.controller');
const validate = require('../../core/middleware/validate');
const auth = require('../../core/middleware/auth');
const { listQuerySchema, viewParamsSchema } = require('./template.validation');

const router = express.Router();
router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.post('/:id/view', validate(viewParamsSchema, 'params'), controller.trackUsage);
router.patch('/:id/feature', auth, validate(viewParamsSchema, 'params'), controller.setFeatured);

module.exports = router;
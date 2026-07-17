const express = require('express');
const controller = require('./notification.controller');
const validate = require('../../core/middleware/validate');
const { idParamSchema } = require('./notification.validation');

const router = express.Router();
router.get('/', controller.list);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', validate(idParamSchema, 'params'), controller.markRead);

module.exports = router;
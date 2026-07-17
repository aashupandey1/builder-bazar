const express = require('express');
const controller = require('./notification-settings.controller');
const validate = require('../../core/middleware/validate');
const { updateSchema } = require('./notification-settings.validation');

const router = express.Router();
router.get('/', controller.get);
router.put('/', validate(updateSchema), controller.update);

module.exports = router;
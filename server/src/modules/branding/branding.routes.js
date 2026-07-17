const express = require('express');
const controller = require('./branding.controller');
const validate = require('../../core/middleware/validate');
const { updateSchema } = require('./branding.validation');

const router = express.Router();
router.get('/', controller.get);
router.put('/', validate(updateSchema), controller.update);

module.exports = router;
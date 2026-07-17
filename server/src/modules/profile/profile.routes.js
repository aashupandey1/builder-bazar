const express = require('express');
const controller = require('./profile.controller');
const validate = require('../../core/middleware/validate');
const { updateSchema } = require('./profile.validation');

const router = express.Router();
router.get('/', controller.get);
router.put('/', validate(updateSchema), controller.update);

module.exports = router;
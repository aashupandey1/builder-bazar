const express = require('express');
const controller = require('./render.controller');

const router = express.Router();
router.post('/', controller.requestRender);

module.exports = router;

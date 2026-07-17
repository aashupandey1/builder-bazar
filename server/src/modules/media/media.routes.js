// Route definitions for media module
const express = require('express');
const controller = require('./media.controller');

const router = express.Router();
router.get('/', controller.list);

module.exports = router;

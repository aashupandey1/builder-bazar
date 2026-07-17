// Route definitions for preview module
const express = require('express');
const controller = require('./preview.controller');

const router = express.Router();
router.get('/', controller.list);

module.exports = router;

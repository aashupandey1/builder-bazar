// Route definitions for share module
const express = require('express');
const controller = require('./share.controller');

const router = express.Router();
router.get('/', controller.list);

module.exports = router;

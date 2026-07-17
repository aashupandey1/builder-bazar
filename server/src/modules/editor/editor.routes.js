// Route definitions for editor module
const express = require('express');
const controller = require('./editor.controller');

const router = express.Router();
router.get('/', controller.list);

module.exports = router;

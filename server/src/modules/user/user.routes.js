// Route definitions for user module
const express = require('express');
const controller = require('./user.controller');

const router = express.Router();
router.get('/', controller.list);

module.exports = router;

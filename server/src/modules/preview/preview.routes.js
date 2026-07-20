const express = require('express');
const controller = require('./preview.controller');

const router = express.Router();
router.get('/:type/:id', controller.share);

module.exports = router;
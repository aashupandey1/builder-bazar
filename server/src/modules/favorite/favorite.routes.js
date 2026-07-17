// Route definitions for favorite module
const express = require('express');
const controller = require('./favorite.controller');
const validate = require('../../core/middleware/validate');
const { projectIdParamSchema } = require('./favorite.validation');

const router = express.Router();

router.get('/', controller.list);
router.post('/:projectId', validate(projectIdParamSchema, 'params'), controller.add);
router.delete('/:projectId', validate(projectIdParamSchema, 'params'), controller.remove);

module.exports = router;
const express = require('express');
const controller = require('./favorite.controller');
const validate = require('../../core/middleware/validate');
const { templateIdParamSchema } = require('./favorite.validation');

const router = express.Router();

router.get('/', controller.list);
router.post('/:templateId', validate(templateIdParamSchema, 'params'), controller.add);
router.delete('/:templateId', validate(templateIdParamSchema, 'params'), controller.remove);

module.exports = router;
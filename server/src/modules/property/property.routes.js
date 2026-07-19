const express = require('express');
const controller = require('./property.controller');
const requireAdmin = require('../../core/middleware/requireAdmin');
const validate = require('../../core/middleware/validate');
const { idParamsSchema, createPropertySchema, updatePropertySchema } = require('./property.validation');

const router = express.Router();
router.get('/', controller.list);
router.post('/', requireAdmin, validate(createPropertySchema), controller.create);
router.put('/:id', requireAdmin, validate(idParamsSchema, 'params'), validate(updatePropertySchema), controller.update);
router.delete('/:id', requireAdmin, validate(idParamsSchema, 'params'), controller.remove);

module.exports = router;
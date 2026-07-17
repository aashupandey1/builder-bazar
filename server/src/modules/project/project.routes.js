// Route definitions for project module
const express = require('express');
const controller = require('./project.controller');
const validate = require('../../core/middleware/validate');
const { idParamSchema, createSchema, updateSchema } = require('./project.validation');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', validate(idParamSchema, 'params'), controller.get);
router.post('/', validate(createSchema), controller.create);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateSchema), controller.update);
router.delete('/:id', validate(idParamSchema, 'params'), controller.remove);

module.exports = router;
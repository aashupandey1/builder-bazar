const express = require('express');
const controller = require('./category.controller');
const requireAdmin = require('../../core/middleware/requireAdmin');
const validate = require('../../core/middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('./category.validation');

const router = express.Router();

// GET categories - accessible to authenticated users
router.get('/', controller.list);

// Admin-only CRUD operations
router.post('/', requireAdmin, validate(createCategorySchema), controller.create);
router.put('/:id', requireAdmin, validate(updateCategorySchema), controller.update);
router.delete('/:id', requireAdmin, controller.remove);

module.exports = router;

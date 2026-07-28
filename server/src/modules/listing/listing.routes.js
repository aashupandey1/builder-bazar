const express = require('express');
const controller = require('./listing.controller');
const requireAdmin = require('../../core/middleware/requireAdmin');
const validate = require('../../core/middleware/validate');
const { idParamsSchema, createListingSchema, updateListingSchema } = require('./listing.validation');

const router = express.Router();
router.get('/', controller.list);
router.get('/suggestions', controller.suggestions);
router.post('/', requireAdmin, validate(createListingSchema), controller.create);
router.put('/:id', requireAdmin, validate(idParamsSchema, 'params'), validate(updateListingSchema), controller.update);
router.delete('/:id', requireAdmin, validate(idParamsSchema, 'params'), controller.remove);

module.exports = router;

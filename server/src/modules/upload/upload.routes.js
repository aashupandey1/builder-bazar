const express = require('express');
const upload = require('../../core/config/multer');
const validate = require('../../core/middleware/validate');
const controller = require('./upload.controller');
const { uploadBodySchema } = require('./upload.validation');

const router = express.Router();
router.post('/', upload.single('file'), validate(uploadBodySchema), controller.create);

module.exports = router;
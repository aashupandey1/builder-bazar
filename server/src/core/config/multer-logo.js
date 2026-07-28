// Logo-specific multer config — images only, 5 MB cap, goes to builder-bazar/logos on Cloudinary.
// Separate from core/config/multer.js (which accepts video/audio too and goes to /media).
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'builder-bazar/logos',
    resource_type: 'image',
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES[file.mimetype]) return cb(null, true);
  const err = new Error('Logo must be an image (JPG, PNG, or WebP)');
  err.statusCode = 400;
  cb(err);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

// Multer config: only image/video/audio, 50MB cap, uploads go straight to Cloudinary
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const ALLOWED_MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'builder-bazar/media',
    resource_type: 'auto',
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TO_EXT[file.mimetype]) return cb(null, true);
  const err = new Error('Unsupported file type');
  err.statusCode = 400;
  cb(err);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 200 * 1024 * 1024, files: 10 } });
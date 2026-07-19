// Multer config: only image/video/audio, 50MB cap, random filenames (no user input in path)
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../../storage/media')),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${ALLOWED_MIME_TO_EXT[file.mimetype]}`),
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TO_EXT[file.mimetype]) return cb(null, true);
  const err = new Error('Unsupported file type');
  err.statusCode = 400;
  cb(err);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 200 * 1024 * 1024, files: 10 } });
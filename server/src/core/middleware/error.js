module.exports = function errorHandler(err, req, res, next) {
  const multerCountCodes = new Set(['LIMIT_FILE_COUNT', 'LIMIT_UNEXPECTED_FILE']);
  let statusCode = err.statusCode || 500;
  let message = err.message;
  if (err.code === 'LIMIT_FILE_SIZE') { statusCode = 400; }
  if (multerCountCodes.has(err.code)) { statusCode = 400; message = 'Too many files in one upload, max allowed is 30.'; }
  res.status(statusCode).json({ success: false, message });
};
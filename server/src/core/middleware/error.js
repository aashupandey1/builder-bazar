module.exports = function errorHandler(err, req, res, next) {
  const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 400 : (err.statusCode || 500);
  res.status(statusCode).json({ success: false, message: err.message });
};
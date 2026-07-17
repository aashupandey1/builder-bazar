// Standard response shape: { success, data, message, error }
module.exports.success = (res, data, message = 'OK') =>
  res.json({ success: true, message, data });

module.exports.error = (res, message, statusCode = 400) =>
  res.status(statusCode).json({ success: false, message });

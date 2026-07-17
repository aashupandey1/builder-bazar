// Runs Joi schema validation before controller executes.
// property: which part of req to validate — 'body' | 'query' | 'params'
module.exports = function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message).join(', '),
      });
    }
    req[property] = value;
    next();
  };
};
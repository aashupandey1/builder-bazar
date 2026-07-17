// Accepts render request, enqueues job, returns job id
const service = require('./render.service');

module.exports.requestRender = async (req, res, next) => {
  try {
    const jobId = await service.enqueueRender(req.body);
    res.json({ success: true, data: { jobId } });
  } catch (err) {
    next(err);
  }
};

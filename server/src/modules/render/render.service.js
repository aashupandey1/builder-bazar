// Pushes render job onto the FFmpeg render queue
const renderQueue = require('../../jobs/queues/renderQueue');

module.exports.enqueueRender = async (payload) => {
  const job = await renderQueue.add('render-video', payload);
  return job.id;
};

// Worker process - actually runs FFmpeg rendering jobs
const { Worker } = require('bullmq');
const redisConnection = require('../../core/config/redis');

const worker = new Worker('render', async (job) => {
  // ffmpeg processing logic here
}, { connection: redisConnection });

module.exports = worker;

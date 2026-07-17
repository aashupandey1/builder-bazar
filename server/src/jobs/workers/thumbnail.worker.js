// Worker process - generates thumbnails for uploaded videos
const { Worker } = require('bullmq');
const redisConnection = require('../../core/config/redis');

const worker = new Worker('thumbnail', async (job) => {
  // thumbnail generation logic here
}, { connection: redisConnection });

module.exports = worker;

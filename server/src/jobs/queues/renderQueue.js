// BullMQ queue definition for FFmpeg video rendering
const { Queue } = require('bullmq');
const redisConnection = require('../../core/config/redis');

const renderQueue = new Queue('render', { connection: redisConnection });
module.exports = renderQueue;

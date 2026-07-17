// Redis client setup for caching + BullMQ queues
const IORedis = require('ioredis');

const redisConnection = new IORedis(process.env.REDIS_URL);
module.exports = redisConnection;

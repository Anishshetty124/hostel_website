const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL;
let redis = null;

if (redisUrl) {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err.message);
  });

  redis.on('connect', () => {
    console.log('Redis connected');
  });
}

const isRedisReady = () => redis && redis.status === 'ready';

module.exports = { redis, isRedisReady };

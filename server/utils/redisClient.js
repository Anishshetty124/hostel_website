const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL;
let redis = null;

if (redisUrl) {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
  });

  redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });
}

const isRedisReady = () => redis && redis.status === 'ready';

const deleteByPattern = async (pattern) => {
  if (!isRedisReady()) return;
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length) {
      await redis.del(...keys);
    }
  } while (cursor !== '0');
};

module.exports = { redis, isRedisReady, deleteByPattern };

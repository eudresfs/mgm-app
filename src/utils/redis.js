/**
 * Redis Utility
 * Provides a Redis client for caching and data storage
 */

const { createClient } = require('redis');
const logger = require('./logger');

let redisClient = null;

async function initRedis() {
  if (!process.env.REDIS_URL) {
    logger.warn('Redis URL not configured. Running without Redis support.');
    return null;
  }

  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    client.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    client.on('connect', () => {
      logger.info('Connected to Redis');
    });

    await client.connect();
    redisClient = client;
    return client;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    return null;
  }
}

// Wrapper function for Redis operations with fallback
async function redisOperation(operation) {
  if (!redisClient) {
    logger.debug('Redis not available, skipping operation');
    return null;
  }

  try {
    return await operation(redisClient);
  } catch (error) {
    logger.error('Redis operation failed:', error);
    return null;
  }
}

module.exports = {
  initRedis,
  redisOperation,
  // Helper methods that use redisOperation wrapper
  set: async (key, value, flag, expiry) => {
    return redisOperation(async (client) => {
      if (flag && expiry) {
        return await client.set(key, value, { [flag]: expiry });
      }
      return await client.set(key, value);
    });
  },
  get: async (key) => {
    return redisOperation(async (client) => {
      return await client.get(key);
    });
  },
  del: async (key) => {
    return redisOperation(async (client) => {
      return await client.del(key);
    });
  },
  keys: async (pattern) => {
    return redisOperation(async (client) => {
      return await client.keys(pattern);
    });
  },
  lrange: async (key, start, end) => {
    return redisOperation(async (client) => {
      return await client.lRange(key, start, end);
    });
  },
  lrem: async (key, count, element) => {
    return redisOperation(async (client) => {
      return await client.lRem(key, count, element);
    });
  },
  zadd: async (key, score, member) => {
    return redisOperation(async (client) => {
      return await client.zAdd(key, { score, value: member });
    });
  },
  lpush: async (key, element) => {
    return redisOperation(async (client) => {
      return await client.lPush(key, element);
    });
  }
};
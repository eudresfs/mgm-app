/**
 * Redis Utility
 * Provides a Redis client for caching and data storage
 */

const { createClient } = require('redis');
const logger = require('./logger');

// Create Redis client
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({ url: redisUrl });

// Handle connection events
client.on('connect', () => {
  logger.info('Redis client connected');
});

client.on('error', (err) => {
  logger.error('Redis client error:', err);
});

// Connect to Redis
client.connect().catch(err => {
  logger.error('Failed to connect to Redis:', err);
});

/**
 * Set a key-value pair in Redis
 * @param {string} key - The key
 * @param {string} value - The value
 * @param {string} [flag] - Optional flag (e.g., 'EX', 'NX')
 * @param {number} [expiry] - Optional expiry time in seconds
 * @returns {Promise<string>} - Redis response
 */
async function set(key, value, flag, expiry) {
  try {
    if (flag && expiry) {
      return await client.set(key, value, { [flag]: expiry });
    }
    return await client.set(key, value);
  } catch (error) {
    logger.error(`Redis SET error for key ${key}:`, error);
    throw error;
  }
}

/**
 * Get a value from Redis by key
 * @param {string} key - The key
 * @returns {Promise<string>} - The value
 */
async function get(key) {
  try {
    return await client.get(key);
  } catch (error) {
    logger.error(`Redis GET error for key ${key}:`, error);
    throw error;
  }
}

/**
 * Delete a key from Redis
 * @param {string} key - The key to delete
 * @returns {Promise<number>} - Number of keys deleted
 */
async function del(key) {
  try {
    return await client.del(key);
  } catch (error) {
    logger.error(`Redis DEL error for key ${key}:`, error);
    throw error;
  }
}

/**
 * Find keys matching a pattern
 * @param {string} pattern - The pattern to match
 * @returns {Promise<string[]>} - Array of matching keys
 */
async function keys(pattern) {
  try {
    return await client.keys(pattern);
  } catch (error) {
    logger.error(`Redis KEYS error for pattern ${pattern}:`, error);
    throw error;
  }
}

/**
 * Increment a hash field by a number
 * @param {string} key - The hash key
 * @param {string} field - The field to increment
 * @param {number} increment - The increment value
 * @returns {Promise<number>} - The new value
 */
async function hincrby(key, field, increment) {
  try {
    return await client.hIncrBy(key, field, increment);
  } catch (error) {
    logger.error(`Redis HINCRBY error for key ${key}, field ${field}:`, error);
    throw error;
  }
}

/**
 * Increment a hash field by a float
 * @param {string} key - The hash key
 * @param {string} field - The field to increment
 * @param {number} increment - The increment value
 * @returns {Promise<number>} - The new value
 */
async function hincrbyfloat(key, field, increment) {
  try {
    return await client.hIncrByFloat(key, field, increment);
  } catch (error) {
    logger.error(`Redis HINCRBYFLOAT error for key ${key}, field ${field}:`, error);
    throw error;
  }
}

/**
 * Add a member to a sorted set
 * @param {string} key - The sorted set key
 * @param {number} score - The score
 * @param {string} member - The member
 * @returns {Promise<number>} - Number of elements added
 */
async function zadd(key, score, member) {
  try {
    return await client.zAdd(key, { score, value: member });
  } catch (error) {
    logger.error(`Redis ZADD error for key ${key}:`, error);
    throw error;
  }
}

/**
 * Push an element to a list
 * @param {string} key - The list key
 * @param {string} element - The element to push
 * @returns {Promise<number>} - Length of the list after push
 */
async function lpush(key, element) {
  try {
    return await client.lPush(key, element);
  } catch (error) {
    logger.error(`Redis LPUSH error for key ${key}:`, error);
    throw error;
  }
}

/**
 * Get a range of elements from a list
 * @param {string} key - The list key
 * @param {number} start - Start index
 * @param {number} stop - Stop index
 * @returns {Promise<string[]>} - Array of elements
 */
async function lrange(key, start, stop) {
  try {
    return await client.lRange(key, start, stop);
  } catch (error) {
    logger.error(`Redis LRANGE error for key ${key}:`, error);
    throw error;
  }
}

/**
 * Remove elements from a list
 * @param {string} key - The list key
 * @param {number} count - Number of occurrences to remove
 * @param {string} element - The element to remove
 * @returns {Promise<number>} - Number of elements removed
 */
async function lrem(key, count, element) {
  try {
    return await client.lRem(key, count, element);
  } catch (error) {
    logger.error(`Redis LREM error for key ${key}:`, error);
    throw error;
  }
}

module.exports = {
  client,
  set,
  get,
  del,
  keys,
  hincrby,
  hincrbyfloat,
  zadd,
  lpush,
  lrange,
  lrem
};
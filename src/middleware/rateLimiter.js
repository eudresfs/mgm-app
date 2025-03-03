/**
 * Rate limiter middleware for authentication routes
 * Prevents brute force attacks by limiting request frequency
 */

const redis = require('redis');
const { promisify } = require('util');
const logger = require('../utils/logger');

// Initialize Redis client
let redisClient;
let getAsync;
let setAsync;
let expireAsync;

// Connect to Redis or use in-memory fallback
const initializeRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        legacyMode: true
      });
      
      await redisClient.connect();
      
      getAsync = promisify(redisClient.get).bind(redisClient);
      setAsync = promisify(redisClient.set).bind(redisClient);
      expireAsync = promisify(redisClient.expire).bind(redisClient);
      
      logger.info('Redis connected for rate limiting');
    } else {
      // In-memory fallback
      logger.warn('Redis not configured, using in-memory rate limiting (not suitable for production)');
      const memoryStore = {};
      
      getAsync = async (key) => memoryStore[key];
      setAsync = async (key, value) => { memoryStore[key] = value; return 'OK'; };
      expireAsync = async (key, seconds) => {
        setTimeout(() => { delete memoryStore[key]; }, seconds * 1000);
        return 1;
      };
    }
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

// Initialize Redis on module load
initializeRedis().catch(err => {
  logger.error('Failed to initialize rate limiter:', err);
});

/**
 * Rate limiter middleware
 * Limits requests to 10 per minute per IP address
 */
const rateLimiter = async (req, res, next) => {
  try {
    // Get client IP
    const ip = req.ip || req.connection.remoteAddress;
    const key = `ratelimit:${ip}:${req.path}`;
    
    // Get current count
    const current = await getAsync(key);
    const count = current ? parseInt(current) : 0;
    
    // Check if limit exceeded
    if (count >= 10) {
      logger.warn(`Rate limit exceeded for IP: ${ip} on path: ${req.path}`);
      return res.status(429).json({
        error: 'Too many requests, please try again later.'
      });
    }
    
    // Increment count
    await setAsync(key, count + 1);
    
    // Set expiry if new key
    if (count === 0) {
      await expireAsync(key, 60); // 60 seconds
    }
    
    next();
  } catch (error) {
    logger.error('Rate limiter error:', error);
    next(); // Continue on error to prevent blocking legitimate requests
  }
};

module.exports = {
  rateLimiter
};
/**
 * Fraud Detection Service
 * Handles detection of suspicious activities and fraud prevention
 */

const redis = require('../utils/redis');
const logger = require('../utils/logger');

// Constants for fraud detection
const CLICK_RATE_LIMIT = 10; // Max clicks per minute from same IP
const CONVERSION_RATE_LIMIT = 5; // Max conversions per day from same IP
const SUSPICIOUS_COUNTRIES = ['country1', 'country2']; // Example list of high-risk countries
const SUSPICIOUS_IP_RANGES = []; // Example list of suspicious IP ranges

/**
 * Check if a click event is potentially fraudulent
 * @param {Object} clickData - Data about the click event
 * @returns {Object} Fraud detection results
 */
async function validateClick(clickData) {
  try {
    const results = {
      isSuspicious: false,
      flags: [],
      score: 0, // 0-100 fraud score
      action: 'allow' // 'allow', 'flag', 'block'
    };
    
    // Check click frequency from same IP
    const ipClickCount = await checkClickFrequency(clickData.ip);
    if (ipClickCount > CLICK_RATE_LIMIT) {
      results.isSuspicious = true;
      results.flags.push({
        type: 'high_frequency',
        description: `Excessive clicks (${ipClickCount}) from IP ${clickData.ip}`,
        severity: 'medium'
      });
      results.score += 30;
    }
    
    // Check for multiple affiliates clicked by same user/device
    const deviceClickCount = await checkDeviceAffiliateVariety(clickData.fingerprint);
    if (deviceClickCount > 3) { // More than 3 different affiliates in short time
      results.isSuspicious = true;
      results.flags.push({
        type: 'affiliate_hopping',
        description: `Device clicked on ${deviceClickCount} different affiliate links`,
        severity: 'medium'
      });
      results.score += 25;
    }
    
    // Check for suspicious user agent patterns
    if (checkSuspiciousUserAgent(clickData.userAgent)) {
      results.isSuspicious = true;
      results.flags.push({
        type: 'suspicious_user_agent',
        description: 'User agent matches known bot or fraud patterns',
        severity: 'high'
      });
      results.score += 40;
    }
    
    // Check for suspicious referrer
    if (clickData.referrer && isSuspiciousReferrer(clickData.referrer)) {
      results.isSuspicious = true;
      results.flags.push({
        type: 'suspicious_referrer',
        description: 'Traffic from known suspicious source',
        severity: 'medium'
      });
      results.score += 20;
    }
    
    // Determine action based on fraud score
    if (results.score >= 70) {
      results.action = 'block';
    } else if (results.score >= 40) {
      results.action = 'flag';
    }
    
    // Record suspicious activity for review if needed
    if (results.isSuspicious) {
      await recordSuspiciousActivity(clickData, results);
    }
    
    return results;
  } catch (error) {
    logger.error('Error in fraud detection:', error);
    // Default to allowing the click if there's an error in fraud detection
    return { isSuspicious: false, flags: [], score: 0, action: 'allow' };
  }
}

/**
 * Check click frequency from the same IP address
 * @param {string} ip - IP address
 * @returns {number} Number of clicks in the last minute
 */
async function checkClickFrequency(ip) {
  const now = Date.now();
  const oneMinuteAgo = now - 60000; // 1 minute ago
  
  // Add current click to the sorted set with timestamp as score
  await redis.zadd(`fraud:ip:clicks:${ip}`, now, now.toString());
  
  // Count clicks in the last minute
  const recentClicks = await redis.zcount(`fraud:ip:clicks:${ip}`, oneMinuteAgo, '+inf');
  
  // Remove old entries (older than 1 hour)
  await redis.zremrangebyscore(`fraud:ip:clicks:${ip}`, 0, now - 3600000);
  
  return recentClicks;
}

/**
 * Check if a device has clicked on multiple affiliate links
 * @param {string} fingerprint - Device fingerprint
 * @returns {number} Number of different affiliates clicked
 */
async function checkDeviceAffiliateVariety(fingerprint) {
  const now = Date.now();
  const oneDayAgo = now - 86400000; // 24 hours ago
  
  // Get unique affiliates clicked by this device in the last 24 hours
  const affiliates = await redis.smembers(`fraud:device:affiliates:${fingerprint}`);
  
  return affiliates.length;
}

/**
 * Check if user agent matches known suspicious patterns
 * @param {string} userAgent - User agent string
 * @returns {boolean} True if suspicious
 */
function checkSuspiciousUserAgent(userAgent) {
  if (!userAgent) return false;
  
  const userAgentLower = userAgent.toLowerCase();
  
  // Check for common bot signatures
  const botPatterns = [
    'bot', 'crawler', 'spider', 'headless', 
    'phantomjs', 'selenium', 'puppeteer',
    'automation', 'scrape'
  ];
  
  return botPatterns.some(pattern => userAgentLower.includes(pattern));
}

/**
 * Check if referrer is from a suspicious source
 * @param {string} referrer - Referrer URL
 * @returns {boolean} True if suspicious
 */
function isSuspiciousReferrer(referrer) {
  if (!referrer) return false;
  
  const referrerLower = referrer.toLowerCase();
  
  // List of suspicious referrer patterns
  const suspiciousPatterns = [
    'click-farm', 'traffic-bot', 'auto-click',
    'paid-to-click', 'reward-click'
  ];
  
  return suspiciousPatterns.some(pattern => referrerLower.includes(pattern));
}

/**
 * Record suspicious activity for manual review
 * @param {Object} clickData - Original click data
 * @param {Object} fraudResults - Results of fraud detection
 */
async function recordSuspiciousActivity(clickData, fraudResults) {
  const suspiciousActivity = {
    type: 'click',
    data: clickData,
    fraudResults,
    timestamp: new Date(),
    reviewed: false
  };
  
  // Store in Redis for dashboard display
  await redis.lpush('fraud:suspicious_activities', JSON.stringify(suspiciousActivity));
  
  // Keep list at a reasonable size
  await redis.ltrim('fraud:suspicious_activities', 0, 999);
  
  // Log high severity issues
  if (fraudResults.score >= 70) {
    logger.warn('High severity fraud detected:', {
      ip: clickData.ip,
      trackingId: clickData.trackingId,
      score: fraudResults.score,
      flags: fraudResults.flags
    });
  }
}

/**
 * Validate a conversion for potential fraud
 * @param {Object} conversionData - Data about the conversion
 * @returns {Object} Fraud detection results
 */
async function validateConversion(conversionData) {
  try {
    const results = {
      isSuspicious: false,
      flags: [],
      score: 0,
      action: 'allow'
    };
    
    // Check for multiple conversions from same IP
    const ipConversionCount = await checkConversionFrequency(conversionData.ip);
    if (ipConversionCount > CONVERSION_RATE_LIMIT) {
      results.isSuspicious = true;
      results.flags.push({
        type: 'high_conversion_frequency',
        description: `Excessive conversions (${ipConversionCount}) from IP ${conversionData.ip}`,
        severity: 'high'
      });
      results.score += 50;
    }
    
    // Check for duplicate order IDs
    if (conversionData.orderId && await isDuplicateOrder(conversionData.orderId)) {
      results.isSuspicious = true;
      results.flags.push({
        type: 'duplicate_order',
        description: `Duplicate order ID: ${conversionData.orderId}`,
        severity: 'high'
      });
      results.score += 80;
    }
    
    // Check for suspicious conversion values
    if (isSuspiciousValue(conversionData.amount, conversionData.campaignId)) {
      results.isSuspicious = true;
      results.flags.push({
        type: 'suspicious_value',
        description: `Unusual order value: ${conversionData.amount}`,
        severity: 'medium'
      });
      results.score += 30;
    }
    
    // Determine action based on fraud score
    if (results.score >= 70) {
      results.action = 'block';
    } else if (results.score >= 40) {
      results.action = 'flag';
    }
    
    // Record suspicious activity
    if (results.isSuspicious) {
      await recordSuspiciousActivity({
        ...conversionData,
        type: 'conversion'
      }, results);
    }
    
    return results;
  } catch (error) {
    logger.error('Error in conversion fraud detection:', error);
    return { isSuspicious: false, flags: [], score: 0, action: 'allow' };
  }
}

/**
 * Check conversion frequency from the same IP address
 * @param {string} ip - IP address
 * @returns {number} Number of conversions in the last day
 */
async function checkConversionFrequency(ip) {
  const now = Date.now();
  const oneDayAgo = now - 86400000; // 24 hours ago
  
  // Add current conversion to the sorted set
  await redis.zadd(`fraud:ip:conversions:${ip}`, now, now.toString());
  
  // Count conversions in the last day
  const recentConversions = await redis.zcount(`fraud:ip:conversions:${ip}`, oneDayAgo, '+inf');
  
  // Remove old entries (older than 7 days)
  await redis.zremrangebyscore(`fraud:ip:conversions:${ip}`, 0, now - 604800000);
  
  return recentConversions;
}

/**
 * Check if an order ID has been used before
 * @param {string} orderId - Order ID to check
 * @returns {boolean} True if duplicate
 */
async function isDuplicateOrder(orderId) {
  const exists = await redis.exists(`fraud:order:${orderId}`);
  
  if (!exists) {
    // Set with expiration (90 days)
    await redis.set(`fraud:order:${orderId}`, '1', 'EX', 60 * 60 * 24 * 90);
    return false;
  }
  
  return true;
}

/**
 * Check if a conversion value is suspicious for the campaign
 * @param {number} amount - Conversion amount
 * @param {string} campaignId - Campaign ID
 * @returns {boolean} True if suspicious
 */
async function isSuspiciousValue(amount, campaignId) {
  if (!amount) return false;
  
  // Get campaign average order value
  const campaignStats = await redis.hgetall(`metrics:campaign:${campaignId}:stats`);
  
  if (!campaignStats || !campaignStats.avgOrderValue) {
    return false;
  }
  
  const avgValue = parseFloat(campaignStats.avgOrderValue);
  const stdDev = parseFloat(campaignStats.orderValueStdDev || avgValue * 0.5);
  
  // Check if value is significantly higher than average (potential fraud)
  // or significantly lower (potential gaming of the system)
  return amount > (avgValue + 3 * stdDev) || (amount < (avgValue - 3 * stdDev) && amount > 0);
}

module.exports = {
  validateClick,
  validateConversion,
  recordSuspiciousActivity
};
/**
 * Tracking Service
 * Handles link generation, cookie persistence, and event tracking
 */

const { v4: uuidv4 } = require('uuid');
const Fingerprint = require('fingerprintjs2');
const redis = require('../utils/redis');
const logger = require('../utils/logger');
const { publishEvent } = require('./eventProcessing');
const Campaign = require('../models/campaign');
const Affiliate = require('../models/affiliate');

// Constants for tracking
const COOKIE_NAME = 'mgm_tracking';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
const ATTRIBUTION_WINDOW = 30; // days

/**
 * Generate a unique tracking link for an affiliate and campaign
 * @param {string} affiliateId - The affiliate's ID
 * @param {string} campaignId - The campaign's ID
 * @param {Object} options - Additional options for link generation
 * @returns {Object} The generated link data
 */
async function generateTrackingLink(affiliateId, campaignId, options = {}) {
  try {
    // Validate affiliate and campaign existence
    const [affiliate, campaign] = await Promise.all([
      Affiliate.findById(affiliateId),
      Campaign.findById(campaignId)
    ]);

    if (!affiliate || !campaign) {
      throw new Error('Affiliate or campaign not found');
    }

    // Generate unique tracking ID
    const trackingId = uuidv4();
    
    // Create link data
    const linkData = {
      trackingId,
      affiliateId,
      campaignId,
      createdAt: new Date(),
      customParameters: options.customParameters || {},
      landingPage: options.landingPage || campaign.defaultLandingPage
    };

    // Store link data in Redis for quick access
    await redis.set(`tracking:link:${trackingId}`, JSON.stringify(linkData), 'EX', 60 * 60 * 24 * 90); // 90 days

    // Construct the actual URL
    const baseUrl = process.env.TRACKING_DOMAIN || 'https://track.mgmplatform.com';
    const trackingUrl = `${baseUrl}/c/${trackingId}`;

    return {
      trackingId,
      trackingUrl,
      linkData
    };
  } catch (error) {
    logger.error('Error generating tracking link:', error);
    throw error;
  }
}

/**
 * Track a click event
 * @param {string} trackingId - The tracking ID from the URL
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Tracking data
 */
async function trackClick(trackingId, req, res) {
  try {
    // Get link data from Redis
    const linkDataStr = await redis.get(`tracking:link:${trackingId}`);
    if (!linkDataStr) {
      throw new Error('Invalid tracking link');
    }

    const linkData = JSON.parse(linkDataStr);
    
    // Collect tracking data
    const trackingData = {
      trackingId,
      affiliateId: linkData.affiliateId,
      campaignId: linkData.campaignId,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer || '',
      eventType: 'click'
    };

    // Generate fingerprint for cross-device tracking
    const fingerprint = new Fingerprint({
      canvas: true,
      screen: true,
      fonts: true
    });
    trackingData.fingerprint = fingerprint.get();

    // Set tracking cookie
    if (res) {
      res.cookie(COOKIE_NAME, JSON.stringify({
        trackingId,
        affiliateId: linkData.affiliateId,
        campaignId: linkData.campaignId,
        timestamp: trackingData.timestamp
      }), {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    // Store click data
    await redis.set(
      `tracking:click:${trackingId}:${trackingData.fingerprint}`, 
      JSON.stringify(trackingData),
      'EX', 
      60 * 60 * 24 * ATTRIBUTION_WINDOW // Store for attribution window period
    );

    // Publish event for async processing
    await publishEvent('tracking.click', trackingData);

    return {
      trackingData,
      redirectUrl: linkData.landingPage
    };
  } catch (error) {
    logger.error('Error tracking click:', error);
    throw error;
  }
}

/**
 * Track a conversion event
 * @param {Object} conversionData - Data about the conversion
 * @param {Object} req - Express request object
 * @returns {Object} Attribution data
 */
async function trackConversion(conversionData, req) {
  try {
    let attributionData = null;
    const timestamp = new Date();
    
    // Try to get tracking info from cookie
    let trackingInfo = null;
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      try {
        trackingInfo = JSON.parse(req.cookies[COOKIE_NAME]);
      } catch (e) {
        logger.warn('Invalid tracking cookie format');
      }
    }

    // Generate fingerprint for cross-device tracking
    const fingerprint = new Fingerprint({
      canvas: true,
      screen: true,
      fonts: true
    });
    const deviceFingerprint = fingerprint.get();

    // If we have tracking info from cookie
    if (trackingInfo && trackingInfo.trackingId) {
      // Check if click is within attribution window
      const clickTime = new Date(trackingInfo.timestamp);
      const now = new Date();
      const daysDiff = (now - clickTime) / (1000 * 60 * 60 * 24);
      
      if (daysDiff <= ATTRIBUTION_WINDOW) {
        attributionData = {
          trackingId: trackingInfo.trackingId,
          affiliateId: trackingInfo.affiliateId,
          campaignId: trackingInfo.campaignId,
          conversionId: conversionData.orderId || uuidv4(),
          amount: conversionData.amount,
          currency: conversionData.currency,
          products: conversionData.products,
          clickTimestamp: new Date(trackingInfo.timestamp),
          conversionTimestamp: timestamp,
          attributionModel: 'last-click',
          attributionSource: 'cookie'
        };
      }
    }

    // If no attribution from cookie, try fingerprint matching
    if (!attributionData) {
      // Search for clicks with matching fingerprint within attribution window
      const clickKeys = await redis.keys(`tracking:click:*:${deviceFingerprint}`);
      
      if (clickKeys.length > 0) {
        // Sort by timestamp (most recent first) for last-click attribution
        const clicksData = await Promise.all(
          clickKeys.map(async key => JSON.parse(await redis.get(key)))
        );
        
        clicksData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const latestClick = clicksData[0];
        
        // Check if within attribution window
        const clickTime = new Date(latestClick.timestamp);
        const now = new Date();
        const daysDiff = (now - clickTime) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= ATTRIBUTION_WINDOW) {
          attributionData = {
            trackingId: latestClick.trackingId,
            affiliateId: latestClick.affiliateId,
            campaignId: latestClick.campaignId,
            conversionId: conversionData.orderId || uuidv4(),
            amount: conversionData.amount,
            currency: conversionData.currency,
            products: conversionData.products,
            clickTimestamp: new Date(latestClick.timestamp),
            conversionTimestamp: timestamp,
            attributionModel: 'last-click',
            attributionSource: 'fingerprint'
          };
        }
      }
    }

    // Record the conversion event regardless of attribution
    const conversionEvent = {
      ...conversionData,
      timestamp,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      fingerprint: deviceFingerprint,
      eventType: 'conversion',
      attribution: attributionData
    };

    // Publish conversion event for async processing
    await publishEvent('tracking.conversion', conversionEvent);

    return {
      conversionId: conversionData.orderId || conversionEvent.conversionId,
      attribution: attributionData,
      timestamp
    };
  } catch (error) {
    logger.error('Error tracking conversion:', error);
    throw error;
  }
}

/**
 * Get fallback tracking method when cookies are blocked
 * @param {Object} req - Express request object
 * @returns {string} Best available tracking method
 */
function getFallbackTrackingMethod(req) {
  // Check if cookies are enabled
  const cookiesEnabled = req.cookies && Object.keys(req.cookies).length > 0;
  
  if (cookiesEnabled) {
    return 'cookie';
  }
  
  // Use fingerprinting as fallback
  return 'fingerprint';
}

module.exports = {
  generateTrackingLink,
  trackClick,
  trackConversion,
  getFallbackTrackingMethod,
  COOKIE_NAME,
  ATTRIBUTION_WINDOW
};
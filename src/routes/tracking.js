/**
 * Tracking Routes
 * Handles API endpoints for tracking links, clicks, and conversions
 */

const express = require('express');
const router = express.Router();
const {
  generateTrackingLink,
  trackClick,
  trackConversion,
  getFallbackTrackingMethod
} = require('../services/tracking');
const logger = require('../utils/logger');

// Generate tracking link
router.post('/link', async (req, res) => {
  try {
    const { affiliateId, campaignId, ...options } = req.body;
    
    if (!affiliateId || !campaignId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const linkData = await generateTrackingLink(affiliateId, campaignId, options);
    res.json(linkData);
  } catch (error) {
    logger.error('Error generating tracking link:', error);
    res.status(500).json({ error: 'Failed to generate tracking link' });
  }
});

// Handle click tracking
router.get('/c/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const trackingResult = await trackClick(trackingId, req, res);
    
    // Redirect to landing page
    res.redirect(trackingResult.redirectUrl);
  } catch (error) {
    logger.error('Error tracking click:', error);
    res.status(500).json({ error: 'Failed to process click' });
  }
});

// Track conversion
router.post('/conversion', async (req, res) => {
  try {
    const conversionData = req.body;
    
    if (!conversionData.orderId && !conversionData.amount) {
      return res.status(400).json({ error: 'Missing required conversion data' });
    }

    const result = await trackConversion(conversionData, req);
    res.json(result);
  } catch (error) {
    logger.error('Error tracking conversion:', error);
    res.status(500).json({ error: 'Failed to track conversion' });
  }
});

// Get fallback tracking method
router.get('/fallback-method', (req, res) => {
  try {
    const method = getFallbackTrackingMethod(req);
    res.json({ trackingMethod: method });
  } catch (error) {
    logger.error('Error getting fallback tracking method:', error);
    res.status(500).json({ error: 'Failed to determine tracking method' });
  }
});

module.exports = router;
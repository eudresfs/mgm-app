/**
 * Affiliate routes
 * Handles API endpoints for affiliate module features
 */

const express = require('express');
const router = express.Router();
const affiliateService = require('../services/affiliate');
const trackingService = require('../services/tracking');
const affiliateRewardsService = require('../services/affiliateRewards');
const authenticate = require('../middleware/authenticate');
const { validateRequest } = require('../middleware/validation');

// GET /api/affiliates - List all affiliates (admin only)
router.get('/', authenticate(['admin']), async (req, res, next) => {
  try {
    const affiliates = await Affiliate.find({});
    res.status(200).json(affiliates);
  } catch (error) {
    next(error);
  }
});

// GET /api/affiliates/:id - Get affiliate profile
router.get('/:id', authenticate(), async (req, res, next) => {
  try {
    // Check if user is requesting their own profile or is admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const affiliate = await Affiliate.findById(req.params.id);
    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }
    
    res.status(200).json(affiliate);
  } catch (error) {
    next(error);
  }
});

// POST /api/affiliates - Create new affiliate
router.post('/', validateRequest('affiliate'), async (req, res, next) => {
  try {
    const newAffiliate = new Affiliate(req.body);
    await newAffiliate.save();
    res.status(201).json(newAffiliate);
  } catch (error) {
    next(error);
  }
});

// PUT /api/affiliates/:id - Update affiliate profile
router.put('/:id', authenticate(), validateRequest('affiliate'), async (req, res, next) => {
  try {
    // Check if user is updating their own profile or is admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const affiliate = await Affiliate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }
    
    res.status(200).json(affiliate);
  } catch (error) {
    next(error);
  }
});

// GET /api/affiliates/:id/discover-campaigns - Discover relevant campaigns
router.get('/:id/discover-campaigns', authenticate(), async (req, res, next) => {
  try {
    // Check if user is requesting their own data
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const campaigns = await affiliateService.discoverCampaigns(
      req.params.id,
      req.query // Pass query parameters as filters
    );
    
    res.status(200).json(campaigns);
  } catch (error) {
    next(error);
  }
});

// GET /api/affiliates/:id/metrics - Get real-time metrics
router.get('/:id/metrics', authenticate(), async (req, res, next) => {
  try {
    // Check if user is requesting their own data
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const metrics = await affiliateService.getRealTimeMetrics(req.params.id);
    res.status(200).json(metrics);
  } catch (error) {
    next(error);
  }
});

// POST /api/affiliates/:id/generate-link - Generate tracking link
router.post('/:id/generate-link', authenticate(), async (req, res, next) => {
  try {
    // Check if user is requesting their own data
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const { campaignId, options } = req.body;
    
    if (!campaignId) {
      return res.status(400).json({ error: 'Campaign ID is required' });
    }
    
    const linkData = await trackingService.generateTrackingLink(
      req.params.id,
      campaignId,
      options
    );
    
    res.status(200).json(linkData);
  } catch (error) {
    next(error);
  }
});

// POST /api/affiliates/:id/promotional-materials - Generate promotional materials
router.post('/:id/promotional-materials', authenticate(), async (req, res, next) => {
  try {
    // Check if user is requesting their own data
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const { campaignId, options } = req.body;
    
    if (!campaignId) {
      return res.status(400).json({ error: 'Campaign ID is required' });
    }
    
    const materials = await affiliateService.generatePromotionalMaterials(
      req.params.id,
      campaignId,
      options
    );
    
    res.status(200).json(materials);
  } catch (error) {
    next(error);
  }
});

// GET /api/affiliates/:id/performance - Get performance reports
router.get('/:id/performance', authenticate(), async (req, res, next) => {
  try {
    // Check if user is requesting their own data
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const report = await affiliateService.getPerformanceReport(
      req.params.id,
      req.query // Pass query parameters as filters
    );
    
    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
});

// GET /api/affiliates/:id/goals - Get affiliate's goals and progress
router.get('/:id/goals', authenticate(), async (req, res, next) => {
  try {
    // Check if user is requesting their own data
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const goalsProgress = await affiliateRewardsService.getGoalsProgress(req.params.id);
    res.status(200).json(goalsProgress);
  } catch (error) {
    next(error);
  }
});

// GET /api/affiliates/:id/rewards - Get affiliate's available rewards
router.get('/:id/rewards', authenticate(), async (req, res, next) => {
  try {
    // Check if user is requesting their own data
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const rewards = await affiliateRewardsService.getAvailableRewards(req.params.id);
    res.status(200).json(rewards);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
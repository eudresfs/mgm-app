/**
 * Campaign routes
 * Handles all campaign management API endpoints
 */

const express = require('express');
const router = express.Router();
const campaignService = require('../services/campaign');
const authenticate = require('../middleware/authenticate');
const validation = require('../middleware/validation');

/**
 * @route GET /api/campaigns
 * @desc Get all campaigns for merchant
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const merchantId = req.user.merchantId;
    const filters = req.query;
    const campaigns = await campaignService.getMerchantCampaigns(merchantId, filters);
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/campaigns/:id
 * @desc Get campaign by ID
 * @access Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/campaigns
 * @desc Create a new campaign
 * @access Private
 */
router.post('/', [authenticate, validation.campaignRules()], async (req, res) => {
  try {
    const campaignData = {
      ...req.body,
      merchant: req.user.merchantId
    };
    const campaign = await campaignService.createCampaign(campaignData);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route PUT /api/campaigns/:id
 * @desc Update an existing campaign
 * @access Private
 */
router.put('/:id', [authenticate, validation.campaignRules()], async (req, res) => {
  try {
    const campaign = await campaignService.updateCampaign(req.params.id, req.body);
    res.status(200).json(campaign);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route POST /api/campaigns/:id/duplicate
 * @desc Duplicate an existing campaign
 * @access Private
 */
router.post('/:id/duplicate', authenticate, async (req, res) => {
  try {
    const campaign = await campaignService.duplicateCampaign(req.params.id);
    res.status(201).json(campaign);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route POST /api/campaigns/:id/approve
 * @desc Process affiliate approval for campaign
 * @access Private
 */
router.post('/:id/approve/:affiliateId', authenticate, async (req, res) => {
  try {
    const result = await campaignService.processAffiliateApproval(
      req.params.id,
      req.params.affiliateId
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/campaigns/available
 * @desc Get campaigns available for affiliates
 * @access Private (Affiliate)
 */
router.get('/available', authenticate, async (req, res) => {
  try {
    const affiliateId = req.user.affiliateId;
    const filters = req.query;
    const campaigns = await campaignService.getAvailableCampaigns(affiliateId, filters);
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
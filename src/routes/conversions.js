/**
 * Conversion routes
 * Handles conversion tracking and management
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authenticate');
const conversionService = require('../services/conversion');
const logger = require('../utils/logger');

// GET /api/conversions
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = req.query;
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };
    const conversions = await conversionService.getConversions(filters, options);
    res.status(200).json(conversions);
  } catch (error) {
    logger.error('Error fetching conversions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/conversions/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const conversion = await conversionService.getConversionById(req.params.id);
    res.status(200).json(conversion);
  } catch (error) {
    if (error.message === 'Conversion not found') {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error fetching conversion:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/conversions/:id/approve
router.post('/:id/approve', [authenticate, authorize(['admin', 'merchant'])], async (req, res) => {
  try {
    const conversion = await conversionService.approveConversion(req.params.id, req.body);
    res.status(200).json(conversion);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error approving conversion:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/conversions/:id/reject
router.post('/:id/reject', [authenticate, authorize(['admin', 'merchant'])], async (req, res) => {
  try {
    const conversion = await conversionService.rejectConversion(req.params.id, req.body);
    res.status(200).json(conversion);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error rejecting conversion:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/conversions/:id/flag
router.post('/:id/flag', [authenticate, authorize(['admin', 'merchant'])], async (req, res) => {
  try {
    const conversion = await conversionService.flagConversion(req.params.id, req.body);
    res.status(200).json(conversion);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error flagging conversion:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
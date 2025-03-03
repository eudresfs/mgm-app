/**
 * Affiliate routes
 * Mock implementation for testing purposes
 */

const express = require('express');
const router = express.Router();

// GET /api/affiliates
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Affiliates list' });
});

// GET /api/affiliates/:id
router.get('/:id', (req, res) => {
  res.status(200).json({ id: req.params.id, name: 'Test Affiliate' });
});

// POST /api/affiliates
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Affiliate created', id: 'new-affiliate-id' });
});

module.exports = router;
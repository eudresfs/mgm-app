/**
 * Rewards routes
 * Mock implementation for testing purposes
 */

const express = require('express');
const router = express.Router();

// GET /api/rewards
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Rewards list' });
});

// GET /api/rewards/:id
router.get('/:id', (req, res) => {
  res.status(200).json({ id: req.params.id, type: 'commission', amount: 50 });
});

// POST /api/rewards
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Reward created', id: 'new-reward-id' });
});

module.exports = router;
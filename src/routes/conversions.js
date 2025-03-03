/**
 * Conversion routes
 * Mock implementation for testing purposes
 */

const express = require('express');
const router = express.Router();

// GET /api/conversions
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Conversions list' });
});

// GET /api/conversions/:id
router.get('/:id', (req, res) => {
  res.status(200).json({ id: req.params.id, type: 'sale', amount: 100 });
});

// POST /api/conversions
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Conversion recorded', id: 'new-conversion-id' });
});

module.exports = router;
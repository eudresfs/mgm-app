const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/authenticate');

// Register new user
router.post('/register', validateRegistration, rateLimiter, async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', validateLogin, rateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const result = await authService.verifyEmail(req.params.token);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Request password reset
router.post('/forgot-password', rateLimiter, async (req, res) => {
  try {
    const result = await authService.requestPasswordReset(req.body.email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reset password
router.post('/reset-password/:token', rateLimiter, async (req, res) => {
  try {
    const result = await authService.resetPassword(req.params.token, req.body.newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Setup 2FA
router.post('/2fa/enable', authenticate, async (req, res) => {
  try {
    const result = await authService.setupTwoFactor(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Social login callback
router.post('/social-login/:provider', async (req, res) => {
  try {
    // Validate required fields
    const { id, email, name } = req.body;
    if (!id || !email || !name) {
      return res.status(400).json({ error: 'Missing required profile information' });
    }

    const result = await authService.socialLogin(req.params.provider, {
      id,
      email,
      name
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

module.exports = router;
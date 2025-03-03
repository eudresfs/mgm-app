const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const { validateRegistration, validateLogin, validateRefreshToken } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/authenticate');

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
    // Collect device info for security tracking
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip
    };
    const result = await authService.login(email, password, deviceInfo);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Refresh token
router.post('/refresh-token', validateRefreshToken, rateLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Revoke token (logout)
router.post('/logout', auth.authenticate, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    await authService.revokeToken(refreshToken);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reset password
router.post('/reset-password/:token', rateLimiter, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const result = await authService.resetPassword(req.params.token, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', auth.authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedUser = await authService.updateProfile(userId, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Two-factor authentication routes

// Enable 2FA
router.post('/2fa/enable', auth.authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await authService.setupTwoFactor(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify and activate 2FA
router.post('/2fa/verify', auth.authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { token } = req.body;
    
    // Verify the token against user's secret
    const user = await User.findById(userId);
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });
    
    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
    
    // Activate 2FA
    user.twoFactorEnabled = true;
    await user.save();
    
    res.status(200).json({ success: true, message: '2FA activated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete login with 2FA
router.post('/2fa/login', async (req, res) => {
  try {
    const { twoFactorToken, token } = req.body;
    
    // Verify the temporary token
    const decoded = jwt.verify(twoFactorToken, process.env.JWT_SECRET || 'test-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify the 2FA token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });
    
    if (!verified) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Generate full access token
    const accessToken = authService.generateToken(user);
    
    res.status(200).json({
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Disable 2FA
router.post('/2fa/disable', auth.authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { token } = req.body;
    
    // Verify the token for security
    const user = await User.findById(userId);
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });
    
    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
    
    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();
    
    res.status(200).json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
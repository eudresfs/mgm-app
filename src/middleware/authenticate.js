const jwt = require('jsonwebtoken');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token expiration
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ error: 'Token expired' });
    }

    const user = await User.findOne({ _id: decoded.userId }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is active and email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ error: 'Email not verified' });
    }

    // Add user and role information to request object
    req.user = user;
    req.userRole = user.role;

    // Log authentication success
    logger.info('User authenticated successfully', { userId: user._id, role: user.role });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
};

// Middleware for role-based access control
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
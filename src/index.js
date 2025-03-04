/**
 * MGM Affiliate Marketing Platform
 * Main application entry point
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const configurePassport = require('./config/socialAuth');
const { setupKafka } = require('./services/eventProcessing');
const logger = require('./utils/logger');

// Import route handlers
const trackingRoutes = require('./routes/tracking');
const campaignRoutes = require('./routes/campaigns');
const affiliateRoutes = require('./routes/affiliates');
const conversionRoutes = require('./routes/conversions');
const rewardRoutes = require('./routes/rewards');
const authRoutes = require('./routes/auth');
const socialAuthRoutes = require('./routes/socialAuth');
const adminRoutes = require('./routes/admin');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize session and passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'test-session-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Configure passport strategies
configurePassport();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mgm-affiliate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => logger.info('Connected to MongoDB'))
.catch(err => logger.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/social', socialAuthRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/conversions', conversionRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server with port retry mechanism
const startServer = (port) => {
  const server = app.listen(port)
    .on('listening', () => {
      logger.info(`Server running on port ${port}`);
      
      // Initialize Kafka for event processing
      setupKafka().catch(err => {
        logger.error('Failed to setup Kafka:', err);
      });
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`Port ${port} is in use, trying ${port + 1}`);
        server.close();
        startServer(port + 1);
      } else {
        logger.error('Server error:', err);
      }
    });
};

startServer(PORT);

module.exports = app; // For testing purposes
const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { generateToken } = require('../services/auth');
const TrackingService = require('../services/tracking');
const FraudDetectionService = require('../services/fraudDetection');
const Campaign = require('../models/campaign');
const Affiliate = require('../models/affiliate');
const Conversion = require('../models/conversion');
const MockDate = require('mockdate');

let mongoServer;
let testAffiliate;
let testCampaign;
let authToken;

describe('Tracking System Advanced Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create test affiliate and campaign
    testAffiliate = await Affiliate.create({
      name: 'Test Affiliate',
      email: 'affiliate@test.com'
    });
    
    testCampaign = await Campaign.create({
      name: 'Test Campaign',
      description: 'Test campaign for tracking',
      type: 'cpa',
      commission: {
        type: 'fixed',
        value: 50,
        currency: 'USD'
      },
      attributionWindow: 7, // 7 days default
      status: 'active'
    });
    
    authToken = generateToken({ affiliateId: testAffiliate._id });
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Conversion.deleteMany({});
    // Reset mock date to current date
    MockDate.reset();
  });

  describe('Attribution Window Tests', () => {
    it('should attribute conversion with custom window (30 days)', async () => {
      // Create campaign with 30-day attribution window
      const customCampaign = await Campaign.create({
        name: 'Custom Window Campaign',
        description: 'Campaign with 30-day window',
        type: 'cpa',
        commission: {
          type: 'fixed',
          value: 50,
          currency: 'USD'
        },
        attributionWindow: 30, // 30 days
        status: 'active'
      });

      // Register a click
      const clickResponse = await request(app)
        .get(`/api/tracking/click?campaignId=${customCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const clickId = clickResponse.headers.location.split('clickId=')[1];
      
      // Move time forward 25 days (within 30-day window)
      MockDate.set(Date.now() + 25 * 24 * 60 * 60 * 1000);
      
      // Register a conversion
      const conversionResponse = await request(app)
        .post('/api/tracking/conversion')
        .send({
          clickId: clickId,
          orderId: 'test-order-789',
          amount: 100
        });
      
      expect(conversionResponse.status).toBe(200);
      expect(conversionResponse.body.attributed).toBe(true);
      expect(conversionResponse.body.affiliateId).toBe(testAffiliate._id.toString());
    });

    it('should handle attribution conflict with last-click wins', async () => {
      // Create two affiliates
      const affiliate1 = await Affiliate.create({
        name: 'Affiliate 1',
        email: 'affiliate1@test.com'
      });
      
      const affiliate2 = await Affiliate.create({
        name: 'Affiliate 2',
        email: 'affiliate2@test.com'
      });
      
      // Register click from first affiliate
      await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${affiliate1._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        .set('Cookie', ['mgm_visitor_id=visitor123']);
      
      // Move time forward 2 days
      MockDate.set(Date.now() + 2 * 24 * 60 * 60 * 1000);
      
      // Register click from second affiliate (same visitor)
      const click2Response = await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${affiliate2._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        .set('Cookie', ['mgm_visitor_id=visitor123']);
      
      const clickId2 = click2Response.headers.location.split('clickId=')[1];
      
      // Register conversion
      const conversionResponse = await request(app)
        .post('/api/tracking/conversion')
        .send({
          visitorId: 'visitor123',
          orderId: 'test-order-conflict',
          amount: 200
        });
      
      expect(conversionResponse.status).toBe(200);
      expect(conversionResponse.body.attributed).toBe(true);
      expect(conversionResponse.body.affiliateId).toBe(affiliate2._id.toString()); // Last click wins
    });
  });

  describe('Fraud Detection Tests', () => {
    it('should detect suspicious click patterns', async () => {
      // Simulate multiple clicks from same IP in short time
      const clickPromises = [];
      for (let i = 0; i < 20; i++) {
        clickPromises.push(
          request(app)
            .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            .set('X-Forwarded-For', '192.168.1.1') // Same IP address
        );
      }
      
      await Promise.all(clickPromises);
      
      // Check if fraud detection service flagged the clicks
      const fraudReport = await FraudDetectionService.getReportForAffiliate(testAffiliate._id);
      expect(fraudReport).toBeDefined();
      expect(fraudReport.suspiciousClicks).toBeGreaterThan(0);
      expect(fraudReport.riskLevel).toBeGreaterThan(0);
    });

    it('should detect duplicate conversions', async () => {
      // Register a click
      const clickResponse = await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const clickId = clickResponse.headers.location.split('clickId=')[1];
      
      // Register first conversion
      const firstConversion = await request(app)
        .post('/api/tracking/conversion')
        .send({
          clickId: clickId,
          orderId: 'duplicate-order-123',
          amount: 100
        });
      
      expect(firstConversion.status).toBe(200);
      expect(firstConversion.body.attributed).toBe(true);
      
      // Try to register duplicate conversion with same order ID
      const duplicateConversion = await request(app)
        .post('/api/tracking/conversion')
        .send({
          clickId: clickId,
          orderId: 'duplicate-order-123', // Same order ID
          amount: 100
        });
      
      expect(duplicateConversion.status).toBe(400);
      expect(duplicateConversion.body.error).toContain('duplicate');
    });
  });

  describe('Cross-Device Tracking Tests', () => {
    it('should track user across devices when logged in', async () => {
      // Create a user account
      const testUser = await User.create({
        name: 'Cross Device User',
        email: 'crossdevice@test.com',
        password: 'Test@123'
      });
      
      // Register click from first device
      await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36') // Desktop
        .set('Cookie', [`mgm_visitor_id=visitor123; auth_token=${generateToken({ userId: testUser._id })}`]);
      
      // Register conversion from second device
      const conversionResponse = await request(app)
        .post('/api/tracking/conversion')
        .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3)') // Mobile
        .set('Cookie', [`auth_token=${generateToken({ userId: testUser._id })}`])
        .send({
          userId: testUser._id,
          orderId: 'cross-device-order',
          amount: 150
        });
      
      expect(conversionResponse.status).toBe(200);
      expect(conversionResponse.body.attributed).toBe(true);
      expect(conversionResponse.body.affiliateId).toBe(testAffiliate._id.toString());
      expect(conversionResponse.body.crossDeviceAttribution).toBe(true);
    });
  });

  describe('Indirect Conversion Tests', () => {
    it('should track indirect conversions through multiple pages', async () => {
      // Register initial click on affiliate link
      const clickResponse = await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const visitorId = clickResponse.headers['set-cookie']
        .find(cookie => cookie.includes('mgm_visitor_id'))
        .split('=')[1]
        .split(';')[0];
      
      // Simulate browsing multiple pages
      await request(app)
        .get('/api/products/category/electronics')
        .set('Cookie', [`mgm_visitor_id=${visitorId}`]);
      
      await request(app)
        .get('/api/products/12345')
        .set('Cookie', [`mgm_visitor_id=${visitorId}`]);
      
      // Register conversion after browsing journey
      const conversionResponse = await request(app)
        .post('/api/tracking/conversion')
        .set('Cookie', [`mgm_visitor_id=${visitorId}`])
        .send({
          visitorId: visitorId,
          orderId: 'indirect-conversion-123',
          amount: 299.99,
          conversionPath: [
            '/landing-page',
            '/products/category/electronics',
            '/products/12345',
            '/checkout'
          ]
        });
      
      expect(conversionResponse.status).toBe(200);
      expect(conversionResponse.body.attributed).toBe(true);
      expect(conversionResponse.body.affiliateId).toBe(testAffiliate._id.toString());
      expect(conversionResponse.body.conversionType).toBe('indirect');
    });
  });
});
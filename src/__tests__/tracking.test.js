const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { generateToken } = require('../services/auth');
const TrackingService = require('../services/tracking');
const Campaign = require('../models/campaign');
const Affiliate = require('../models/affiliate');
const Conversion = require('../models/conversion');
const MockDate = require('mockdate');

let mongoServer;
let testAffiliate;
let testCampaign;
let authToken;

describe('Tracking System Tests', () => {
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

  describe('Cookie Persistence Tests', () => {
    it('should create tracking cookie with 30 days TTL', async () => {
      const response = await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      expect(response.status).toBe(302); // Redirect
      
      // Check cookie in response
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      
      const trackingCookie = cookies.find(cookie => cookie.includes('mgm_tracking'));
      expect(trackingCookie).toBeDefined();
      expect(trackingCookie).toContain('Max-Age=2592000'); // 30 days in seconds
    });

    it('should update cookie TTL on subsequent visits', async () => {
      // First visit to set initial cookie
      await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      // Mock cookie being sent back
      const response = await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        .set('Cookie', [`mgm_tracking=${testAffiliate._id}.${testCampaign._id}.${Date.now()}`]);

      expect(response.status).toBe(302);
      
      // Check cookie in response
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      
      const trackingCookie = cookies.find(cookie => cookie.includes('mgm_tracking'));
      expect(trackingCookie).toBeDefined();
      expect(trackingCookie).toContain('Max-Age=2592000'); // 30 days in seconds
    });
  });

  describe('Fingerprinting and Cross-Device Tests', () => {
    it('should generate fingerprint for tracking', async () => {
      const response = await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      expect(response.status).toBe(302);
      
      // Check if fingerprint was generated and stored
      const clickId = response.headers.location.split('clickId=')[1];
      expect(clickId).toBeDefined();
      
      // Verify click was recorded with fingerprint
      const clickData = await TrackingService.getClickData(clickId);
      expect(clickData).toBeDefined();
      expect(clickData.fingerprint).toBeDefined();
    });

    it('should use fingerprint when cookies are blocked', async () => {
      // Simulate a browser that blocks cookies
      const response = await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        .set('DNT', '1') // Do Not Track header
        .set('Cookie', ''); // Empty cookie header

      expect(response.status).toBe(302);
      
      // Check if tracking still works via fingerprint
      const clickId = response.headers.location.split('clickId=')[1];
      expect(clickId).toBeDefined();
      
      // Verify click was recorded with fingerprint
      const clickData = await TrackingService.getClickData(clickId);
      expect(clickData).toBeDefined();
      expect(clickData.fingerprint).toBeDefined();
      expect(clickData.cookieTracking).toBe(false);
      expect(clickData.fingerprintTracking).toBe(true);
    });
  });

  describe('Attribution Window Tests', () => {
    it('should attribute conversion within default window (7 days)', async () => {
      // Register a click
      const clickResponse = await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const clickId = clickResponse.headers.location.split('clickId=')[1];
      
      // Move time forward 5 days
      MockDate.set(Date.now() + 5 * 24 * 60 * 60 * 1000);
      
      // Register a conversion
      const conversionResponse = await request(app)
        .post('/api/tracking/conversion')
        .send({
          clickId: clickId,
          orderId: 'test-order-123',
          amount: 100
        });
      
      expect(conversionResponse.status).toBe(200);
      expect(conversionResponse.body.attributed).toBe(true);
      expect(conversionResponse.body.affiliateId).toBe(testAffiliate._id.toString());
    });

    it('should not attribute conversion outside default window', async () => {
      // Register a click
      const clickResponse = await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const clickId = clickResponse.headers.location.split('clickId=')[1];
      
      // Move time forward 10 days (outside 7-day window)
      MockDate.set(Date.now() + 10 * 24 * 60 * 60 * 1000);
      
      // Register a conversion
      const conversionResponse = await request(app)
        .post('/api/tracking/conversion')
        .send({
          clickId: clickId,
          orderId: 'test-order-456',
          amount: 100
        });
      
      expect(conversionResponse.status).toBe(200);
      expect(conversionResponse.body.attributed).toBe(false);
    });

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
      
      // Move time forward 25 days
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
  });

  describe('Fraud Detection Tests', () => {
    it('should flag suspicious click patterns', async () => {
      // Simulate multiple clicks from same IP
      const clickPromises = [];
      for (let i = 0; i < 50; i++) {
        clickPromises.push(
          request(app)
            .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            .set('X-Forwarded-For', '192.168.1.1') // Same IP
        );
      }
      
      await Promise.all(clickPromises);
      
      // Check fraud detection system
      const fraudReport = await TrackingService.getFraudReport('192.168.1.1');
      expect(fraudReport).toBeDefined();
      expect(fraudReport.suspiciousActivity).toBe(true);
      expect(fraudReport.clickCount).toBeGreaterThanOrEqual(50);
    });

    it('should detect duplicate conversions', async () => {
      // Register a click
      const clickResponse = await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const clickId = clickResponse.headers.location.split('clickId=')[1];
      
      // First conversion - should succeed
      const firstConversion = await request(app)
        .post('/api/tracking/conversion')
        .send({
          clickId: clickId,
          orderId: 'duplicate-order-123',
          amount: 100
        });
      
      expect(firstConversion.status).toBe(200);
      expect(firstConversion.body.attributed).toBe(true);
      
      // Second conversion with same order ID - should be flagged as duplicate
      const secondConversion = await request(app)
        .post('/api/tracking/conversion')
        .send({
          clickId: clickId,
          orderId: 'duplicate-order-123', // Same order ID
          amount: 100
        });
      
      expect(secondConversion.status).toBe(400);
      expect(secondConversion.body.error).toContain('duplicate');
    });
  });

  describe('Performance Tests', () => {
    it('should handle tracking requests with acceptable latency', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get(`/api/tracking/click?campaignId=${testCampaign._id}&affiliateId=${testAffiliate._id}`)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      expect(latency).toBeLessThan(300); // Less than 300ms
    });
  });
});
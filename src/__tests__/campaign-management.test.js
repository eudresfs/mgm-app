const request = require('supertest');
const app = require('../index');
const Campaign = require('../models/campaign');
const Merchant = require('../models/merchant');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { generateToken } = require('../services/auth');

let mongoServer;
let testMerchant;
let authToken;

describe('Campaign Management Tests', () => {
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

    // Create test merchant and generate auth token
    testMerchant = await Merchant.create({
      name: 'Test Merchant',
      email: 'merchant@test.com'
    });
    authToken = generateToken({ merchantId: testMerchant._id });
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Campaign.deleteMany({});
  });

  describe('Campaign Templates', () => {
    it('should create campaign from e-commerce template', async () => {
      const templateData = {
        name: 'E-commerce Campaign',
        template: 'ecommerce_standard',
        type: 'cps',
        commission: {
          type: 'percentage',
          value: 10,
          currency: 'USD'
        }
      };

      const response = await request(app)
        .post('/api/campaigns/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData);

      expect(response.status).toBe(201);
      expect(response.body.template).toBe('ecommerce_standard');
      expect(response.body.commission.type).toBe('percentage');
    });

    it('should create campaign from lead generation template', async () => {
      const templateData = {
        name: 'Lead Gen Campaign',
        template: 'lead_generation',
        type: 'cpl',
        commission: {
          type: 'fixed',
          value: 25,
          currency: 'USD'
        }
      };

      const response = await request(app)
        .post('/api/campaigns/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData);

      expect(response.status).toBe(201);
      expect(response.body.template).toBe('lead_generation');
      expect(response.body.commission.type).toBe('fixed');
    });
  });

  describe('Commission Configuration', () => {
    let testCampaign;

    beforeEach(async () => {
      testCampaign = await Campaign.create({
        name: 'Test Campaign',
        merchantId: testMerchant._id,
        type: 'cpa',
        commission: {
          type: 'fixed',
          value: 50,
          currency: 'USD'
        },
        status: 'active'
      });
    });

    it('should update commission structure', async () => {
      const updateData = {
        commission: {
          type: 'tiered',
          tiers: [
            { threshold: 0, value: 5 },
            { threshold: 1000, value: 7 },
            { threshold: 5000, value: 10 }
          ],
          currency: 'USD'
        }
      };

      const response = await request(app)
        .put(`/api/campaigns/${testCampaign._id}/commission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.commission.type).toBe('tiered');
      expect(response.body.commission.tiers).toHaveLength(3);
    });

    it('should validate commission rules', async () => {
      const invalidData = {
        commission: {
          type: 'percentage',
          value: 101 // Invalid percentage > 100
        }
      };

      const response = await request(app)
        .put(`/api/campaigns/${testCampaign._id}/commission`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid commission percentage');
    });
  });

  describe('Campaign Analytics', () => {
    let testCampaign;

    beforeEach(async () => {
      testCampaign = await Campaign.create({
        name: 'Analytics Test Campaign',
        merchantId: testMerchant._id,
        type: 'cpa',
        commission: {
          type: 'fixed',
          value: 50,
          currency: 'USD'
        },
        status: 'active',
        metrics: {
          clicks: 1000,
          conversions: 50,
          revenue: 2500
        }
      });
    });

    it('should retrieve campaign performance metrics', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${testCampaign._id}/analytics`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('conversionRate');
      expect(response.body).toHaveProperty('averageOrderValue');
      expect(response.body.conversionRate).toBe(5); // 50/1000 * 100
    });

    it('should retrieve campaign performance by date range', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${testCampaign._id}/analytics`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dailyMetrics');
      expect(Array.isArray(response.body.dailyMetrics)).toBe(true);
    });
  });
});
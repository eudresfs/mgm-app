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

describe('Campaign Module Tests', () => {
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

  describe('Campaign Creation', () => {
    it('should create a campaign with basic settings', async () => {
      const campaignData = {
        name: 'Test Campaign',
        description: 'Test campaign description',
        type: 'cpa',
        commission: {
          type: 'fixed',
          value: 50,
          currency: 'USD'
        },
        status: 'draft'
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(campaignData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(campaignData.name);
      expect(response.body.type).toBe(campaignData.type);
    });

    it('should validate commission structure', async () => {
      const invalidCampaign = {
        name: 'Invalid Campaign',
        type: 'cpa',
        commission: {
          type: 'invalid',
          value: -10
        }
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCampaign);

      expect(response.status).toBe(400);
    });
  });

  describe('Campaign Templates', () => {
    it('should create campaign from template', async () => {
      const templateData = {
        name: 'Template Campaign',
        template: 'ecommerce_basic',
        type: 'cps',
        commission: {
          type: 'percentage',
          value: 10
        }
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData);

      expect(response.status).toBe(201);
      expect(response.body.template).toBe(templateData.template);
    });
  });

  describe('Campaign Scheduling', () => {
    it('should schedule campaign start and end dates', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const scheduledCampaign = {
        name: 'Scheduled Campaign',
        type: 'cpl',
        commission: {
          type: 'fixed',
          value: 25
        },
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        scheduleSettings: {
          autoStart: true,
          autoEnd: true
        }
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(scheduledCampaign);

      expect(response.status).toBe(201);
      expect(response.body.scheduleSettings.statusTransitions).toHaveLength(2);
    });
  });

  describe('Campaign Management', () => {
    let testCampaign;

    beforeEach(async () => {
      testCampaign = await Campaign.create({
        name: 'Existing Campaign',
        merchant: testMerchant._id,
        type: 'cpa',
        commission: {
          type: 'fixed',
          value: 100
        },
        status: 'draft'
      });
    });

    it('should update campaign settings', async () => {
      const updates = {
        name: 'Updated Campaign',
        status: 'active'
      };

      const response = await request(app)
        .put(`/api/campaigns/${testCampaign._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updates.name);
      expect(response.body.status).toBe(updates.status);
    });

    it('should handle campaign duplication', async () => {
      const response = await request(app)
        .post(`/api/campaigns/${testCampaign._id}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body.name).toContain('Copy of');
    });
  });
});
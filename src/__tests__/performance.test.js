const request = require('supertest');
const app = require('../index');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { generateToken } = require('../services/auth');
const Campaign = require('../models/campaign');
const User = require('../models/user');

let mongoServer;
let testUser;
let authToken;

describe('Performance and Security Tests', () => {
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

    // Create test user and generate auth token
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@123',
      role: 'merchant'
    });
    authToken = generateToken({ userId: testUser._id });
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('Load Testing', () => {
    it('should handle multiple concurrent requests', async () => {
      const numRequests = 100;
      const requests = [];

      // Create multiple concurrent requests
      for (let i = 0; i < numRequests; i++) {
        requests.push(
          request(app)
            .get('/api/campaigns')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(requests);
      
      // Verify all requests were successful
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    }, 30000);

    it('should maintain response time under load', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`);
      
      const responseTime = Date.now() - start;
      expect(responseTime).toBeLessThan(300); // Response time should be under 300ms
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const numRequests = 50;
      const requests = [];

      // Send requests in rapid succession
      for (let i = 0; i < numRequests; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'Test@123'
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // Verify rate limiting is working
      expect(responses.some(response => response.status === 429)).toBe(true);
    });
  });

  describe('Security Headers', () => {
    it('should set security headers correctly', async () => {
      const response = await request(app)
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
    });
  });

  describe('Input Validation', () => {
    it('should prevent SQL injection attempts', async () => {
      const response = await request(app)
        .get('/api/campaigns?query=1\'%20OR%20\'1\'=\'1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should sanitize user input', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '<script>alert("xss")</script>Test Campaign',
          description: 'Test Description'
        });

      expect(response.status).toBe(400);
    });
  });
});
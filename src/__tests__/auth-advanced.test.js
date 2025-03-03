const request = require('supertest');
const app = require('../index');
const User = require('../models/user');
const authService = require('../services/auth');
const redis = require('../utils/redis');
const { generateToken } = require('../services/auth');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const speakeasy = require('speakeasy');

jest.mock('../utils/redis');
jest.mock('../utils/email');

let mongoServer;
let testUser;
let adminUser;
let merchantUser;
let affiliateUser;

describe('Advanced Authentication Tests', () => {
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
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    
    // Create test users with different roles
    testUser = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'Test@123',
      role: 'user',
      isEmailVerified: true
    });
    
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
      isEmailVerified: true
    });
    
    merchantUser = await User.create({
      name: 'Merchant User',
      email: 'merchant@example.com',
      password: 'Merchant@123',
      role: 'merchant',
      isEmailVerified: true
    });
    
    affiliateUser = await User.create({
      name: 'Affiliate User',
      email: 'affiliate@example.com',
      password: 'Affiliate@123',
      role: 'affiliate',
      isEmailVerified: true
    });
  });

  describe('Two-Factor Authentication (2FA)', () => {
    it('should enable 2FA for a user', async () => {
      // Login to get auth token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Test@123'
        });
      
      const authToken = loginRes.body.token;
      
      // Enable 2FA
      const enableRes = await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(enableRes.status).toBe(200);
      expect(enableRes.body).toHaveProperty('secret');
      expect(enableRes.body).toHaveProperty('qrCode');
      
      // Verify user has 2FA secret stored
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.twoFactorSecret).toBeDefined();
      expect(updatedUser.twoFactorEnabled).toBe(false); // Not verified yet
    });
    
    it('should verify and activate 2FA with valid token', async () => {
      // Setup 2FA secret
      const secret = speakeasy.generateSecret({ length: 20 });
      await User.findByIdAndUpdate(testUser._id, {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: false
      });
      
      // Login to get auth token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Test@123'
        });
      
      const authToken = loginRes.body.token;
      
      // Generate valid token
      const token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32'
      });
      
      // Verify 2FA
      const verifyRes = await request(app)
        .post('/api/auth/2fa/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token });
      
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      
      // Check that 2FA is now enabled
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.twoFactorEnabled).toBe(true);
    });
    
    it('should reject login without 2FA token when 2FA is enabled', async () => {
      // Setup enabled 2FA
      const secret = speakeasy.generateSecret({ length: 20 });
      await User.findByIdAndUpdate(testUser._id, {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: true
      });
      
      // Attempt login without 2FA token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Test@123'
        });
      
      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty('requireTwoFactor', true);
      expect(loginRes.body).not.toHaveProperty('token'); // No token provided yet
    });
    
    it('should complete login with valid 2FA token', async () => {
      // Setup enabled 2FA
      const secret = speakeasy.generateSecret({ length: 20 });
      await User.findByIdAndUpdate(testUser._id, {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: true
      });
      
      // First step login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Test@123'
        });
      
      expect(loginRes.body).toHaveProperty('requireTwoFactor', true);
      expect(loginRes.body).toHaveProperty('twoFactorToken');
      
      // Generate valid 2FA token
      const token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32'
      });
      
      // Complete login with 2FA
      const twoFactorRes = await request(app)
        .post('/api/auth/2fa/login')
        .send({
          twoFactorToken: loginRes.body.twoFactorToken,
          token
        });
      
      expect(twoFactorRes.status).toBe(200);
      expect(twoFactorRes.body).toHaveProperty('token');
      expect(twoFactorRes.body).toHaveProperty('user');
    });
    
    it('should disable 2FA when requested', async () => {
      // Setup enabled 2FA
      const secret = speakeasy.generateSecret({ length: 20 });
      await User.findByIdAndUpdate(testUser._id, {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: true
      });
      
      // Login with 2FA
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Test@123'
        });
      
      // Generate valid 2FA token
      const token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32'
      });
      
      // Complete login
      const twoFactorRes = await request(app)
        .post('/api/auth/2fa/login')
        .send({
          twoFactorToken: loginRes.body.twoFactorToken,
          token
        });
      
      const authToken = twoFactorRes.body.token;
      
      // Disable 2FA
      const disableRes = await request(app)
        .post('/api/auth/2fa/disable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token }); // Require current token for security
      
      expect(disableRes.status).toBe(200);
      expect(disableRes.body.success).toBe(true);
      
      // Verify 2FA is disabled
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.twoFactorEnabled).toBe(false);
      expect(updatedUser.twoFactorSecret).toBeUndefined();
    });
  });
  
  describe('Role-Based Access Control', () => {
    it('should allow admin access to admin-only routes', async () => {
      const adminToken = generateToken({ userId: adminUser._id, role: 'admin' });
      
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
    });
    
    it('should deny non-admin access to admin-only routes', async () => {
      const userToken = generateToken({ userId: testUser._id, role: 'user' });
      
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
    });
    
    it('should allow merchant access to merchant-only routes', async () => {
      const merchantToken = generateToken({ userId: merchantUser._id, role: 'merchant' });
      
      const response = await request(app)
        .get('/api/merchant/dashboard')
        .set('Authorization', `Bearer ${merchantToken}`);
      
      expect(response.status).toBe(200);
    });
    
    it('should allow affiliate access to affiliate-only routes', async () => {
      const affiliateToken = generateToken({ userId: affiliateUser._id, role: 'affiliate' });
      
      const response = await request(app)
        .get('/api/affiliate/dashboard')
        .set('Authorization', `Bearer ${affiliateToken}`);
      
      expect(response.status).toBe(200);
    });
    
    it('should update user roles correctly', async () => {
      const adminToken = generateToken({ userId: adminUser._id, role: 'admin' });
      
      const response = await request(app)
        .put(`/api/admin/users/${testUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'merchant' });
      
      expect(response.status).toBe(200);
      
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.role).toBe('merchant');
    });
    
    it('should deny role update from non-admin users', async () => {
      const userToken = generateToken({ userId: testUser._id, role: 'user' });
      
      const response = await request(app)
        .put(`/api/admin/users/${affiliateUser._id}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' });
      
      expect(response.status).toBe(403);
      
      const unchangedUser = await User.findById(affiliateUser._id);
      expect(unchangedUser.role).toBe('affiliate'); // Role unchanged
    });
  });
});
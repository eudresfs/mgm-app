const request = require('supertest');
const app = require('../index');
const User = require('../models/user');
const authService = require('../services/auth');
const redis = require('../utils/redis');
const { generateToken } = require('../services/auth');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../utils/redis');
jest.mock('../utils/email');
jest.mock('kafka-node');

let mongoServer;

describe('Authentication Module Tests', () => {
  beforeAll(async () => {
    // Criar instância do MongoDB em memória
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();

    // Disconnect any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }, 60000); // Aumentado para 60 segundos devido à inicialização do servidor em memória

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  }, 60000); // Aumentado para 60 segundos

  beforeEach(async () => {
    await User.deleteMany({});
  }, 10000);

  describe('User Registration', () => {
    it('should register a new user with email successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@123',
          name: 'Test User',
          role: 'merchant'
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Registration successful. Please verify your email.');
      expect(res.body.success).toBe(true);
    }, 10000);

    it('should not allow registration with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test@123',
          name: 'Test User',
          role: 'merchant'
        });
      expect(res.status).toBe(400);
    }, 10000);

    it('should not allow registration with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
          role: 'merchant'
        });
      expect(res.status).toBe(400);
    }, 10000);

    it('should not allow duplicate email registration', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Test@123',
          name: 'Test User',
          role: 'merchant'
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Test@123',
          name: 'Test User',
          role: 'merchant'
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email already registered');
    }, 10000);

    /* it('should handle social login registration', async () => {
      const res = await request(app)
        .post('/api/auth/social-login/google')
        .send({
          id: 'google123',
          email: 'google@example.com',
          name: 'Google User'
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    }, 10000); */
  });

  describe('Email Verification', () => {
    it('should verify email with valid token', async () => {
      const user = await User.create({
        email: 'verify@example.com',
        password: 'Test@123',
        name: 'Verify User',
        verificationToken: 'valid_token',
        isEmailVerified: false
      });

      const res = await request(app)
        .get('/api/auth/verify-email/valid_token');
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Email verified successfully');
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isEmailVerified).toBe(true);
      expect(updatedUser.verificationToken).toBeUndefined();
    }, 10000);

    it('should handle invalid verification token', async () => {
      const res = await request(app)
        .get('/api/auth/verify-email/invalid_token');
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid verification token');
    }, 10000);
  });

  describe('Password Recovery', () => {
    it('should initiate password reset', async () => {
      await User.create({
        email: 'reset@example.com',
        password: 'Test@123',
        name: 'Reset User',
        isEmailVerified: true
      });

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Password reset email sent');
      expect(res.body.success).toBe(true);
    }, 10000);

    it('should handle password reset for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User not found');
    }, 10000);

    it('should reset password with valid token', async () => {
      const user = await User.create({
        email: 'reset@example.com',
        password: 'Test@123',
        name: 'Reset User',
        resetPasswordToken: 'valid_reset_token',
        resetPasswordExpires: Date.now() + 3600000
      });

      const res = await request(app)
        .post('/api/auth/reset-password/valid_reset_token')
        .send({ newPassword: 'NewTest@123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Password reset successful');
      expect(res.body.success).toBe(true);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();
    }, 10000);

    it('should handle expired reset token', async () => {
      await User.create({
        email: 'reset@example.com',
        password: 'Test@123',
        name: 'Reset User',
        resetPasswordToken: 'expired_token',
        resetPasswordExpires: Date.now() - 3600000
      });

      const res = await request(app)
        .post('/api/auth/reset-password/expired_token')
        .send({ newPassword: 'NewTest@123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid or expired reset token');
    }, 10000);
  });

  describe('Two-Factor Authentication', () => {
    it('should enable 2FA for user', async () => {
      const user = await User.create({
        email: '2fa@example.com',
        password: 'Test@123',
        name: '2FA User',
        role: 'merchant'
      });
      const token = generateToken(user);

      const res = await request(app)
        .post('/api/auth/2fa/enable')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('secret');
      expect(res.body).toHaveProperty('qrCode');
    }, 10000);
  });

  describe('Profile Management', () => {
    it('should update user profile', async () => {
      const user = await User.create({
        email: 'profile@example.com',
        password: 'Test@123',
        name: 'Profile User',
        role: 'merchant'
      });
      const token = generateToken(user);

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test User',
          company: 'Test Corp'
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test User');
    }, 10000);
  });

  describe('Access Control', () => {
    it('should enforce role-based access control', async () => {
      const user = await User.create({
        email: 'admin@example.com',
        password: 'Test@123',
        name: 'Admin User',
        role: 'admin'
      });
      const token = generateToken(user);

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    }, 10000);

    it('should deny access to unauthorized roles', async () => {
      const user = await User.create({
        email: 'user@example.com',
        password: 'Test@123',
        name: 'Regular User',
        role: 'merchant'
      });
      const token = generateToken(user);

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    }, 10000);
  });
});
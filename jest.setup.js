const dotenv = require('dotenv');

dotenv.config({
  path: '.env.test'
});

// Mock passport strategies to avoid actual OAuth calls during tests
jest.mock('passport-google-oauth20', () => ({
  Strategy: jest.fn((config, callback) => ({
    name: 'google',
    authenticate: jest.fn()
  }))
}));

jest.mock('passport-facebook', () => ({
  Strategy: jest.fn((config, callback) => ({
    name: 'facebook',
    authenticate: jest.fn()
  }))
}));
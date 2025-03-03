/**
 * Affiliate Model
 * Defines the schema for affiliates in the marketing platform
 */

const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'inactive'],
    default: 'pending'
  },
  website: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'pix', 'crypto'],
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  taxInfo: {
    documentType: {
      type: String,
      enum: ['cpf', 'cnpj', 'ssn', 'vat'],
      required: true
    },
    documentNumber: {
      type: String,
      required: true
    }
  },
  commissionTier: {
    type: String,
    enum: ['standard', 'silver', 'gold', 'platinum'],
    default: 'standard'
  },
  referralCode: {
    type: String,
    unique: true
  },
  campaigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }],
  metrics: {
    totalClicks: {
      type: Number,
      default: 0
    },
    totalConversions: {
      type: Number,
      default: 0
    },
    totalCommission: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
affiliateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate a unique referral code before saving a new affiliate
affiliateSchema.pre('save', function(next) {
  if (!this.referralCode) {
    // Generate a unique referral code based on name and random string
    const namePart = this.name.substring(0, 3).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.referralCode = `${namePart}${randomPart}`;
  }
  next();
});

// Create indexes for frequently queried fields
affiliateSchema.index({ email: 1 });
affiliateSchema.index({ referralCode: 1 });
affiliateSchema.index({ status: 1 });

module.exports = mongoose.model('Affiliate', affiliateSchema);
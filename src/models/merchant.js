/**
 * Merchant Model
 * Defines the schema for merchants who create affiliate marketing campaigns
 */

const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
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
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'inactive'],
    default: 'pending'
  },
  contactInfo: {
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  paymentSettings: {
    currency: {
      type: String,
      default: 'USD'
    },
    paymentThreshold: {
      type: Number,
      default: 50
    },
    paymentSchedule: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'monthly'
    }
  },
  taxInfo: {
    documentType: {
      type: String,
      enum: ['cnpj', 'ein', 'vat'],
      required: true
    },
    documentNumber: {
      type: String,
      required: true
    }
  },
  brandAssets: {
    logo: String,
    colors: {
      primary: String,
      secondary: String
    },
    guidelines: String
  },
  settings: {
    autoApproveAffiliates: {
      type: Boolean,
      default: false
    },
    autoApproveCommissions: {
      type: Boolean,
      default: false
    },
    defaultAttributionWindow: {
      type: Number,
      default: 30
    },
    defaultCookieLifetime: {
      type: Number,
      default: 30
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
merchantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for frequently queried fields
merchantSchema.index({ email: 1 });
merchantSchema.index({ status: 1 });

module.exports = mongoose.model('Merchant', merchantSchema);
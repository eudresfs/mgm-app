/**
 * Campaign Model
 * Defines the schema for affiliate marketing campaigns
 */

const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'ended'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['cpa', 'cps', 'cpl', 'recurring', 'multi_level'],
    required: true
  },
  commission: {
    type: {
      type: String,
      enum: ['fixed', 'percentage', 'tiered', 'hybrid'],
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    tiers: [{
      threshold: Number,
      value: Number
    }],
    recurringRules: {
      duration: Number,
      frequency: String
    }
  },
  budget: {
    total: {
      type: Number,
      min: 0
    },
    daily: {
      type: Number,
      min: 0
    },
    remaining: {
      type: Number,
      min: 0
    }
  },
  promotionalMaterials: [{
    type: {
      type: String,
      enum: ['banner', 'text', 'video', 'link'],
      required: true
    },
    url: String,
    content: String,
    dimensions: String,
    previewImage: String
  }],
  qualificationRules: [{
    type: String,
    condition: String,
    value: mongoose.Schema.Types.Mixed
  }],
  affiliateSegments: [{
    name: String,
    criteria: mongoose.Schema.Types.Mixed,
    commission: {
      type: String,
      value: Number
    }
  }],
  approvalProcess: {
    type: {
      type: String,
      enum: ['automatic', 'manual'],
      default: 'manual'
    },
    rules: [{
      criteria: String,
      value: mongoose.Schema.Types.Mixed
    }]
  },
  tracking: {
    attributionWindow: {
      type: Number,
      default: 30,
      min: 1,
      max: 90
    },
    cookieLifetime: {
      type: Number,
      default: 30,
      min: 1,
      max: 365
    },
    allowedDomains: [{
      type: String,
      trim: true
    }]
  },
  targeting: {
    countries: [{
      type: String,
      trim: true,
      uppercase: true
    }],
    devices: [{
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    }]
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  template: {
    type: String,
    enum: ['ecommerce', 'saas', 'digital_products', 'services', 'custom'],
    default: 'custom'
  },
  scheduleSettings: {
    autoStart: {
      type: Boolean,
      default: true
    },
    autoEnd: {
      type: Boolean,
      default: true
    },
    statusTransitions: [{
      fromStatus: {
        type: String,
        enum: ['draft', 'active', 'paused', 'ended']
      },
      toStatus: {
        type: String,
        enum: ['draft', 'active', 'paused', 'ended']
      },
      scheduledDate: Date,
      executed: {
        type: Boolean,
        default: false
      }
    }]
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
campaignSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for frequently queried fields
campaignSchema.index({ merchant: 1, status: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
/**
 * Conversion Model
 * Defines the schema for tracking and managing conversions
 */

const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    index: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true,
    index: true
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending',
    index: true
  },
  type: {
    type: String,
    enum: ['sale', 'lead', 'click', 'subscription'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'BRL'
  },
  commission: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending'
    },
    paidAt: Date
  },
  customer: {
    id: String,
    email: String,
    isNew: {
      type: Boolean,
      default: true
    },
    metadata: mongoose.Schema.Types.Mixed
  },
  orderData: {
    orderId: String,
    products: [{
      id: String,
      name: String,
      quantity: Number,
      price: Number
    }],
    total: Number,
    metadata: mongoose.Schema.Types.Mixed
  },
  eventData: {
    ip: String,
    userAgent: String,
    referrer: String,
    device: String,
    browser: String,
    os: String,
    timestamp: Date
  },
  flags: [{
    type: {
      type: String,
      enum: ['duplicate', 'fraud', 'invalid_value', 'other']
    },
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date,
    resolution: String
  }],
  notes: [{
    text: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  approvalData: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    rejectionReason: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for common queries
conversionSchema.index({ campaignId: 1, createdAt: -1 });
conversionSchema.index({ affiliateId: 1, createdAt: -1 });
conversionSchema.index({ status: 1, createdAt: -1 });

// Pre-save hook to update timestamps
conversionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to calculate commission based on campaign rules
conversionSchema.methods.calculateCommission = async function() {
  try {
    const Campaign = mongoose.model('Campaign');
    const campaign = await Campaign.findById(this.campaignId);
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    
    let commissionValue = 0;
    
    switch (campaign.commission.type) {
      case 'fixed':
        commissionValue = campaign.commission.value;
        break;
        
      case 'percentage':
        commissionValue = (this.value * campaign.commission.value) / 100;
        break;
        
      case 'tiered':
        // Find the appropriate tier based on conversion value
        const tier = campaign.commission.tiers
          .sort((a, b) => b.threshold - a.threshold)
          .find(tier => this.value >= tier.threshold);
          
        if (tier) {
          commissionValue = tier.type === 'fixed' 
            ? tier.value 
            : (this.value * tier.value) / 100;
        }
        break;
        
      case 'hybrid':
        // Implement hybrid commission calculation logic
        // This could combine fixed and percentage models
        const baseCommission = campaign.commission.value;
        const percentageBonus = campaign.commission.percentageBonus || 0;
        commissionValue = baseCommission + ((this.value * percentageBonus) / 100);
        break;
    }
    
    // Apply any campaign-specific rules or modifiers
    if (campaign.type === 'recurring' && this.type === 'subscription') {
      // Apply first-month bonus if applicable
      if (campaign.commission.recurringRules?.firstMonthBonus) {
        commissionValue += campaign.commission.recurringRules.firstMonthBonus;
      }
    }
    
    // Update the commission value
    this.commission.value = commissionValue;
    return commissionValue;
  } catch (error) {
    console.error('Error calculating commission:', error);
    throw error;
  }
};

const Conversion = mongoose.model('Conversion', conversionSchema);

module.exports = Conversion;
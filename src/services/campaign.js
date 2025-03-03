/**
 * Campaign Service
 * Handles business logic for campaign management
 */

const Campaign = require('../models/campaign');

class CampaignService {
  /**
   * Create a new campaign
   */
  async createCampaign(campaignData) {
    try {
      // Validate commission structure
      await this.validateCommissionStructure(campaignData);

      // Apply template if specified
      if (campaignData.template && campaignData.template !== 'custom') {
        campaignData = await this.applyTemplate(campaignData);
      }

      // Validate and normalize dates for timezone handling
      campaignData.startDate = this.normalizeDate(campaignData.startDate);
      if (campaignData.endDate) {
        campaignData.endDate = this.normalizeDate(campaignData.endDate);
      }

      const campaign = new Campaign(campaignData);

      // Set up automatic scheduling if enabled
      if (campaign.scheduleSettings?.autoStart && campaign.startDate) {
        const now = new Date();
        if (campaign.startDate <= now) {
          campaign.status = 'active';
        } else {
          campaign.scheduleSettings.statusTransitions.push({
            fromStatus: 'draft',
            toStatus: 'active',
            scheduledDate: campaign.startDate,
            executed: false
          });
        }
      }

      if (campaign.scheduleSettings?.autoEnd && campaign.endDate) {
        campaign.scheduleSettings.statusTransitions.push({
          fromStatus: 'active',
          toStatus: 'ended',
          scheduledDate: campaign.endDate,
          executed: false
        });
      }

      await campaign.validate();
      return await campaign.save();
    } catch (error) {
      throw new Error(`Failed to create campaign: ${error.message}`);
    }
  }

  /**
   * Update an existing campaign
   */
  async updateCampaign(id, updateData) {
    try {
      const campaign = await Campaign.findById(id);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Prevent modification of critical fields in active campaigns
      if (campaign.status === 'active') {
        const restrictedFields = ['type', 'startDate', 'template'];
        const hasRestrictedChanges = restrictedFields.some(field => updateData.hasOwnProperty(field));
        if (hasRestrictedChanges) {
          throw new Error('Cannot modify critical fields of an active campaign');
        }
      }

      // Validate commission updates
      if (updateData.commission) {
        await this.validateCommissionStructure(updateData);
      }

      // Handle date updates with timezone normalization
      if (updateData.startDate) {
        updateData.startDate = this.normalizeDate(updateData.startDate);
      }
      if (updateData.endDate) {
        updateData.endDate = this.normalizeDate(updateData.endDate);
      }

      Object.assign(campaign, updateData);
      await campaign.validate();
      return await campaign.save();
    } catch (error) {
      throw new Error(`Failed to update campaign: ${error.message}`);
    }
  }

  /**
   * Update campaign status with validation
   */
  async updateCampaignStatus(id, newStatus, isScheduled = false) {
    try {
      const campaign = await Campaign.findById(id);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Validate status transition
      const validTransitions = {
        draft: ['active', 'ended'],
        active: ['paused', 'ended'],
        paused: ['active', 'ended'],
        ended: []
      };

      if (!validTransitions[campaign.status].includes(newStatus)) {
        throw new Error(`Invalid status transition from ${campaign.status} to ${newStatus}`);
      }

      campaign.status = newStatus;
      
      // If this is a scheduled transition, record it
      if (isScheduled) {
        campaign.scheduleSettings.statusTransitions.push({
          fromStatus: campaign.status,
          toStatus: newStatus,
          scheduledDate: new Date(),
          executed: true
        });
      }
      
      await campaign.validate();
      return await campaign.save();
    } catch (error) {
      throw new Error(`Failed to update campaign status: ${error.message}`);
    }
  }

  /**
   * Check automatic approval rules
   */
  async automaticApprovalCheck(campaign, affiliateId) {
    try {
      const rules = campaign.approvalProcess.rules || [];
      let approved = true;
      const reasons = [];

      for (const rule of rules) {
        switch (rule.type) {
          case 'performance':
            const meetsPerformance = await this.checkAffiliatePerformance(affiliateId, rule.criteria);
            if (!meetsPerformance) {
              approved = false;
              reasons.push('Does not meet performance criteria');
            }
            break;
          case 'location':
            const meetsLocation = await this.checkAffiliateLocation(affiliateId, rule.criteria);
            if (!meetsLocation) {
              approved = false;
              reasons.push('Location not allowed');
            }
            break;
          case 'category':
            const meetsCategory = await this.checkAffiliateCategory(affiliateId, rule.criteria);
            if (!meetsCategory) {
              approved = false;
              reasons.push('Category not allowed');
            }
            break;
        }
      }

      return {
        status: approved ? 'approved' : 'rejected',
        campaignId: campaign._id,
        affiliateId,
        reasons: approved ? [] : reasons
      };
    } catch (error) {
      throw new Error(`Failed to check automatic approval: ${error.message}`);
    }
  }

  /**
   * Handle campaign approval process
   */
  async processAffiliateApproval(campaignId, affiliateId) {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.approvalProcess.type === 'automatic') {
        return await this.automaticApprovalCheck(campaign, affiliateId);
      }
      
      // For manual approval, just return the request status
      return { status: 'pending_approval', campaignId, affiliateId };
    } catch (error) {
      throw new Error(`Failed to process affiliate approval: ${error.message}`);
    }
  }

  /**
   * Duplicate an existing campaign
   */
  async duplicateCampaign(id) {
    try {
      const sourceCampaign = await Campaign.findById(id);
      if (!sourceCampaign) {
        throw new Error('Source campaign not found');
      }

      // Create a new campaign object with the source campaign's data
      const campaignData = sourceCampaign.toObject();
      
      // Remove unique identifiers and reset status
      delete campaignData._id;
      delete campaignData.createdAt;
      delete campaignData.updatedAt;
      campaignData.status = 'draft';
      campaignData.name = `${campaignData.name} (Copy)`;
      
      // Reset schedule settings
      if (campaignData.scheduleSettings) {
        campaignData.scheduleSettings.statusTransitions = [];
        if (campaignData.scheduleSettings.autoStart) {
          campaignData.startDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Start tomorrow by default
        }
      }

      // Create the new campaign
      return await this.createCampaign(campaignData);
    } catch (error) {
      throw new Error(`Failed to duplicate campaign: ${error.message}`);
    }
  }

  /**
   * Get campaigns by merchant with filters
   */
  /**
   * Apply campaign template
   */
  async applyTemplate(campaignData) {
    const templates = {
      ecommerce: {
        type: 'cps',
        commission: { 
          type: 'hybrid', 
          value: 10,
          tiers: [{
            threshold: 1000,
            value: 12
          }, {
            threshold: 5000,
            value: 15
          }],
          bonusRules: {
            firstSale: {
              value: 5,
              description: 'Bonus for first sale'
            },
            monthlyTarget: {
              threshold: 10000,
              value: 20,
              description: 'Monthly sales target bonus'
            }
          }
        },
        tracking: { 
          attributionWindow: 30, 
          cookieLifetime: 30,
          conversionRules: {
            validationPeriod: 14,
            refundProtection: true,
            crossDeviceTracking: true,
            fraudPrevention: {
              enabled: true,
              rules: ['duplicate_orders', 'suspicious_patterns', 'ip_verification']
            }
          }
        },
        qualificationRules: [{
          type: 'performance',
          condition: 'minimum_sales',
          value: 5
        }, {
          type: 'category',
          condition: 'niche_relevance',
          value: ['retail', 'fashion', 'electronics']
        }, {
          type: 'reputation',
          condition: 'minimum_rating',
          value: 4.5
        }],
        promotionalMaterials: [{
          type: 'banner',
          dimensions: ['728x90', '300x250', '160x600'],
          content: 'Standard ecommerce banner template',
          formats: ['jpg', 'png', 'gif']
        }, {
          type: 'product_feed',
          format: 'json',
          updateFrequency: 'daily',
          fields: ['name', 'price', 'description', 'image_url', 'category']
        }, {
          type: 'email_template',
          format: 'html',
          variations: ['welcome', 'promotion', 'seasonal']
        }]
      },
      saas: {
        type: 'recurring',
        commission: { 
          type: 'fixed', 
          value: 50, 
          recurringRules: { 
            duration: 12, 
            frequency: 'monthly',
            firstMonthBonus: 25
          },
          tiers: [{
            threshold: 10,
            value: 60
          }, {
            threshold: 25,
            value: 75
          }]
        },
        tracking: { 
          attributionWindow: 60, 
          cookieLifetime: 60,
          conversionRules: {
            trialPeriod: 14,
            activationCriteria: 'payment'
          }
        },
        qualificationRules: [{
          type: 'category',
          condition: 'tech_expertise',
          value: true
        }, {
          type: 'performance',
          condition: 'minimum_conversions',
          value: 3
        }],
        promotionalMaterials: [{
          type: 'demo_video',
          duration: '2-5min',
          format: 'mp4'
        }, {
          type: 'case_study',
          format: 'pdf'
        }]
      },
      digital_products: {
        type: 'cpa',
        commission: { 
          type: 'fixed', 
          value: 25,
          bonusRules: {
            bulkPurchase: {
              threshold: 3,
              bonus: 10
            }
          }
        },
        tracking: { 
          attributionWindow: 15, 
          cookieLifetime: 15,
          conversionRules: {
            instantDelivery: true,
            satisfactionPeriod: 30
          }
        },
        qualificationRules: [{
          type: 'content',
          condition: 'quality_score',
          value: 7
        }],
        promotionalMaterials: [{
          type: 'text',
          content: 'Digital product promotion template'
        }, {
          type: 'link',
          content: 'Download now template'
        }, {
          type: 'preview',
          format: 'web',
          demoAvailable: true
        }]
      },
      services: {
        type: 'cpl',
        commission: { 
          type: 'hybrid', 
          value: 20,
          tiers: [{
            threshold: 50,
            value: 30
          }],
          bonusRules: {
            qualifiedLead: {
              criteria: ['consultation_scheduled', 'budget_qualified'],
              bonus: 15
            }
          }
        },
        tracking: { 
          attributionWindow: 45, 
          cookieLifetime: 45,
          conversionRules: {
            leadQualification: ['form_completion', 'phone_verification'],
            followupPeriod: 7
          }
        },
        qualificationRules: [{
          type: 'location',
          condition: 'service_area',
          value: ['US', 'EU']
        }, {
          type: 'experience',
          condition: 'industry_knowledge',
          value: true
        }],
        promotionalMaterials: [{
          type: 'service_brochure',
          format: 'pdf'
        }, {
          type: 'testimonials',
          count: 3,
          format: 'video'
        }]
      }
    };

    const template = templates[campaignData.template];
    if (!template) return campaignData;

    return { ...campaignData, ...template };
  }

  /**
   * Process scheduled status transitions
   */
  async processScheduledTransitions() {
    try {
      const now = new Date();
      const campaigns = await Campaign.find({
        'scheduleSettings.statusTransitions': {
          $elemMatch: {
            executed: false,
            scheduledDate: { $lte: now }
          }
        }
      });

      for (const campaign of campaigns) {
        const pendingTransitions = campaign.scheduleSettings.statusTransitions
          .filter(t => !t.executed && t.scheduledDate <= now)
          .sort((a, b) => a.scheduledDate - b.scheduledDate);

        for (const transition of pendingTransitions) {
          await this.updateCampaignStatus(campaign._id, transition.toStatus, true);
        }
      }
    } catch (error) {
      throw new Error(`Failed to process scheduled transitions: ${error.message}`);
    }
  }

  async getMerchantCampaigns(merchantId, filters = {}) {
    try {
      const query = { merchant: merchantId, ...filters };
      return await Campaign.find(query);
    } catch (error) {
      throw new Error(`Failed to get merchant campaigns: ${error.message}`);
    }
  }

  /**
   * Get campaigns available for affiliate
   */
  async getAvailableCampaigns(affiliateId, filters = {}) {
    try {
      const query = {
        status: 'active',
        startDate: { $lte: new Date() },
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gt: new Date() } }
        ],
        ...filters
      };
      return await Campaign.find(query);
    } catch (error) {
      throw new Error(`Failed to get available campaigns: ${error.message}`);
    }
  }


  /**
   * Validate commission structure based on campaign type
   */
  async validateCommissionStructure(campaignData) {
    const { type, commission } = campaignData;
    
    if (!commission) {
      throw new Error('Commission structure is required');
    }

    switch (type) {
      case 'recurring':
        if (!commission.recurringRules || !commission.recurringRules.duration) {
          throw new Error('Recurring campaigns require duration settings');
        }
        break;
      case 'tiered':
        if (!commission.tiers || !Array.isArray(commission.tiers) || commission.tiers.length === 0) {
          throw new Error('Tiered commission requires at least one tier');
        }
        break;
      case 'multi_level':
        if (!commission.levels || !Array.isArray(commission.levels) || commission.levels.length === 0) {
          throw new Error('Multi-level campaigns require level definitions');
        }
        break;
    }
  }

  /**
   * Normalize date for consistent timezone handling
   */
  normalizeDate(date) {
    if (!date) return null;
    const normalized = new Date(date);
    if (isNaN(normalized.getTime())) {
      throw new Error('Invalid date format');
    }
    return normalized;
  }
}

module.exports = new CampaignService();
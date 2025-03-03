/**
 * Conversion Service
 * Handles business logic for conversion tracking and management
 */

const Conversion = require('../models/conversion');
const Campaign = require('../models/campaign');
const Affiliate = require('../models/affiliate');
const logger = require('../utils/logger');
const { publishEvent } = require('./eventProcessing');

class ConversionService {
  /**
   * Get conversions with filtering options
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Array>} List of conversions
   */
  async getConversions(filters = {}, options = {}) {
    try {
      const query = Conversion.find(filters);
      
      // Apply pagination
      if (options.page && options.limit) {
        const page = parseInt(options.page, 10) || 1;
        const limit = parseInt(options.limit, 10) || 10;
        const skip = (page - 1) * limit;
        
        query.skip(skip).limit(limit);
      }
      
      // Apply sorting
      const sortField = options.sortBy || 'createdAt';
      const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
      query.sort({ [sortField]: sortOrder });
      
      // Populate related data
      query.populate('campaignId').populate('affiliateId');
      
      return await query.exec();
    } catch (error) {
      logger.error('Error fetching conversions:', error);
      throw new Error(`Failed to fetch conversions: ${error.message}`);
    }
  }
  
  /**
   * Get conversion by ID
   * @param {string} id - Conversion ID
   * @returns {Promise<Object>} Conversion data
   */
  async getConversionById(id) {
    try {
      const conversion = await Conversion.findById(id)
        .populate('campaignId')
        .populate('affiliateId');
      
      if (!conversion) {
        throw new Error('Conversion not found');
      }
      
      return conversion;
    } catch (error) {
      logger.error(`Error fetching conversion ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Approve a conversion and calculate commission
   * @param {string} id - Conversion ID
   * @param {Object} approvalData - Additional approval data
   * @returns {Promise<Object>} Updated conversion
   */
  async approveConversion(id, approvalData = {}) {
    try {
      const conversion = await this.getConversionById(id);
      
      // Get campaign details for commission calculation
      const campaign = await Campaign.findById(conversion.campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      // Calculate commission based on campaign rules
      const commissionValue = this.calculateCommission(conversion, campaign);
      
      // Update conversion status and commission
      conversion.status = 'approved';
      conversion.commission.value = commissionValue;
      conversion.commission.status = 'pending';
      
      if (approvalData.notes) {
        conversion.notes = approvalData.notes;
      }
      
      await conversion.save();
      
      // Publish event for downstream processing
      await publishEvent('conversion.approved', {
        conversionId: conversion._id,
        affiliateId: conversion.affiliateId,
        campaignId: conversion.campaignId,
        commissionValue
      });
      
      return conversion;
    } catch (error) {
      logger.error(`Error approving conversion ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Reject a conversion
   * @param {string} id - Conversion ID
   * @param {Object} rejectionData - Rejection reason and details
   * @returns {Promise<Object>} Updated conversion
   */
  async rejectConversion(id, rejectionData = {}) {
    try {
      const conversion = await this.getConversionById(id);
      
      conversion.status = 'rejected';
      conversion.commission.status = 'cancelled';
      
      if (rejectionData.reason) {
        conversion.flags.push({
          type: 'other',
          description: rejectionData.reason,
          createdAt: new Date()
        });
      }
      
      await conversion.save();
      
      // Publish event for downstream processing
      await publishEvent('conversion.rejected', {
        conversionId: conversion._id,
        affiliateId: conversion.affiliateId,
        campaignId: conversion.campaignId,
        reason: rejectionData.reason || 'No reason provided'
      });
      
      return conversion;
    } catch (error) {
      logger.error(`Error rejecting conversion ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Calculate commission based on campaign rules
   * @param {Object} conversion - Conversion data
   * @param {Object} campaign - Campaign data
   * @returns {number} Calculated commission value
   */
  calculateCommission(conversion, campaign) {
    let commissionValue = 0;
    
    switch (campaign.commission.type) {
      case 'fixed':
        commissionValue = campaign.commission.value;
        break;
        
      case 'percentage':
        commissionValue = (conversion.value * campaign.commission.value) / 100;
        break;
        
      case 'tiered':
        // Find applicable tier based on conversion value
        const tier = campaign.commission.tiers
          .sort((a, b) => b.threshold - a.threshold)
          .find(t => conversion.value >= t.threshold);
        commissionValue = tier ? tier.value : campaign.commission.value;
        break;
        
      case 'hybrid':
        // Hybrid can combine fixed + percentage
        const baseCommission = campaign.commission.value;
        const percentageBonus = campaign.commission.percentageBonus || 0;
        commissionValue = baseCommission + (conversion.value * percentageBonus / 100);
        break;
        
      default:
        commissionValue = campaign.commission.value;
    }
    
    // Apply any affiliate-specific commission adjustments
    if (campaign.affiliateSegments && campaign.affiliateSegments.length > 0) {
      // This would require fetching the affiliate and checking if they belong to a segment
      // with special commission rules - simplified for now
    }
    
    return commissionValue;
  }
  
  /**
   * Flag a conversion as potentially fraudulent
   * @param {string} id - Conversion ID
   * @param {Object} flagData - Flag details
   * @returns {Promise<Object>} Updated conversion
   */
  async flagConversion(id, flagData) {
    try {
      const conversion = await this.getConversionById(id);
      
      conversion.status = 'flagged';
      conversion.flags.push({
        type: flagData.type || 'other',
        description: flagData.description,
        createdAt: new Date()
      });
      
      await conversion.save();
      
      return conversion;
    } catch (error) {
      logger.error(`Error flagging conversion ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new ConversionService();
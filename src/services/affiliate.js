/**
 * Affiliate Service
 * Handles business logic for affiliate management and features
 */

const Affiliate = require('../models/affiliate');
const Campaign = require('../models/campaign');
const redis = require('../utils/redis');
const logger = require('../utils/logger');
const { publishEvent } = require('./eventProcessing');

class AffiliateService {
  /**
   * Discover relevant campaigns for an affiliate
   * @param {string} affiliateId - The affiliate's ID
   * @param {Object} filters - Optional filters for campaign discovery
   * @returns {Promise<Array>} List of recommended campaigns
   */
  async discoverCampaigns(affiliateId, filters = {}) {
    try {
      const affiliate = await Affiliate.findById(affiliateId);
      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      // Build query based on affiliate profile and filters
      const query = {
        status: 'active',
        'qualificationRules.type': { $in: ['open', affiliate.commissionTier] }
      };

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.commission) {
        query['commission.value'] = { $gte: filters.commission };
      }

      // Get campaigns and sort by relevance
      const campaigns = await Campaign.find(query)
        .sort({ 'metrics.conversionRate': -1 })
        .limit(20);

      return campaigns;
    } catch (error) {
      logger.error('Error discovering campaigns:', error);
      throw error;
    }
  }

  /**
   * Get real-time metrics for an affiliate
   * @param {string} affiliateId - The affiliate's ID
   * @returns {Promise<Object>} Real-time metrics data
   */
  async getRealTimeMetrics(affiliateId) {
    try {
      // Get cached metrics from Redis
      const cachedMetrics = await redis.get(`metrics:affiliate:${affiliateId}`);
      if (cachedMetrics) {
        return JSON.parse(cachedMetrics);
      }

      // Calculate metrics from database
      const affiliate = await Affiliate.findById(affiliateId);
      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      const metrics = {
        clicks: affiliate.metrics.totalClicks,
        conversions: affiliate.metrics.totalConversions,
        revenue: affiliate.metrics.totalCommission,
        conversionRate: affiliate.metrics.conversionRate,
        recentActivity: await this.getRecentActivity(affiliateId)
      };

      // Cache metrics for 5 minutes
      await redis.set(
        `metrics:affiliate:${affiliateId}`,
        JSON.stringify(metrics),
        'EX',
        300
      );

      return metrics;
    } catch (error) {
      logger.error('Error getting real-time metrics:', error);
      throw error;
    }
  }

  /**
   * Get recent activity for an affiliate
   * @param {string} affiliateId - The affiliate's ID
   * @returns {Promise<Array>} Recent activity data
   */
  async getRecentActivity(affiliateId) {
    try {
      const events = await redis.lrange(
        `activity:affiliate:${affiliateId}`,
        0,
        19
      );
      return events.map(event => JSON.parse(event));
    } catch (error) {
      logger.error('Error getting recent activity:', error);
      return [];
    }
  }

  /**
   * Generate promotional materials for a campaign
   * @param {string} affiliateId - The affiliate's ID
   * @param {string} campaignId - The campaign's ID
   * @param {Object} options - Customization options
   * @returns {Promise<Object>} Generated promotional materials
   */
  async generatePromotionalMaterials(affiliateId, campaignId, options = {}) {
    try {
      const [affiliate, campaign] = await Promise.all([
        Affiliate.findById(affiliateId),
        Campaign.findById(campaignId)
      ]);

      if (!affiliate || !campaign) {
        throw new Error('Affiliate or campaign not found');
      }

      // Get base materials from campaign
      const materials = campaign.promotionalMaterials.map(material => ({
        ...material.toObject(),
        customized: false
      }));

      // Apply affiliate customizations if allowed
      if (options.customize && campaign.allowCustomization) {
        materials.forEach(material => {
          if (options.text && material.type === 'text') {
            material.content = options.text;
            material.customized = true;
          }
          // Add affiliate tracking parameters
          if (material.url) {
            material.url = `${material.url}?ref=${affiliate.referralCode}`;
          }
        });
      }

      return materials;
    } catch (error) {
      logger.error('Error generating promotional materials:', error);
      throw error;
    }
  }

  /**
   * Get affiliate performance reports
   * @param {string} affiliateId - The affiliate's ID
   * @param {Object} filters - Report filters (date range, channels, etc.)
   * @returns {Promise<Object>} Performance report data
   */
  async getPerformanceReport(affiliateId, filters = {}) {
    try {
      const affiliate = await Affiliate.findById(affiliateId);
      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      // Build aggregation pipeline based on filters
      const pipeline = [
        { $match: { affiliateId } },
        { $sort: { timestamp: -1 } }
      ];

      if (filters.dateRange) {
        pipeline[0].$match.timestamp = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end)
        };
      }

      if (filters.channel) {
        pipeline[0].$match.channel = filters.channel;
      }

      // Group by relevant dimensions
      pipeline.push({
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            channel: '$channel'
          },
          clicks: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ['$type', 'conversion'] }, 1, 0] }
          },
          revenue: { $sum: '$amount' }
        }
      });

      // Execute aggregation
      const reportData = await mongoose.model('Event').aggregate(pipeline);

      return {
        summary: this.calculateReportSummary(reportData),
        details: reportData
      };
    } catch (error) {
      logger.error('Error generating performance report:', error);
      throw error;
    }
  }

  /**
   * Calculate summary metrics for a report
   * @param {Array} reportData - Raw report data
   * @returns {Object} Calculated summary metrics
   */
  calculateReportSummary(reportData) {
    return reportData.reduce((summary, day) => {
      summary.totalClicks += day.clicks;
      summary.totalConversions += day.conversions;
      summary.totalRevenue += day.revenue;
      return summary;
    }, {
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0
    });
  }
}

module.exports = new AffiliateService();
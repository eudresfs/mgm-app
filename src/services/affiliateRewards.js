/**
 * Affiliate Rewards Service
 * Handles gamification, goals, and reward systems for affiliates
 */

const Affiliate = require('../models/affiliate');
const redis = require('../utils/redis');
const logger = require('../utils/logger');
const { publishEvent } = require('./eventProcessing');

class AffiliateRewardsService {
  /**
   * Get affiliate's current goals and progress
   * @param {string} affiliateId - The affiliate's ID
   * @returns {Promise<Object>} Goals and progress data
   */
  async getGoalsProgress(affiliateId) {
    try {
      const affiliate = await Affiliate.findById(affiliateId);
      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      // Get current period metrics
      const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
      const periodMetrics = await this.getCurrentPeriodMetrics(affiliateId, currentPeriod);

      // Define goals based on commission tier
      const goals = this.calculateTierGoals(affiliate.commissionTier, periodMetrics);

      return {
        currentTier: affiliate.commissionTier,
        nextTier: this.getNextTier(affiliate.commissionTier),
        periodMetrics,
        goals,
        rewards: await this.getAvailableRewards(affiliateId)
      };
    } catch (error) {
      logger.error('Error getting goals progress:', error);
      throw error;
    }
  }

  /**
   * Get current period metrics for an affiliate
   * @param {string} affiliateId - The affiliate's ID
   * @param {string} period - Period in YYYY-MM format
   * @returns {Promise<Object>} Period metrics
   */
  async getCurrentPeriodMetrics(affiliateId, period) {
    try {
      const cacheKey = `metrics:${affiliateId}:${period}`;
      const cachedMetrics = await redis.get(cacheKey);

      if (cachedMetrics) {
        return JSON.parse(cachedMetrics);
      }

      // Calculate metrics from database
      const startDate = new Date(period);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      const metrics = await mongoose.model('Event').aggregate([
        {
          $match: {
            affiliateId: mongoose.Types.ObjectId(affiliateId),
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            clicks: { $sum: 1 },
            conversions: {
              $sum: { $cond: [{ $eq: ['$type', 'conversion'] }, 1, 0] }
            },
            revenue: { $sum: '$amount' }
          }
        }
      ]);

      const periodMetrics = metrics[0] || { clicks: 0, conversions: 0, revenue: 0 };

      // Cache metrics for 1 hour
      await redis.set(cacheKey, JSON.stringify(periodMetrics), 'EX', 3600);

      return periodMetrics;
    } catch (error) {
      logger.error('Error getting period metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate tier-specific goals
   * @param {string} currentTier - Current commission tier
   * @param {Object} metrics - Current period metrics
   * @returns {Object} Tier goals and progress
   */
  calculateTierGoals(currentTier, metrics) {
    const tierRequirements = {
      standard: {
        clicks: 1000,
        conversions: 10,
        revenue: 1000
      },
      silver: {
        clicks: 5000,
        conversions: 50,
        revenue: 5000
      },
      gold: {
        clicks: 15000,
        conversions: 150,
        revenue: 15000
      },
      platinum: {
        clicks: 50000,
        conversions: 500,
        revenue: 50000
      }
    };

    const currentRequirements = tierRequirements[currentTier];
    const nextTier = this.getNextTier(currentTier);
    const nextRequirements = tierRequirements[nextTier];

    return {
      current: {
        clicks: {
          target: currentRequirements.clicks,
          progress: metrics.clicks,
          percentage: Math.min((metrics.clicks / currentRequirements.clicks) * 100, 100)
        },
        conversions: {
          target: currentRequirements.conversions,
          progress: metrics.conversions,
          percentage: Math.min((metrics.conversions / currentRequirements.conversions) * 100, 100)
        },
        revenue: {
          target: currentRequirements.revenue,
          progress: metrics.revenue,
          percentage: Math.min((metrics.revenue / currentRequirements.revenue) * 100, 100)
        }
      },
      next: nextTier ? {
        tier: nextTier,
        requirements: nextRequirements
      } : null
    };
  }

  /**
   * Get next tier level
   * @param {string} currentTier - Current commission tier
   * @returns {string|null} Next tier or null if at highest
   */
  getNextTier(currentTier) {
    const tiers = ['standard', 'silver', 'gold', 'platinum'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }

  /**
   * Get available rewards for an affiliate
   * @param {string} affiliateId - The affiliate's ID
   * @returns {Promise<Array>} Available rewards
   */
  async getAvailableRewards(affiliateId) {
    try {
      const affiliate = await Affiliate.findById(affiliateId);
      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      // Define rewards based on performance and tier
      const rewards = [];
      const metrics = affiliate.metrics;

      // Milestone rewards
      if (metrics.totalConversions >= 100) {
        rewards.push({
          type: 'milestone',
          name: '100 Conversions Club',
          benefit: 'Extra 2% commission for next 30 days',
          status: 'available'
        });
      }

      // Tier-specific rewards
      const tierRewards = {
        silver: {
          name: 'Priority Support',
          benefit: '24/7 dedicated support channel'
        },
        gold: {
          name: 'Early Access',
          benefit: 'Preview new campaigns 48h before others'
        },
        platinum: {
          name: 'Custom Commission',
          benefit: 'Negotiate custom commission rates'
        }
      };

      if (tierRewards[affiliate.commissionTier]) {
        rewards.push({
          type: 'tier',
          ...tierRewards[affiliate.commissionTier],
          status: 'active'
        });
      }

      return rewards;
    } catch (error) {
      logger.error('Error getting available rewards:', error);
      throw error;
    }
  }
}

module.exports = new AffiliateRewardsService();

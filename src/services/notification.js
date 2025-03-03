/**
 * Notification Service
 * Handles campaign-related notifications for affiliates
 */

const emailService = require('../utils/email');

class NotificationService {
  /**
   * Send campaign approval notification
   */
  async sendCampaignApprovalNotification(affiliateId, campaignId, status, reasons = []) {
    try {
      const template = {
        approved: {
          subject: 'Campaign Application Approved',
          body: 'Your application to join the campaign has been approved. You can start promoting now.'
        },
        rejected: {
          subject: 'Campaign Application Rejected',
          body: `Your application to join the campaign was not approved for the following reasons:\n${reasons.join('\n')}`
        },
        pending: {
          subject: 'Campaign Application Under Review',
          body: 'Your application to join the campaign is being reviewed. We will notify you of the decision soon.'
        }
      };

      const notification = template[status];
      if (!notification) {
        throw new Error('Invalid notification status');
      }

      await emailService.sendEmail({
        to: affiliateId,
        subject: notification.subject,
        text: notification.body,
        metadata: {
          type: 'campaign_approval',
          campaignId,
          status
        }
      });
    } catch (error) {
      throw new Error(`Failed to send approval notification: ${error.message}`);
    }
  }

  /**
   * Send campaign status update notification
   */
  async sendCampaignStatusNotification(affiliateIds, campaignId, status) {
    try {
      const template = {
        active: {
          subject: 'Campaign Now Active',
          body: 'A campaign you are participating in is now active. You can start promoting.'
        },
        paused: {
          subject: 'Campaign Paused',
          body: 'A campaign you are participating in has been temporarily paused.'
        },
        ended: {
          subject: 'Campaign Ended',
          body: 'A campaign you were participating in has ended.'
        }
      };

      const notification = template[status];
      if (!notification) {
        throw new Error('Invalid campaign status for notification');
      }

      const emailPromises = affiliateIds.map(affiliateId =>
        emailService.sendEmail({
          to: affiliateId,
          subject: notification.subject,
          text: notification.body,
          metadata: {
            type: 'campaign_status',
            campaignId,
            status
          }
        })
      );

      await Promise.all(emailPromises);
    } catch (error) {
      throw new Error(`Failed to send status notifications: ${error.message}`);
    }
  }

  /**
   * Send campaign update notification
   */
  async sendCampaignUpdateNotification(affiliateIds, campaignId, updateType, details) {
    try {
      const templates = {
        commission: {
          subject: 'Campaign Commission Update',
          body: 'The commission structure for a campaign you are participating in has been updated.',
          priority: 'high'
        },
        rules: {
          subject: 'Campaign Rules Update',
          body: 'The rules for a campaign you are participating in have been modified.',
          priority: 'high'
        },
        materials: {
          subject: 'New Promotional Materials Available',
          body: 'New promotional materials are available for a campaign you are participating in.',
          priority: 'normal'
        },
        budget: {
          subject: 'Campaign Budget Update',
          body: 'The budget allocation for a campaign has been modified.',
          priority: 'high'
        },
        targeting: {
          subject: 'Campaign Targeting Update',
          body: 'The targeting criteria for a campaign have been updated.',
          priority: 'normal'
        },
        schedule: {
          subject: 'Campaign Schedule Change',
          body: 'The campaign schedule has been modified.',
          priority: 'high'
        }
      };

      const template = templates[updateType];
      if (!template) {
        throw new Error('Invalid update type for notification');
      }

      const emailPromises = affiliateIds.map(affiliateId =>
        emailService.sendEmail({
          to: affiliateId,
          subject: template.subject,
          text: `${template.body}\n\nDetails: ${details}`,
          metadata: {
            type: 'campaign_update',
            campaignId,
            updateType
          }
        })
      );

      await Promise.all(emailPromises);
    } catch (error) {
      throw new Error(`Failed to send update notifications: ${error.message}`);
    }
  }
}

module.exports = new NotificationService();
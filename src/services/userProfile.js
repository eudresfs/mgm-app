const User = require('../models/user');

class UserProfileService {
  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated user profile
   */
  async updateProfile(userId, profileData) {
    try {
      // Prevent updating sensitive fields
      const allowedUpdates = [
        'name', 
        'company', 
        'website', 
        'bio', 
        'preferences',
        'notificationSettings',
        'profileImage'
      ];
      
      const updateData = {};
      Object.keys(profileData).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updateData[key] = profileData[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId, 
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password -resetPasswordToken -resetPasswordExpires');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Updated user preferences
   */
  async updatePreferences(userId, preferences) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { new: true }
      ).select('preferences');

      if (!user) {
        throw new Error('User not found');
      }

      return user.preferences;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user notification settings
   * @param {string} userId - User ID
   * @param {Object} notificationSettings - Notification settings
   * @returns {Promise<Object>} Updated notification settings
   */
  async updateNotificationSettings(userId, notificationSettings) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { notificationSettings } },
        { new: true }
      ).select('notificationSettings');

      if (!user) {
        throw new Error('User not found');
      }

      return user.notificationSettings;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user role and permissions
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @param {Array} permissions - User permissions
   * @returns {Promise<Object>} Updated user role and permissions
   */
  async updateRoleAndPermissions(userId, role, permissions) {
    try {
      // This operation should be restricted to admin users only
      // The authorization check should be done in the controller/middleware
      
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            role,
            permissions
          } 
        },
        { new: true }
      ).select('role permissions');

      if (!user) {
        throw new Error('User not found');
      }

      return {
        role: user.role,
        permissions: user.permissions
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user email
   * @param {string} userId - User ID
   * @param {string} newEmail - New email address
   * @returns {Promise<Object>} Result of email change request
   */
  async changeEmail(userId, newEmail) {
    try {
      // Check if email is already in use
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        throw new Error('Email already in use');
      }

      // Generate verification token for new email
      const crypto = require('crypto');
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      
      // Update user with new email (unverified) and token
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            newEmail,
            emailVerificationToken,
            isNewEmailVerified: false
          } 
        },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Send verification email for new address
      const { sendVerificationEmail } = require('../utils/email');
      await sendVerificationEmail(newEmail, emailVerificationToken, 'email-change');

      return { 
        success: true, 
        message: 'Verification email sent to new address. Please verify to complete the change.' 
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify new email address
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Result of email verification
   */
  async verifyNewEmail(token) {
    try {
      const user = await User.findOne({ emailVerificationToken: token });
      if (!user) {
        throw new Error('Invalid verification token');
      }

      // Update user email and clear verification data
      user.email = user.newEmail;
      user.newEmail = undefined;
      user.emailVerificationToken = undefined;
      user.isNewEmailVerified = true;
      await user.save();

      return { 
        success: true, 
        message: 'Email changed successfully' 
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserProfileService();
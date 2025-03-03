const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const logger = require('../utils/logger');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

class AuthService {
  /**
   * Generate access token for user
   * @param {Object} user - User object
   * @returns {String} JWT access token
   */
  generateAccessToken(user) {
    return jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '1h' } // Short-lived access token
    );
  }

  /**
   * Generate refresh token for user
   * @param {Object} user - User object
   * @param {Object} deviceInfo - Device information
   * @returns {Object} Refresh token object
   */
  async generateRefreshToken(user, deviceInfo = {}) {
    try {
      // Generate a random token
      const tokenValue = crypto.randomBytes(40).toString('hex');
      
      // Set expiration (30 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      // Create refresh token record
      const refreshToken = new RefreshToken({
        token: tokenValue,
        userId: user._id,
        expiresAt,
        deviceInfo
      });
      
      await refreshToken.save();
      return refreshToken;
    } catch (error) {
      logger.error('Error generating refresh token', { userId: user._id, error: error.message });
      throw new Error('Failed to generate refresh token');
    }
  }

  async register(userData) {
    try {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      const user = new User({
        ...userData,
        verificationToken
      });
      
      await user.save();
      
      await sendVerificationEmail(user.email, verificationToken);
      
      return { success: true, message: 'Registration successful. Please verify your email.' };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Email already registered');
      }
      throw error;
    }
  }

  /**
   * Login user with email and password
   * @param {String} email - User email
   * @param {String} password - User password
   * @param {Object} deviceInfo - Device information
   * @returns {Object} Authentication tokens and user info
   */
  async login(email, password, deviceInfo = {}) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Generate access token
    const accessToken = this.generateAccessToken(user);
    
    // Generate refresh token
    const refreshToken = await this.generateRefreshToken(user, deviceInfo);

    logger.info('User logged in successfully', { userId: user._id });

    return { 
      accessToken, 
      refreshToken: refreshToken.token,
      refreshTokenExpiry: refreshToken.expiresAt,
      user: { id: user._id, email: user.email, role: user.role } 
    };
  }

  async verifyEmail(token) {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw new Error('Invalid verification token');
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return { success: true, message: 'Email verified successfully' };
  }

  async requestPasswordReset(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    return { success: true, message: 'Password reset email sent' };
  }

  /**
   * Refresh access token using refresh token
   * @param {String} refreshToken - Refresh token
   * @returns {Object} New access token and refresh token info
   */
  async refreshToken(refreshToken) {
    try {
      // Find the refresh token in the database
      const foundToken = await RefreshToken.findOne({ 
        token: refreshToken,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      });

      if (!foundToken) {
        throw new Error('Invalid or expired refresh token');
      }

      // Get the user associated with the token
      const user = await User.findById(foundToken.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate a new access token
      const accessToken = this.generateAccessToken(user);

      // Optionally, you can rotate the refresh token for enhanced security
      // await RefreshToken.findByIdAndDelete(foundToken._id);
      // const newRefreshToken = await this.generateRefreshToken(user, foundToken.deviceInfo);

      logger.info('Token refreshed successfully', { userId: user._id });

      return { 
        accessToken,
        refreshToken: foundToken.token,
        refreshTokenExpiry: foundToken.expiresAt,
        user: { id: user._id, email: user.email, role: user.role }
      };
    } catch (error) {
      logger.error('Error refreshing token', { error: error.message });
      throw error;
    }
  }

  /**
   * Revoke a refresh token
   * @param {String} refreshToken - Refresh token to revoke
   * @returns {Object} Success message
   */
  async revokeToken(refreshToken) {
    try {
      const foundToken = await RefreshToken.findOne({ token: refreshToken });
      if (!foundToken) {
        throw new Error('Token not found');
      }

      // Mark the token as revoked
      foundToken.isRevoked = true;
      await foundToken.save();

      logger.info('Token revoked successfully', { userId: foundToken.userId });

      return { success: true, message: 'Token revoked successfully' };
    } catch (error) {
      logger.error('Error revoking token', { error: error.message });
      throw error;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   * @param {String} userId - User ID
   * @returns {Object} Success message
   */
  async revokeAllUserTokens(userId) {
    try {
      await RefreshToken.updateMany(
        { userId },
        { isRevoked: true }
      );

      logger.info('All user tokens revoked', { userId });

      return { success: true, message: 'All tokens revoked successfully' };
    } catch (error) {
      logger.error('Error revoking all user tokens', { userId, error: error.message });
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { success: true, message: 'Password reset successful' };
  }

  async setupTwoFactor(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const secret = speakeasy.generateSecret();
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: user.email,
      issuer: 'MGM Platform'
    });

    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    user.twoFactorSecret = secret.base32;
    await user.save();

    return { 
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl
    };
  }

  async socialLogin(provider, profile) {
    let user = await User.findOne({
      'socialLogins.provider': provider,
      'socialLogins.providerId': profile.id
    });

    if (!user) {
      user = new User({
        email: profile.email,
        name: profile.name,
        isEmailVerified: true,
        socialLogins: [{ provider, providerId: profile.id }]
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { token, user: { id: user._id, email: user.email, role: user.role } };
  }

  async updateProfile(userId, profileData) {
    const allowedUpdates = ['name', 'company', 'website', 'bio'];
    const updates = {};

    Object.keys(profileData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = profileData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

module.exports = new AuthService();
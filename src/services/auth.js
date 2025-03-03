const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

class AuthService {
  generateToken(user) {
    return jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '24h' }
    );
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

  async login(email, password) {
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

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { token, user: { id: user._id, email: user.email, role: user.role } };
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
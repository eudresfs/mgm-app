const User = require('../models/user');
const Merchant = require('../models/merchant');
const Affiliate = require('../models/affiliate');

class OnboardingService {
  /**
   * Initialize onboarding process for a new user
   * @param {string} userId - User ID
   * @param {string} userType - Type of user (merchant, affiliate)
   * @returns {Promise<Object>} Onboarding status and next steps
   */
  async initializeOnboarding(userId, userType) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Set user type and onboarding status
      user.userType = userType;
      user.onboardingStatus = {
        isComplete: false,
        currentStep: 1,
        startedAt: new Date(),
        lastUpdatedAt: new Date()
      };

      await user.save();

      // Return personalized onboarding steps based on user type
      return this.getOnboardingSteps(userType, 1);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get personalized onboarding steps for user type
   * @param {string} userType - Type of user
   * @param {number} currentStep - Current onboarding step
   * @returns {Object} Onboarding steps and information
   */
  getOnboardingSteps(userType, currentStep) {
    const steps = this.getStepsByUserType(userType);
    
    return {
      currentStep,
      totalSteps: steps.length,
      currentStepInfo: steps[currentStep - 1],
      nextStep: currentStep < steps.length ? steps[currentStep] : null,
      isComplete: currentStep >= steps.length
    };
  }

  /**
   * Get all onboarding steps for a specific user type
   * @param {string} userType - Type of user
   * @returns {Array} Array of onboarding steps
   */
  getStepsByUserType(userType) {
    switch (userType.toLowerCase()) {
      case 'merchant':
        return [
          {
            step: 1,
            title: 'Complete Your Profile',
            description: 'Add your company information and business details',
            fields: ['company', 'website', 'industry', 'companySize'],
            isRequired: true
          },
          {
            step: 2,
            title: 'Connect Your Store',
            description: 'Integrate your e-commerce platform to track conversions',
            fields: ['platform', 'storeUrl', 'apiKey'],
            isRequired: true
          },
          {
            step: 3,
            title: 'Set Up Payment Methods',
            description: 'Configure how you will pay your affiliates',
            fields: ['paymentMethods', 'paymentSchedule', 'minimumPayment'],
            isRequired: true
          },
          {
            step: 4,
            title: 'Create Your First Campaign',
            description: 'Launch your first affiliate marketing campaign',
            fields: [],
            isRequired: false
          }
        ];

      case 'affiliate':
        return [
          {
            step: 1,
            title: 'Complete Your Profile',
            description: 'Tell us about yourself and your audience',
            fields: ['bio', 'niche', 'audienceSize', 'socialProfiles'],
            isRequired: true
          },
          {
            step: 2,
            title: 'Set Up Payment Information',
            description: 'Add your payment details to receive commissions',
            fields: ['paymentMethod', 'paymentDetails', 'taxInformation'],
            isRequired: true
          },
          {
            step: 3,
            title: 'Discover Campaigns',
            description: 'Browse available campaigns that match your audience',
            fields: [],
            isRequired: false
          }
        ];

      default:
        return [
          {
            step: 1,
            title: 'Complete Your Profile',
            description: 'Tell us more about yourself',
            fields: ['name', 'bio'],
            isRequired: true
          },
          {
            step: 2,
            title: 'Choose Your Role',
            description: 'Select whether you want to be a merchant or affiliate',
            fields: ['userType'],
            isRequired: true
          }
        ];
    }
  }

  /**
   * Update onboarding progress
   * @param {string} userId - User ID
   * @param {number} step - Completed step number
   * @param {Object} stepData - Data submitted for the step
   * @returns {Promise<Object>} Updated onboarding status and next steps
   */
  async updateOnboardingProgress(userId, step, stepData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate current step
      if (user.onboardingStatus.currentStep !== step) {
        throw new Error('Invalid onboarding step');
      }

      // Process step data based on user type and step
      await this.processStepData(user, step, stepData);

      // Update onboarding status
      const nextStep = step + 1;
      const steps = this.getStepsByUserType(user.userType);
      const isComplete = nextStep > steps.length;

      user.onboardingStatus = {
        ...user.onboardingStatus,
        currentStep: isComplete ? step : nextStep,
        isComplete,
        lastUpdatedAt: new Date(),
        completedSteps: [...(user.onboardingStatus.completedSteps || []), step]
      };

      await user.save();

      // Return next steps or completion status
      return isComplete 
        ? { isComplete: true, message: 'Onboarding completed successfully' }
        : this.getOnboardingSteps(user.userType, nextStep);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process step data and update related models
   * @param {Object} user - User document
   * @param {number} step - Current step
   * @param {Object} stepData - Data submitted for the step
   */
  async processStepData(user, step, stepData) {
    try {
      // Handle user type specific data
      switch (user.userType.toLowerCase()) {
        case 'merchant':
          await this.processMerchantStepData(user, step, stepData);
          break;
        case 'affiliate':
          await this.processAffiliateStepData(user, step, stepData);
          break;
        default:
          // For general user or undecided type
          if (step === 2 && stepData.userType) {
            user.userType = stepData.userType;
            // Reset onboarding for the new user type
            user.onboardingStatus.currentStep = 1;
          }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process merchant-specific onboarding data
   * @param {Object} user - User document
   * @param {number} step - Current step
   * @param {Object} stepData - Data submitted for the step
   */
  async processMerchantStepData(user, step, stepData) {
    try {
      // Find or create merchant profile
      let merchant = await Merchant.findOne({ userId: user._id });
      
      if (!merchant) {
        merchant = new Merchant({
          userId: user._id,
          email: user.email,
          name: user.name
        });
      }

      // Update merchant data based on step
      switch (step) {
        case 1: // Company profile
          merchant.company = stepData.company;
          merchant.website = stepData.website;
          merchant.industry = stepData.industry;
          merchant.companySize = stepData.companySize;
          break;
        case 2: // Store connection
          merchant.store = {
            platform: stepData.platform,
            url: stepData.storeUrl,
            apiKey: stepData.apiKey,
            isConnected: true,
            connectedAt: new Date()
          };
          break;
        case 3: // Payment settings
          merchant.paymentSettings = {
            methods: stepData.paymentMethods,
            schedule: stepData.paymentSchedule,
            minimumPayment: stepData.minimumPayment
          };
          break;
      }

      await merchant.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process affiliate-specific onboarding data
   * @param {Object} user - User document
   * @param {number} step - Current step
   * @param {Object} stepData - Data submitted for the step
   */
  async processAffiliateStepData(user, step, stepData) {
    try {
      // Find or create affiliate profile
      let affiliate = await Affiliate.findOne({ userId: user._id });
      
      if (!affiliate) {
        affiliate = new Affiliate({
          userId: user._id,
          email: user.email,
          name: user.name
        });
      }

      // Update affiliate data based on step
      switch (step) {
        case 1: // Profile information
          affiliate.bio = stepData.bio;
          affiliate.niche = stepData.niche;
          affiliate.audienceSize = stepData.audienceSize;
          affiliate.socialProfiles = stepData.socialProfiles;
          break;
        case 2: // Payment information
          affiliate.paymentInformation = {
            method: stepData.paymentMethod,
            details: stepData.paymentDetails,
            taxInformation: stepData.taxInformation
          };
          break;
      }

      await affiliate.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get onboarding status for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Current onboarding status and steps
   */
  async getOnboardingStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.onboardingStatus) {
        return {
          isInitialized: false,
          message: 'Onboarding not started'
        };
      }

      return {
        isInitialized: true,
        ...user.onboardingStatus,
        ...this.getOnboardingSteps(user.userType, user.onboardingStatus.currentStep)
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OnboardingService();
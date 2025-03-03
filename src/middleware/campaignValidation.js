/**
 * Campaign Validation Middleware
 * Validates campaign data before processing
 */

const { body, validationResult } = require('express-validator');

/**
 * Validation rules for campaign creation and updates
 */
exports.campaignRules = () => {
  return [
    // Basic campaign information
    body('name').trim().notEmpty().withMessage('Campaign name is required'),
    body('description').optional().trim(),
    body('template').optional().trim(),
    body('status').isIn(['draft', 'active', 'paused', 'ended']).withMessage('Invalid campaign status'),
    
    // Campaign type and commission structure
    body('type').isIn(['cpa', 'cps', 'cpl', 'recurring', 'multi_level']).withMessage('Invalid campaign type'),
    body('commission.type').isIn(['fixed', 'percentage', 'tiered', 'hybrid']).withMessage('Invalid commission type'),
    body('commission.value').isNumeric().withMessage('Commission value must be a number'),
    body('commission.currency').optional().isString(),
    
    // Optional commission tiers for tiered commission type
    body('commission.tiers').optional().isArray(),
    body('commission.tiers.*.threshold').optional().isNumeric().withMessage('Tier threshold must be a number'),
    body('commission.tiers.*.value').optional().isNumeric().withMessage('Tier value must be a number'),
    
    // Recurring commission rules
    body('commission.recurringRules.duration').optional().isNumeric().withMessage('Recurring duration must be a number'),
    body('commission.recurringRules.frequency').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid recurring frequency'),
    body('commission.recurringRules.firstMonthBonus').optional().isNumeric().withMessage('First month bonus must be a number'),
    
    // Multi-level commission rules
    body('commission.levels').optional().isArray().withMessage('Commission levels must be an array'),
    body('commission.levels.*.level').optional().isNumeric().withMessage('Level number must be a number'),
    body('commission.levels.*.value').optional().isNumeric().withMessage('Level value must be a number'),
    body('commission.levels.*.type').optional().isIn(['fixed', 'percentage']).withMessage('Invalid level commission type'),
    
    // Budget controls
    body('budget.total').optional().isNumeric().withMessage('Budget total must be a number'),
    body('budget.daily').optional().isNumeric().withMessage('Daily budget must be a number'),
    
    // Promotional materials
    body('promotionalMaterials').optional().isArray(),
    body('promotionalMaterials.*.type').optional().isIn(['banner', 'text', 'video', 'link']),
    body('promotionalMaterials.*.url').optional().isURL().withMessage('Invalid URL format'),
    body('promotionalMaterials.*.content').optional(),
    body('promotionalMaterials.*.dimensions').optional(),
    
    // Qualification rules
    body('qualificationRules').optional().isArray(),
    body('qualificationRules.*.type').optional().isString(),
    body('qualificationRules.*.condition').optional().isString(),
    
    // Affiliate segmentation
    body('affiliateSegments').optional().isArray(),
    body('affiliateSegments.*.name').optional().isString(),
    
    // Approval process
    body('approvalProcess.type').optional().isIn(['automatic', 'manual']),
    body('approvalProcess.rules').optional().isArray(),
    
    // Tracking settings
    body('tracking.attributionWindow').optional().isInt({ min: 1, max: 90 }),
    body('tracking.cookieLifetime').optional().isInt({ min: 1, max: 365 }),
    body('tracking.allowedDomains').optional().isArray(),
    
    // Targeting options
    body('targeting.countries').optional().isArray(),
    body('targeting.devices').optional().isArray(),
    
    // Campaign schedule and template
    body('template').optional().isIn(['ecommerce', 'saas', 'digital_products', 'services', 'custom']).withMessage('Invalid template type'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    body('scheduleSettings.autoStart').optional().isBoolean(),
    body('scheduleSettings.autoEnd').optional().isBoolean(),
    body('scheduleSettings.statusTransitions').optional().isArray(),
    body('scheduleSettings.statusTransitions.*.fromStatus').optional().isIn(['draft', 'active', 'paused', 'ended']),
    body('scheduleSettings.statusTransitions.*.toStatus').optional().isIn(['draft', 'active', 'paused', 'ended']),
    body('scheduleSettings.statusTransitions.*.scheduledDate').optional().isISO8601()
  ];
};

/**
 * Middleware to check validation results
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Validate campaign budget constraints
 */
exports.validateBudget = (req, res, next) => {
  const { budget } = req.body;
  
  if (budget) {
    // If daily budget is set, it should not exceed total budget
    if (budget.daily && budget.total && budget.daily > budget.total) {
      return res.status(400).json({ 
        error: 'Daily budget cannot exceed total budget' 
      });
    }
    
    // Initialize remaining budget if not provided
    if (budget.total && !budget.remaining) {
      req.body.budget.remaining = budget.total;
    }
  }
  
  next();
};

/**
 * Validate campaign dates
 */
exports.validateDates = (req, res, next) => {
  const { startDate, endDate } = req.body;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return res.status(400).json({ 
        error: 'End date must be after start date' 
      });
    }
  }
  
  next();
};
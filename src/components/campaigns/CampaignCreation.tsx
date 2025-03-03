import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Define campaign creation steps
const steps = [
  'Basic Information',
  'Commission Structure',
  'Promotional Materials',
  'Rules & Qualifications',
  'Affiliate Settings',
  'Review & Launch'
];

// Commission model types
const commissionModels = [
  { value: 'cpa', label: 'Cost Per Acquisition (CPA)' },
  { value: 'cpl', label: 'Cost Per Lead (CPL)' },
  { value: 'cps', label: 'Cost Per Sale (CPS)' },
  { value: 'recurring', label: 'Recurring Commission' },
  { value: 'multi_level', label: 'Multi-Level Commission' },
];

// Campaign templates
const campaignTemplates = [
  { value: 'ecommerce_basic', label: 'E-commerce Basic' },
  { value: 'saas_subscription', label: 'SaaS Subscription' },
  { value: 'lead_generation', label: 'Lead Generation' },
  { value: 'content_promotion', label: 'Content Promotion' },
];

interface CampaignCreationProps {
  onSave?: (campaignData: any) => void;
  onCancel?: () => void;
}

export const CampaignCreation: React.FC<CampaignCreationProps> = ({ onSave, onCancel }) => {
  // State for stepper
  const [activeStep, setActiveStep] = useState(0);
  
  // State for campaign data
  const [campaignData, setCampaignData] = useState({
    // Basic Information
    name: '',
    description: '',
    template: '',
    startDate: null,
    endDate: null,
    
    // Commission Structure
    commissionModel: '',
    commissionValue: '',
    commissionType: 'fixed', // fixed or percentage
    recurringDuration: '',
    multiLevelRates: [],
    
    // Promotional Materials
    materials: [],
    allowCustomMaterials: false,
    
    // Rules & Qualifications
    conversionWindow: 30, // days
    budgetCap: '',
    dailyBudgetCap: '',
    qualificationRules: [],
    
    // Affiliate Settings
    approvalType: 'automatic', // automatic or manual
    affiliateSegments: [],
    notificationSettings: {
      onApproval: true,
      onRejection: true,
      onConversion: true,
    },
  });

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setCampaignData({
      ...campaignData,
      [field]: value,
    });
  };

  // Handle next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle campaign duplication
  const handleDuplicate = () => {
    const duplicatedData = {
      ...campaignData,
      name: `${campaignData.name} (Copy)`,
      startDate: null,
      endDate: null
    };
    setCampaignData(duplicatedData);
    setActiveStep(0);
  };

  // Handle campaign save
  const handleSave = () => {
    if (onSave) {
      onSave(campaignData);
    }
    console.log('Campaign data:', campaignData);
  };

  // Render Review & Launch step
  const renderReviewLaunch = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Review & Launch Campaign
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Review your campaign settings before launching
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Information
            </Typography>
            <Typography><strong>Name:</strong> {campaignData.name}</Typography>
            <Typography><strong>Template:</strong> {campaignTemplates.find(t => t.value === campaignData.template)?.label || 'None'}</Typography>
            <Typography><strong>Start Date:</strong> {campaignData.startDate ? new Date(campaignData.startDate).toLocaleString() : 'Not set'}</Typography>
            <Typography><strong>End Date:</strong> {campaignData.endDate ? new Date(campaignData.endDate).toLocaleString() : 'Not set'}</Typography>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Commission Structure
            </Typography>
            <Typography><strong>Model:</strong> {commissionModels.find(m => m.value === campaignData.commissionModel)?.label}</Typography>
            <Typography><strong>Value:</strong> {campaignData.commissionValue} {campaignData.commissionType === 'percentage' ? '%' : 'USD'}</Typography>
            {campaignData.commissionModel === 'recurring' && (
              <Typography><strong>Duration:</strong> {campaignData.recurringDuration} months</Typography>
            )}
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Rules & Budget
            </Typography>
            <Typography><strong>Conversion Window:</strong> {campaignData.conversionWindow} days</Typography>
            <Typography><strong>Budget Cap:</strong> {campaignData.budgetCap ? `$${campaignData.budgetCap}` : 'No limit'}</Typography>
            <Typography><strong>Daily Budget:</strong> {campaignData.dailyBudgetCap ? `$${campaignData.dailyBudgetCap}` : 'No limit'}</Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Affiliate Settings
            </Typography>
            <Typography><strong>Approval Type:</strong> {campaignData.approvalType === 'automatic' ? 'Automatic Approval' : 'Manual Review'}</Typography>
            <Typography><strong>Custom Materials:</strong> {campaignData.allowCustomMaterials ? 'Allowed' : 'Not Allowed'}</Typography>
            <Typography><strong>Notifications:</strong></Typography>
            <Box sx={{ pl: 2 }}>
              <Typography>• Approval: {campaignData.notificationSettings.onApproval ? 'Enabled' : 'Disabled'}</Typography>
              <Typography>• Rejection: {campaignData.notificationSettings.onRejection ? 'Enabled' : 'Disabled'}</Typography>
              <Typography>• Conversion: {campaignData.notificationSettings.onConversion ? 'Enabled' : 'Disabled'}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleDuplicate}
          >
            Duplicate Campaign
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
          >
            Launch Campaign
          </Button>
        </Grid>
      </Grid>
    );
  };

  // Render step content based on active step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderCommissionStructure();
      case 2:
        return renderPromotionalMaterials();
      case 3:
        return renderRulesQualifications();
      case 4:
        return renderAffiliateSettings();
      case 5:
        return renderReviewLaunch();
      default:
        return 'Unknown step';
    }
  };

  // Render Basic Information step
  const renderBasicInformation = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Campaign Details
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="template-label">Start with a Template (Optional)</InputLabel>
            <Select
              labelId="template-label"
              value={campaignData.template}
              label="Start with a Template (Optional)"
              onChange={(e) => handleChange('template', e.target.value)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {campaignTemplates.map((template) => (
                <MenuItem key={template.value} value={template.value}>
                  {template.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Campaign Name"
            value={campaignData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            helperText="Choose a descriptive name for your campaign"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Campaign Description"
            value={campaignData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            helperText="Describe your campaign to help affiliates understand its purpose"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Start Date"
              value={campaignData.startDate}
              onChange={(newValue) => handleChange('startDate', newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="End Date (Optional)"
              value={campaignData.endDate}
              onChange={(newValue) => handleChange('endDate', newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    );
  };

  // Render Commission Structure step
  const renderCommissionStructure = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Commission Model
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Define how affiliates will earn commissions in this campaign
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="commission-model-label">Commission Model</InputLabel>
            <Select
              labelId="commission-model-label"
              value={campaignData.commissionModel}
              label="Commission Model"
              onChange={(e) => handleChange('commissionModel', e.target.value)}
            >
              {commissionModels.map((model) => (
                <MenuItem key={model.value} value={model.value}>
                  {model.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Commission Value"
            type="number"
            value={campaignData.commissionValue}
            onChange={(e) => handleChange('commissionValue', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="commission-type-label">Commission Type</InputLabel>
            <Select
              labelId="commission-type-label"
              value={campaignData.commissionType}
              label="Commission Type"
              onChange={(e) => handleChange('commissionType', e.target.value)}
            >
              <MenuItem value="fixed">Fixed Amount</MenuItem>
              <MenuItem value="percentage">Percentage</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {campaignData.commissionModel === 'recurring' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Recurring Duration (months)"
              type="number"
              value={campaignData.recurringDuration}
              onChange={(e) => handleChange('recurringDuration', e.target.value)}
              helperText="How many months affiliates will earn recurring commissions"
            />
          </Grid>
        )}
        
        {campaignData.commissionModel === 'multi_level' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Multi-Level Commission Rates
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Define commission rates for each level in the affiliate hierarchy
              </Typography>
              {/* Multi-level commission configuration would go here */}
              <Typography variant="body2" color="primary">
                This feature will be implemented in the next phase
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  };

  // Render Promotional Materials step
  const renderPromotionalMaterials = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Promotional Materials
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Provide marketing materials for your affiliates to use
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Upload Materials
            </Typography>
            <Button variant="outlined" color="primary">
              Upload Images
            </Button>
            <Button variant="outlined" color="primary" sx={{ ml: 2 }}>
              Add Text Links
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={campaignData.allowCustomMaterials}
                onChange={(e) => handleChange('allowCustomMaterials', e.target.checked)}
                color="primary"
              />
            }
            label="Allow affiliates to create custom materials"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Material Library
            </Typography>
            <Typography variant="body2" color="textSecondary">
              No materials added yet. Upload images or add text links above.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // Render Rules & Qualifications step
  const renderRulesQualifications = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Campaign Rules & Qualifications
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Conversion Window (days)"
            type="number"
            value={campaignData.conversionWindow}
            onChange={(e) => handleChange('conversionWindow', e.target.value)}
            helperText="How long after a click a conversion will be attributed"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Budget Cap (optional)"
            type="number"
            value={campaignData.budgetCap}
            onChange={(e) => handleChange('budgetCap', e.target.value)}
            helperText="Maximum total budget for this campaign"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Daily Budget Cap (optional)"
            type="number"
            value={campaignData.dailyBudgetCap}
            onChange={(e) => handleChange('dailyBudgetCap', e.target.value)}
            helperText="Maximum daily budget for this campaign"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Qualification Rules
              <Tooltip title="Define rules that must be met for a conversion to be valid">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Button variant="outlined" color="primary">
              Add Qualification Rule
            </Button>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // Render Affiliate Settings step
  const renderAffiliateSettings = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Affiliate Settings
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Configure how affiliates can join and promote your campaign
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="approval-type-label">Affiliate Approval</InputLabel>
            <Select
              labelId="approval-type-label"
              value={campaignData.approvalType}
              label="Affiliate Approval"
              onChange={(e) => handleChange('approvalType', e.target.value)}
            >
              <MenuItem value="automatic">Automatic Approval</MenuItem>
              <MenuItem value="manual">Manual Review</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Affiliate Segmentation
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Target specific affiliate segments for this campaign
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label="All Affiliates" color="primary" sx={{ mr: 1, mb: 1 }} />
              <Chip label="Top Performers" sx={{ mr: 1, mb: 1 }} />
              <Chip label="New Affiliates" sx={{ mr: 1, mb: 1 }} />
              <Button size="small" variant="outlined" sx={{ mb: 1 }}>
                Add Segment
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Notification Settings
          </Typography>
          <Grid container>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={campaignData.notificationSettings.onApproval}
                    onChange={(e) => handleChange('notificationSettings', {
                      ...campaignData.notificationSettings,
                      onApproval: e.target.checked
                    })}
                    color="primary"
                  />
                }
                label="Notify affiliates when approved"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={campaignData.notificationSettings.onRejection}
                    onChange={(e) => handleChange('notificationSettings', {
                      ...campaignData.notificationSettings,
                      onRejection: e.target.checked
                    })}
                    color="primary"
                  />
                }
                label="Notify affiliates when rejected"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={campaignData.notificationSettings.onConversion}
                    onChange={(e) => handleChange('notificationSettings', {
                      ...campaignData.notificationSettings,
                      onConversion: e.target.checked
                    })}
                    color="primary"
                  />
                }
                label="Notify affiliates on conversion"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 4 }}>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Campaign
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CampaignCreation;
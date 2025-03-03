import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Tabs,
  Tab,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Person, Lock, Security } from '@mui/icons-material';
import TwoFactorSetup from './TwoFactorSetup';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    twoFactorEnabled: boolean;
    twoFactorMethod?: '2fa_app' | 'sms';
  };
  onUpdateProfile: (data: { name: string; email: string; phone?: string }) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onEnable2FA: (method: '2fa_app' | 'sms', verificationData: string) => Promise<void>;
  onDisable2FA: (verificationCode: string) => Promise<void>;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onUpdateProfile,
  onChangePassword,
  onEnable2FA,
  onDisable2FA,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(user.twoFactorEnabled);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false);
  
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset form values when user data changes
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setIs2FAEnabled(user.twoFactorEnabled);
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Reset success messages when changing tabs
    setProfileSuccess(false);
    setPasswordSuccess(false);
  };

  const validateProfileForm = () => {
    if (!name.trim()) {
      setProfileError('Name is required');
      return false;
    }
    if (!email.trim()) {
      setProfileError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileError('Please provide a valid email address');
      return false;
    }
    if (phone && !/^\+?[0-9\s-()]+$/.test(phone)) {
      setProfileError('Please provide a valid phone number');
      return false;
    }
    return true;
  };

  const validatePasswordForm = () => {
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return false;
    }
    if (!newPassword) {
      setPasswordError('New password is required');
      return false;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    
    if (validateProfileForm()) {
      setIsLoading(true);
      try {
        await onUpdateProfile({ name, email, phone: phone || undefined });
        setProfileSuccess(true);
      } catch (error: any) {
        setProfileError(error.message || 'Failed to update profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    
    if (validatePasswordForm()) {
      setIsLoading(true);
      try {
        await onChangePassword(currentPassword, newPassword);
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (error: any) {
        setPasswordError(error.message || 'Failed to change password. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handle2FAToggle = () => {
    if (is2FAEnabled) {
      setShowDisable2FADialog(true);
    } else {
      setShow2FASetup(true);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      await onDisable2FA(verificationCode);
      setIs2FAEnabled(false);
      setShowDisable2FADialog(false);
      setVerificationCode('');
    } catch (error: any) {
      setSecurityError(error.message || 'Failed to disable 2FA. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup2FAComplete = async (method: '2fa_app' | 'sms', code: string) => {
    try {
      await onEnable2FA(method, code);
      setIs2FAEnabled(true);
      setShow2FASetup(false);
    } catch (error: any) {
      setSecurityError(error.message || 'Failed to enable 2FA. Please try again.');
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="profile tabs"
          centered
        >
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Lock />} label="Password" />
          <Tab icon={<Security />} label="Security" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>
        
        {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
        {profileSuccess && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}
        
        <Box component="form" onSubmit={handleProfileSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            margin="normal"
            placeholder="+1234567890"
            helperText="Optional - Required for SMS 2FA"
          />
          
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        
        {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
        {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>Password changed successfully!</Alert>}
        
        <Box component="form" onSubmit={handlePasswordSubmit}>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
          />
          
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={isLoading}
          >
            {isLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Two-Factor Authentication
        </Typography>
        
        {securityError && <Alert severity="error" sx={{ mb: 2 }}>{securityError}</Alert>}
        
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={is2FAEnabled}
                onChange={handle2FAToggle}
                color="primary"
              />
            }
            label={is2FAEnabled ? 'Enabled' : 'Disabled'}
          />
          
          {is2FAEnabled && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Two-factor authentication is currently enabled using 
                {user.twoFactorMethod === '2fa_app' ? ' an authenticator app' : ' SMS verification'}.
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" color="textSecondary">
            Two-factor authentication adds an extra layer of security to your account.
            When enabled, you'll need to provide a verification code in addition to your password when signing in.
          </Typography>
        </Box>
      </TabPanel>

      {/* 2FA Setup Dialog */}
      {show2FASetup && (
        <TwoFactorSetup
          onSetupComplete={handleSetup2FAComplete}
          onCancel={() => setShow2FASetup(false)}
          userEmail={user.email}
        />
      )}

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FADialog} onClose={() => setShowDisable2FADialog(false)}>
        <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to disable two-factor authentication? This will make your account less secure.
          </Typography>
          <TextField
            fullWidth
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            margin="normal"
            placeholder="Enter the 6-digit code"
            helperText="Enter the code from your authenticator app or SMS"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDisable2FADialog(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleDisable2FA} color="error" disabled={isLoading || !verificationCode}>
            {isLoading ? 'Processing...' : 'Disable 2FA'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserProfile;
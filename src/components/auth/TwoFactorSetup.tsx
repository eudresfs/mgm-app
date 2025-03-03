import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import QRCode from 'qrcode.react';

interface TwoFactorSetupProps {
  onSetupComplete: (method: '2fa_app' | 'sms', verificationData: string) => Promise<void>;
  onCancel: () => void;
  userEmail: string;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  onSetupComplete,
  onCancel,
  userEmail,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [method, setMethod] = useState<'2fa_app' | 'sms'>('2fa_app');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const steps = ['Select Method', 'Setup', 'Verify'];

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handleMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMethod(event.target.value as '2fa_app' | 'sms');
    setError('');
    setPhoneNumber('');
    setVerificationCode('');
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (method === 'sms' && !validatePhoneNumber(phoneNumber)) {
        setError('Please enter a valid phone number with country code (e.g., +1234567890)');
        return;
      }

      setIsLoading(true);
      try {
        if (method === '2fa_app') {
          const response = await fetch('/api/auth/2fa/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: '2fa_app', email: userEmail }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to setup 2FA');
          
          setSecretKey(data.secretKey);
          setQrCodeUrl(`otpauth://totp/${encodeURIComponent(userEmail)}?secret=${data.secretKey}&issuer=MGM`);
        } else {
          const response = await fetch('/api/auth/2fa/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: 'sms', phoneNumber, email: userEmail }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to send verification code');
        }
        setActiveStep((prev) => prev + 1);
      } catch (err: any) {
        setError(err.message || 'Failed to setup 2FA. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (activeStep === 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(verificationCode)) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      await onSetupComplete(method, verificationCode);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      setVerificationCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FormControl component="fieldset">
            <FormLabel component="legend">Choose 2FA Method</FormLabel>
            <RadioGroup value={method} onChange={handleMethodChange}>
              <FormControlLabel
                value="2fa_app"
                control={<Radio />}
                label="Authenticator App (Recommended)"
              />
              <FormControlLabel
                value="sms"
                control={<Radio />}
                label="SMS Verification"
              />
            </RadioGroup>
            {method === 'sms' && (
              <TextField
                fullWidth
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setError('');
                }}
                placeholder="+1234567890"
                margin="normal"
                helperText="Enter your phone number with country code"
                error={method === 'sms' && !!error && error.includes('phone')}
                disabled={isLoading}
              />
            )}
          </FormControl>
        );
      case 1:
        return method === '2fa_app' ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              1. Install an authenticator app like Google Authenticator or Authy
            </Typography>
            <Typography variant="body1" gutterBottom>
              2. Scan the QR code or enter the secret key manually
            </Typography>
            <Box sx={{ my: 2 }}>
              <QRCode value={qrCodeUrl} size={200} />
            </Box>
            <Typography variant="body2" color="textSecondary">
              Secret Key: {secretKey}
            </Typography>
          </Box>
        ) : (
          <Typography>
            A verification code has been sent to your phone number.
          </Typography>
        );
      case 2:
        return (
          <TextField
            fullWidth
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => {
              setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError('');
            }}
            margin="normal"
            placeholder="Enter the 6-digit code"
            inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
            error={!!error && error.includes('verification code')}
            disabled={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Two-Factor Authentication Setup
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mt: 2 }}>
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeStep > 0 && (
              <Button
                onClick={() => setActiveStep((prev) => prev - 1)}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={activeStep === 2 ? handleVerify : handleNext}
              disabled={isLoading || (method === 'sms' && activeStep === 0 && !phoneNumber)}
            >
              {isLoading
                ? 'Processing...'
                : activeStep === 2
                ? 'Verify'
                : 'Next'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default TwoFactorSetup;
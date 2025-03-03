import React, { useState } from 'react';
import { Paper, Typography, Box, TextField, Button, Alert } from '@mui/material';

interface TwoFactorAuthProps {
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
  method: '2fa_app' | 'sms';
  email: string;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ onVerify, onCancel, method, email }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError('Verification code is required');
      return;
    }

    setIsLoading(true);
    try {
      await onVerify(code);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Two-Factor Authentication
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }} align="center">
        {method === '2fa_app'
          ? 'Please enter the verification code from your authenticator app.'
          : `Please enter the verification code sent to your phone.`}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          margin="normal"
          placeholder="Enter the 6-digit code"
          autoFocus
          inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Button variant="text" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TwoFactorAuth;
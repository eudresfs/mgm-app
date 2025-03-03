import React, { useState } from 'react';
import { Button, TextField, Paper, Typography, Box, Link } from '@mui/material';

interface ForgotPasswordProps {
  onRequestReset: (email: string) => Promise<void>;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onRequestReset }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please provide a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await onRequestReset(email);
      setSuccess(true);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
        <Typography variant="h6" gutterBottom align="center">
          Reset Email Sent
        </Typography>
        <Typography align="center" sx={{ mb: 2 }}>
          Please check your email for instructions to reset your password.
        </Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Link href="/login" variant="body2">
            Return to Login
          </Link>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Reset Password
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }} align="center">
        Enter your email address and we'll send you instructions to reset your password.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!error}
          helperText={error}
          margin="normal"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link href="/login" variant="body2">
            Back to Login
          </Link>
        </Box>
      </Box>
    </Paper>
  );
};

export default ForgotPassword;
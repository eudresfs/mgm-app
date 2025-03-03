import React, { useState } from 'react';
import { Button, TextField, Paper, Typography, Box, Link, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';

interface ResetPasswordProps {
  onResetPassword: (token: string, newPassword: string) => Promise<void>;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onResetPassword }) => {
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!newPassword) {
      setError('Password is required');
      return false;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid reset token');
      return;
    }
    
    if (validateForm()) {
      try {
        await onResetPassword(token, newPassword);
        setSuccess(true);
        setError('');
      } catch (error: any) {
        setError(error.message || 'Failed to reset password. Please try again.');
      }
    }
  };

  if (success) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
        <Typography variant="h6" gutterBottom align="center">
          Password Reset Successful
        </Typography>
        <Alert severity="success" sx={{ mb: 2 }}>
          Your password has been successfully reset.
        </Alert>
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
        Reset Your Password
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }} align="center">
        Please enter your new password below.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
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
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Reset Password
        </Button>
      </Box>
    </Paper>
  );
};

export default ResetPassword;
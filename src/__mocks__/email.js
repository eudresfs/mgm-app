// Mock for email utility
const emailMock = {
  sendVerificationEmail: jest.fn().mockResolvedValue({
    messageId: 'mock-verification-email-id',
    response: 'Email verification sent successfully'
  }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({
    messageId: 'mock-password-reset-email-id',
    response: 'Password reset email sent successfully'
  })
};

module.exports = emailMock;
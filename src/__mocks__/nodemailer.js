// Mock for nodemailer
const nodemailer = {
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mock-message-id',
      envelope: {},
      accepted: ['test@example.com'],
      rejected: [],
      pending: [],
      response: 'mock-response'
    })
  }),
  createTestAccount: jest.fn().mockResolvedValue({
    user: 'mock-user',
    pass: 'mock-password',
    web: 'https://ethereal.email/mock'
  }),
  getTestMessageUrl: jest.fn().mockReturnValue('https://ethereal.email/mock/preview')
};

module.exports = nodemailer;
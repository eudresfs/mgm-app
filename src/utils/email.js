const nodemailer = require('nodemailer');
const logger = require('./logger');

// In a production environment, you would use a real SMTP service
// For development, we can use a test account from Ethereal
let transporter;

async function createTransporter() {
  if (transporter) return transporter;
  
  if (process.env.NODE_ENV === 'production') {
    // Production transporter configuration
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  } else {
    // For development, use Ethereal
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    logger.info(`Development email account: ${testAccount.web}`);
  }
  
  return transporter;
}

async function sendEmail(to, subject, html) {
  try {
    const transport = await createTransporter();
    
    const info = await transport.sendMail({
      from: `"MGM Affiliate Platform" <${process.env.EMAIL_FROM || 'noreply@mgmaffiliate.com'}`,
      to,
      subject,
      html
    });
    
    logger.info(`Email sent: ${info.messageId}`);
    
    // For development, log the URL where the email can be previewed
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw error;
  }
}

async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const html = `
    <h1>Verify Your Email</h1>
    <p>Thank you for registering with MGM Affiliate Platform. Please click the link below to verify your email address:</p>
    <p><a href="${verificationUrl}">Verify Email</a></p>
    <p>If you did not create an account, please ignore this email.</p>
  `;
  
  return sendEmail(email, 'Please Verify Your Email', html);
}

async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const html = `
    <h1>Reset Your Password</h1>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>This link will expire in 1 hour.</p>
  `;
  
  return sendEmail(email, 'Password Reset Request', html);
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
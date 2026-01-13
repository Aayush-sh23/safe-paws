const nodemailer = require('nodemailer');

let transporter;

if (process.env.SENDGRID_API_KEY) {
  // SendGrid configuration
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  });
} else if (process.env.SMTP_HOST) {
  // Generic SMTP configuration
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  console.warn('⚠️  No email configuration found. OTP emails will be logged to console.');
}

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER,
    to: email,
    subject: 'Safe Paws - Your Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🐾 Safe Paws</h2>
        <p>Your one-time password (OTP) for login is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px;">Safe Paws - Data-driven street dog safety management</p>
      </div>
    `
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ OTP sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  } else {
    console.log(`📧 OTP for ${email}: ${otp}`);
    return true;
  }
};

module.exports = { sendOTP };
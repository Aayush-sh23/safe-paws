const nodemailer = require('nodemailer');

let transporter;

if (process.env.SENDGRID_API_KEY) {
  // SendGrid configuration with optimized settings
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    },
    pool: true, // Use pooled connections for faster sending
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 10
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
    },
    pool: true,
    maxConnections: 3
  });
} else {
  console.warn('⚠️  No email configuration found. OTP emails will be logged to console.');
}

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: {
      name: 'Safe Paws',
      address: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER
    },
    to: email,
    subject: 'Safe Paws - Your Login OTP (Expires in 10 minutes)',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .card {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .title {
            color: #3b82f6;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
          }
          .otp-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            border-radius: 12px;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 12px;
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            font-family: 'Courier New', monospace;
          }
          .otp-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin-top: 10px;
            font-weight: 500;
          }
          .info {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
          }
          .info p {
            margin: 8px 0;
            font-size: 14px;
            color: #64748b;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .warning p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
          }
          .footer p {
            color: #94a3b8;
            font-size: 12px;
            margin: 5px 0;
          }
          .button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">🐾</div>
              <h1 class="title">Safe Paws</h1>
              <p style="color: #64748b; margin: 10px 0 0 0;">Your Login Verification Code</p>
            </div>

            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <div class="otp-label">Enter this code to login</div>
            </div>

            <div class="info">
              <p><strong>⏰ Valid for:</strong> 10 minutes</p>
              <p><strong>📧 Sent to:</strong> ${email}</p>
              <p><strong>🕐 Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong> Never share this code with anyone. Safe Paws staff will never ask for your OTP.</p>
            </div>

            <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px;">
              If you didn't request this code, please ignore this email or contact support if you're concerned about your account security.
            </p>

            <div class="footer">
              <p><strong>Safe Paws</strong></p>
              <p>Data-driven street dog safety management</p>
              <p>Balancing human safety with animal welfare</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Safe Paws - Your Login OTP

Your one-time password (OTP) is: ${otp}

This OTP is valid for 10 minutes.
Sent to: ${email}
Time: ${new Date().toLocaleString()}

If you didn't request this, please ignore this email.

Safe Paws - Data-driven street dog safety management
    `,
    priority: 'high' // Mark as high priority for faster delivery
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ OTP sent to ${email} (Message ID: ${info.messageId})`);
      return true;
    } catch (error) {
      console.error('❌ Email send error:', error);
      // Log to console as fallback
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📧 FALLBACK: OTP for ${email}: ${otp}`);
      console.log(`⏰ Expires: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}`);
      console.log(`${'='.repeat(50)}\n`);
      throw error;
    }
  } else {
    // No email configured - log to console
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📧 OTP for ${email}: ${otp}`);
    console.log(`⏰ Expires: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}`);
    console.log(`${'='.repeat(50)}\n`);
    return true;
  }
};

// Verify transporter on startup
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter verification failed:', error);
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
}

module.exports = { sendOTP };
import { Resend } from 'resend';

export class EmailService {
  private static resend: Resend;

  private static initialize() {
    if (!this.resend) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error('RESEND_API_KEY is not defined in environment variables');
      }
      this.resend = new Resend(apiKey);
    }
    return this.resend;
  }

  /**
   * Send password reset email
   * @param to - Recipient email address
   * @param resetToken - Password reset token
   * @param userName - Name of the user
   */
  static async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    userName: string
  ): Promise<void> {
    try {
      const resend = this.initialize();
      
      // Get the frontend URL from environment variables
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@codepilot.dev',
        to: [to],
        subject: 'Reset Your Password - CC Sporting Events',
        html: this.getPasswordResetTemplate(userName, resetUrl, resetToken),
      });

      if (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
      }

      console.log('Password reset email sent successfully:', data);
    } catch (error) {
      console.error('Error in sendPasswordResetEmail:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new users
   * @param to - Recipient email address
   * @param userName - Name of the user
   */
  static async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    try {
      const resend = this.initialize();
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: [to],
        subject: 'Welcome to CC Sporting Events!',
        html: this.getWelcomeTemplate(userName, frontendUrl),
      });

      if (error) {
        console.error('Error sending welcome email:', error);
        throw new Error('Failed to send welcome email');
      }

      console.log('Welcome email sent successfully:', data);
    } catch (error) {
      console.error('Error in sendWelcomeEmail:', error);
      // Don't throw error for welcome emails - it's not critical
    }
  }

  /**
   * Send password change confirmation email
   * @param to - Recipient email address
   * @param userName - Name of the user
   */
  static async sendPasswordChangedEmail(
    to: string,
    userName: string
  ): Promise<void> {
    try {
      const resend = this.initialize();

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: [to],
        subject: 'Password Changed Successfully - CC Sporting Events',
        html: this.getPasswordChangedTemplate(userName),
      });

      if (error) {
        console.error('Error sending password changed email:', error);
        throw new Error('Failed to send password changed email');
      }

      console.log('Password changed email sent successfully:', data);
    } catch (error) {
      console.error('Error in sendPasswordChangedEmail:', error);
      // Don't throw error for confirmation emails - it's not critical
    }
  }

  /**
   * HTML template for password reset email
   */
  private static getPasswordResetTemplate(
    userName: string,
    resetUrl: string,
    resetToken: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .token-box {
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
      font-family: monospace;
      word-break: break-all;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏃 CC Sporting Events</h1>
    </div>
    
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password for your CC Sporting Events account. If you didn't make this request, you can safely ignore this email.</p>
      
      <p>To reset your password, click the button below:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <div class="token-box">${resetUrl}</div>
      
      <div class="warning">
        <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. For your security, never share this link with anyone.
      </div>
      
      <p>If you're having trouble with the button above, you can also use this reset token directly:</p>
      <div class="token-box">${resetToken}</div>
    </div>
    
    <div class="footer">
      <p>This is an automated email from CC Sporting Events. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} CC Sporting Events. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * HTML template for welcome email
   */
  private static getWelcomeTemplate(
    userName: string,
    frontendUrl: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CC Sporting Events</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏃 Welcome to CC Sporting Events!</h1>
    </div>
    
    <div class="content">
      <h2>Hi ${userName},</h2>
      <p>Thank you for joining CC Sporting Events! We're excited to have you as part of our community.</p>
      
      <p>With CC Sporting Events, you can:</p>
      <ul>
        <li>🏀 Discover local sporting events</li>
        <li>📅 Register for upcoming activities</li>
        <li>👥 Connect with other sports enthusiasts</li>
        <li>⭐ Save your favorite events</li>
        <li>📊 Track your participation history</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${frontendUrl}" class="button">Explore Events</a>
      </div>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CC Sporting Events. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * HTML template for password changed confirmation
   */
  private static getPasswordChangedTemplate(userName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed Successfully</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #16a34a;
      margin: 0;
      font-size: 28px;
    }
    .content {
      margin-bottom: 30px;
    }
    .success-box {
      background-color: #dcfce7;
      border-left: 4px solid #16a34a;
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Password Changed Successfully</h1>
    </div>
    
    <div class="content">
      <h2>Hi ${userName},</h2>
      
      <div class="success-box">
        <strong>✓ Success!</strong> Your password has been changed successfully.
      </div>
      
      <p>This email confirms that your CC Sporting Events account password was recently changed.</p>
      
      <div class="warning">
        <strong>⚠️ Didn't change your password?</strong> If you didn't make this change, please contact our support team immediately to secure your account.
      </div>
      
      <p>For your security, remember to:</p>
      <ul>
        <li>Use a strong, unique password</li>
        <li>Never share your password with anyone</li>
        <li>Enable two-factor authentication if available</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CC Sporting Events. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}


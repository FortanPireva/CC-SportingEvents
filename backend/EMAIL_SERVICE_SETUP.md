# Email Service & Forgot Password Setup Guide

This guide explains how to set up and use the email service with Resend SDK for password reset functionality.

## What Was Implemented

### 1. Email Service (`src/services/email.service.ts`)
- Integration with Resend SDK for sending emails
- Three types of email templates:
  - **Password Reset Email**: Beautiful HTML email with reset link and security warnings
  - **Welcome Email**: Sent to new users (optional)
  - **Password Changed Confirmation**: Sent after successful password reset

### 2. Password Reset Functionality
- **Forgot Password**: Generates secure token, stores in database, sends email
- **Reset Password**: Validates token, updates password, invalidates token
- **Verify Token**: Checks if a reset token is valid without using it

### 3. Database Model (`prisma/schema.prisma`)
New `PasswordResetToken` model added:
- Unique token (hashed for security)
- Expiration time (1 hour)
- Usage tracking (prevents token reuse)
- User relationship

### 4. API Endpoints (`src/routes/auth.routes.ts`)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-reset-token` - Verify token validity

## Setup Instructions

### Step 1: Install Dependencies (Already Done)
The Resend SDK has been installed:
```bash
npm install resend
```

### Step 2: Set Up Environment Variables
Add these variables to your `.env` file:

```env
# Resend API Configuration
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="noreply@yourdomain.com"

# Frontend URL (for password reset links)
FRONTEND_URL="http://localhost:5173"

# Existing variables
JWT_SECRET="your-secret-key"
DATABASE_URL="postgresql://..."
```

### Step 3: Get Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Go to "API Keys" in the dashboard
4. Create a new API key
5. Copy the key and add it to your `.env` file

### Step 4: Configure Email Sender

**For Development (Testing):**
- You can use `onboarding@resend.dev` as the sender
- This works without verification but has limitations

**For Production:**
1. Add your domain in Resend dashboard
2. Verify your domain with DNS records
3. Use your domain email (e.g., `noreply@yourdomain.com`)

### Step 5: Run Database Migration

Generate the Prisma client and run migrations:

```bash
# Generate Prisma client with new model
npx prisma generate

# Create and run migration
npx prisma migrate dev --name add_password_reset_token
```

### Step 6: Test the Functionality

#### Test Forgot Password:
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

#### Test Reset Password:
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token_from_email",
    "newPassword": "newpassword123"
  }'
```

#### Test Verify Token:
```bash
curl -X POST http://localhost:5000/api/auth/verify-reset-token \
  -H "Content-Type: application/json" \
  -d '{"token": "token_from_email"}'
```

## Security Features Implemented

### 1. Token Security
- Tokens are generated using `crypto.randomBytes(32)` for cryptographic randomness
- Tokens are hashed with SHA-256 before storing in database
- Original token is sent via email, hash is stored in database
- Prevents rainbow table attacks

### 2. Token Expiration
- Tokens expire after 1 hour
- Expired tokens are automatically rejected
- Old unused tokens are invalidated when new ones are requested

### 3. Token Reuse Prevention
- Tokens are marked as used after successful password reset
- Used tokens cannot be reused even if not expired

### 4. Email Enumeration Protection
- Same response returned whether email exists or not
- Prevents attackers from discovering valid email addresses

### 5. Rate Limiting (Recommended)
Consider adding rate limiting middleware to prevent abuse:
```typescript
// Example with express-rate-limit
import rateLimit from 'express-rate-limit';

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many password reset requests, please try again later.'
});

router.post('/forgot-password', resetPasswordLimiter, ...);
```

## Email Templates

The email service includes professionally designed HTML templates with:
- Responsive design for mobile and desktop
- Clear call-to-action buttons
- Security warnings and best practices
- Branded with CC Sporting Events theme
- Alternative text for accessibility

## Frontend Integration

### Create Reset Password Page

Create a page at `/reset-password` that:
1. Extracts token from URL query parameter
2. Verifies token validity on page load
3. Shows password reset form if valid
4. Submits new password to API

Example React component:
```tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
      verifyToken(resetToken);
    }
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      setIsValid(data.valid);
    } catch (error) {
      console.error('Error verifying token:', error);
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      
      if (response.ok) {
        alert('Password reset successful!');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  if (loading) return <div>Verifying token...</div>;
  if (!isValid) return <div>Invalid or expired token</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h1>Reset Your Password</h1>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        minLength={6}
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  );
}
```

### Create Forgot Password Form

```tsx
import { useState } from 'react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
    }
  };

  if (submitted) {
    return (
      <div>
        <h2>Check Your Email</h2>
        <p>If an account exists with this email, you will receive a password reset link.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Forgot Password</h1>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Send Reset Link</button>
    </form>
  );
}
```

## Troubleshooting

### Email Not Sending
1. Check if `RESEND_API_KEY` is set correctly in `.env`
2. Verify the API key is valid in Resend dashboard
3. Check console logs for detailed error messages
4. Ensure `EMAIL_FROM` domain is verified (for production)

### Token Invalid or Expired
1. Tokens expire after 1 hour
2. Tokens can only be used once
3. Check if database migration ran successfully
4. Verify token is being passed correctly from email link

### Database Errors
1. Run `npx prisma generate` after schema changes
2. Run `npx prisma migrate dev` to apply migrations
3. Check database connection in `.env`

## Additional Features to Consider

1. **Email Verification**: Verify email addresses during registration
2. **Two-Factor Authentication**: Add 2FA for enhanced security
3. **Account Lockout**: Lock accounts after multiple failed attempts
4. **Password History**: Prevent reuse of recent passwords
5. **Email Preferences**: Let users choose notification settings
6. **Audit Logging**: Log all password reset attempts

## API Response Examples

### Forgot Password - Success
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

### Reset Password - Success
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

### Reset Password - Invalid Token
```json
{
  "success": false,
  "error": "Invalid or expired reset token"
}
```

### Verify Token - Valid
```json
{
  "success": true,
  "valid": true,
  "message": "Token is valid"
}
```

## Files Modified

- ✅ `prisma/schema.prisma` - Added PasswordResetToken model
- ✅ `src/services/email.service.ts` - NEW: Email service with Resend
- ✅ `src/services/auth.service.ts` - Added forgot/reset password methods
- ✅ `src/controllers/auth.controller.ts` - Added forgot/reset password controllers
- ✅ `src/routes/auth.routes.ts` - Added forgot/reset password routes
- ✅ `README.md` - Updated with email service documentation
- ✅ `package.json` - Added resend dependency

## Next Steps

1. ✅ Code implementation - COMPLETE
2. ⏳ Run database migration (`npx prisma migrate dev`)
3. ⏳ Set up Resend account and get API key
4. ⏳ Add environment variables to `.env`
5. ⏳ Test the endpoints
6. ⏳ Implement frontend pages for password reset
7. ⏳ Consider adding rate limiting for production

---

**Need Help?**
- Resend Documentation: https://resend.com/docs
- Prisma Documentation: https://www.prisma.io/docs


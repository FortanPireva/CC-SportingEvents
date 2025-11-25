# CC Sporting Events - Backend

Express.js + TypeScript + Prisma backend for the CC Sporting Events platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the required variables:
  - `DATABASE_URL` - PostgreSQL connection string
  - `JWT_SECRET` - Secret key for JWT tokens (use a strong random string)
  - `RESEND_API_KEY` - API key from [Resend](https://resend.com) for email functionality
  - `EMAIL_FROM` - Your verified sender email address in Resend
  - `FRONTEND_URL` - Your frontend application URL

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run migrations:
```bash
npm run prisma:migrate
```

5. Start development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── repositories/    # Data access layer
├── middlewares/     # Express middlewares
├── routes/          # API routes
├── types/           # TypeScript types
├── utils/           # Helper functions
└── server.ts        # Entry point
```

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "location": "New York",
  "role": "USER" // Optional: USER, ORGANIZER, ADMIN
}
```

#### POST `/api/auth/login`
Login to an existing account.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### POST `/api/auth/forgot-password`
Request a password reset email.

**Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST `/api/auth/reset-password`
Reset password using the token from email.

**Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

#### POST `/api/auth/verify-reset-token`
Verify if a reset token is valid (useful for frontend validation).

**Body:**
```json
{
  "token": "reset_token_from_email"
}
```

## Email Service

The backend uses [Resend](https://resend.com) for sending emails. The following email types are supported:

- **Password Reset Email**: Sent when a user requests a password reset
- **Welcome Email**: Sent when a new user registers (optional)
- **Password Changed Confirmation**: Sent after a successful password reset

To set up email functionality:

1. Sign up for a [Resend account](https://resend.com)
2. Get your API key from the dashboard
3. Add your API key to `.env` as `RESEND_API_KEY`
4. Configure your sender email as `EMAIL_FROM` (must be verified in Resend)


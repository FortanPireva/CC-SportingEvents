# Authentication System Setup Guide

This guide will help you set up and use the authentication system for the CC Sporting Events platform.

## 🎯 Overview

The authentication system has been fully integrated with:
- **Backend**: Express.js + Prisma + PostgreSQL + JWT
- **Frontend**: React + TypeScript

## 📋 Prerequisites

1. PostgreSQL database running
2. Node.js and npm installed
3. Backend and frontend dependencies installed

## 🔧 Backend Setup

### 1. Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/cc_sporting_events?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/cc_sporting_events?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# CORS Configuration (optional)
CORS_ORIGIN="http://localhost:5173"
```

**Important**: Replace `username`, `password`, and database name with your actual PostgreSQL credentials.

### 2. Database Setup

Run Prisma migrations to set up your database schema:

```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

The server should start on `http://localhost:3000`

## 🎨 Frontend Setup

### 1. Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The app should start on `http://localhost:5173`

## 📡 API Endpoints

### Authentication Routes

All authentication routes are prefixed with `/api/auth`

#### 1. Register a New User

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "location": "San Francisco, CA",
  "role": "USER"  // or "ORGANIZER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "location": "San Francisco, CA",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

#### 2. Login

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "location": "San Francisco, CA",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "preferences": null
    },
    "token": "jwt-token-here"
  }
}
```

#### 3. Get Current User

**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "location": "San Francisco, CA",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "preferences": null
    }
  }
}
```

## 🔐 User Roles

The system supports the following user roles:

- **USER**: Regular participants who can join events
- **ORGANIZER**: Can create and manage events (also creates an Organizer record)
- **ADMIN**: Full access (future implementation)
- **GUEST**: Limited access (future implementation)

## 💻 Frontend Usage

### Using the Auth Context

The authentication is managed through the `AuthContext`. Here's how to use it:

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isLoading, signIn, signUp, signOut } = useAuth();

  // Sign in
  const handleSignIn = async () => {
    try {
      await signIn('user@example.com', 'password123');
      // User is now signed in
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  // Sign up
  const handleSignUp = async () => {
    try {
      await signUp('user@example.com', 'password123', 'John Doe', 'user');
      // User is now registered and signed in
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  // Sign out
  const handleSignOut = () => {
    signOut();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <button onClick={handleSignIn}>Sign In</button>
          <button onClick={handleSignUp}>Sign Up</button>
        </div>
      )}
    </div>
  );
}
```

### Making Authenticated API Requests

Use the `api` utility from `@/lib/api` for making authenticated requests:

```tsx
import { api } from '@/lib/api';

// The API client automatically includes the JWT token from localStorage
const response = await api.get('/some-protected-route');
```

## 🧪 Testing the Authentication

### 1. Using the Sign Up Page

1. Navigate to `http://localhost:5173/auth/signup`
2. Fill in the form:
   - Full Name
   - Email
   - Password
   - Confirm Password
   - Select account type (Participant or Organizer)
3. Click "Create Account"
4. You should be redirected to the dashboard

### 2. Using the Sign In Page

1. Navigate to `http://localhost:5173/auth/signin`
2. Enter your email and password
3. Click "Sign In"
4. You should be redirected to the dashboard

### 3. Using cURL or Postman

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "USER"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🔒 Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Tokens**: Secure JSON Web Tokens with 7-day expiration
3. **Protected Routes**: Middleware authentication for protected endpoints
4. **Input Validation**: Express-validator for request validation
5. **CORS Protection**: Configured CORS for frontend-backend communication
6. **Helmet**: Security headers via helmet middleware

## 📁 File Structure

### Backend
```
backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts      # Auth request handlers
│   ├── services/
│   │   └── auth.service.ts         # Auth business logic
│   ├── routes/
│   │   └── auth.routes.ts          # Auth route definitions
│   ├── middlewares/
│   │   └── auth.middleware.ts      # JWT authentication middleware
│   ├── utils/
│   │   └── prisma.ts               # Prisma client instance
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   └── server.ts                   # Express server setup
└── prisma/
    └── schema.prisma               # Database schema
```

### Frontend
```
frontend/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx         # Auth context provider
│   ├── lib/
│   │   ├── api.ts                  # API client utilities
│   │   └── types.ts                # TypeScript type definitions
│   └── pages/
│       └── auth/
│           ├── SignInPage.tsx      # Sign in page
│           ├── SignUpPage.tsx      # Sign up page
│           └── ResetPasswordPage.tsx
```

## ⚠️ Important Notes

1. **JWT Secret**: Change the `JWT_SECRET` in production to a strong, random string
2. **Password Requirements**: Minimum 6 characters (enforced in both frontend and backend)
3. **Token Storage**: JWT tokens are stored in `localStorage` as `cc_auth_token`
4. **User Data**: User data is cached in `localStorage` as `cc_user` for quick access
5. **Organizer Creation**: When a user registers with role "ORGANIZER", an Organizer record is automatically created

## 🐛 Troubleshooting

### Database Connection Issues
- Verify your PostgreSQL server is running
- Check `DATABASE_URL` in `.env` has correct credentials
- Ensure the database exists

### CORS Errors
- Verify `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Check that the frontend is making requests to the correct backend URL

### Token Issues
- Clear browser localStorage if experiencing authentication issues
- Check that JWT_SECRET is set in backend `.env`
- Verify token is being sent in Authorization header

### Registration Fails
- Check that email is unique (not already registered)
- Verify all required fields are provided
- Check backend logs for detailed error messages

## 🚀 Next Steps

1. Implement password reset functionality
2. Add email verification
3. Implement refresh tokens
4. Add OAuth providers (Google, Facebook, etc.)
5. Add rate limiting for security
6. Implement account activation via email

## 📞 Support

For issues or questions, please check the backend and frontend logs for detailed error messages.


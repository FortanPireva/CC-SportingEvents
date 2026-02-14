# CC Sporting Events - Community Connect

A full-stack web application for organizing and participating in local sporting events. Built with Express.js, React, TypeScript, and PostgreSQL.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-green.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-316192.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

## 📋 Project Overview

**CC Sporting Events** is a platform that connects sports enthusiasts in their communities, making it easy to organize, discover, and participate in local sporting events.

### Quick Feature Summary

| Feature Category | Capabilities |
|-----------------|-------------|
| **User Roles** | USER, ORGANIZER, ADMIN, GUEST |
| **Sport Types** | 19 different sports (Football, Basketball, Tennis, Yoga, etc.) |
| **Event Management** | Create, Update, Cancel, Join, Leave, Feedback |
| **Community** | Posts, Comments, Likes, Trending Topics |
| **Analytics** | Dashboard for Users & Organizers with statistics |
| **Authentication** | JWT + OTP-based password reset |
| **Database** | 14 models with relations and constraints |
| **API Endpoints** | 40+ RESTful endpoints |
| **UI Components** | 40+ accessible components (shadcn/ui) |

## 🏗️ Architecture

This is a monorepo containing:

- **Backend**: Express.js + TypeScript + Prisma ORM + PostgreSQL
- **Frontend**: React + Vite + TypeScript + TailwindCSS

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  Pages          Components         Hooks         Services        │
│  ├─ Auth        ├─ Dashboard      ├─ useEvents   ├─ event       │
│  ├─ Dashboard   ├─ UI Library     ├─ useAnalytics├─ community   │
│  └─ Landing     └─ Layout         └─ use-toast   └─ api         │
│                                                                   │
│  State Management: AuthContext + Zustand + TanStack Query        │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST (JSON)
                         │ JWT Authentication
┌────────────────────────▼────────────────────────────────────────┐
│                      BACKEND (Express.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Routes ─┬─ /api/auth       ─┐                                  │
│          ├─ /api/events      ─┤                                 │
│          ├─ /api/community   ─┼─► Middleware (JWT Auth)         │
│          └─ /api/analytics   ─┘                                 │
│                                │                                 │
│  Controllers ──────────────────┼─► Validation & Error Handling  │
│  ├─ auth.controller            │                                │
│  ├─ event.controller           │                                │
│  ├─ community.controller       │                                │
│  └─ analytics.controller       │                                │
│                                │                                 │
│  Services ─────────────────────┼─► Business Logic               │
│  ├─ auth.service (JWT/BCrypt)  │                                │
│  ├─ event.service              │                                │
│  ├─ community.service          │                                │
│  ├─ analytics.service          │                                │
│  └─ email.service (OTP)        │                                │
│                                │                                 │
│  Repositories ─────────────────┼─► Data Access Layer            │
│  └─ community.repository       │                                │
└────────────────────────┬───────┴─────────────────────────────────┘
                         │ Prisma ORM
┌────────────────────────▼────────────────────────────────────────┐
│                     DATABASE (PostgreSQL)                        │
├─────────────────────────────────────────────────────────────────┤
│  Tables:                                                         │
│  ├─ User, Organizer, Event, Participation                       │
│  ├─ CommunityPost, PostComment, PostLike, CommentLike           │
│  ├─ Feedback, Notification                                      │
│  └─ PasswordResetToken                                          │
│                                                                  │
│  Features: Relations, Indexes, Cascading Deletes, Constraints   │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Architecture (Layered MVC Pattern)

The backend follows a clean layered architecture for separation of concerns:

#### 1. Controllers Layer (`src/controllers/`)
- **auth.controller.ts** - Authentication and user management (register, login, profile updates, password reset)
- **event.controller.ts** - Event CRUD, participation, feedback, statistics
- **community.controller.ts** - Community posts, comments, likes
- **analytics.controller.ts** - Dashboard analytics for users and organizers
- Handles HTTP requests/responses
- Input validation using middleware
- Error handling and status codes

#### 2. Services Layer (`src/services/`)
- **auth.service.ts** - Business logic for authentication, JWT generation, password hashing
- **event.service.ts** - Event management, participation logic, statistics calculation
- **community.service.ts** - Post/comment management, like system, trending topics
- **analytics.service.ts** - Data aggregation and analytics computation
- **email.service.ts** - Email notifications and OTP delivery
- Pure business logic (no HTTP concerns)
- Data transformation and validation
- Complex calculations and aggregations

#### 3. Repositories Layer (`src/repositories/`)
- **community.repository.ts** - Direct database queries for community features
- Data access abstraction
- Prisma ORM queries
- Query optimization

#### 4. Middleware (`src/middlewares/`)
- **auth.middleware.ts** - JWT verification, role-based authorization
- Request authentication
- User context injection
- Protected route handling

#### 5. Routes (`src/routes/`)
- **auth.routes.ts** - `/api/auth/*` endpoints
- **event.routes.ts** - `/api/events/*` endpoints  
- **community.routes.ts** - `/api/community/*` endpoints
- **analytics.routes.ts** - `/api/analytics/*` endpoints
- Route definitions and HTTP method mapping
- Middleware attachment
- Request validation chains

#### 6. Types (`src/types/`)
- **index.ts** - Shared TypeScript interfaces and types
- Type safety across the application
- Request/response interfaces

#### 7. Utilities (`src/utils/`)
- **prisma.ts** - Prisma client singleton
- Shared helper functions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cc-sporting-events
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Set up environment variables:

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cc_sporting_events"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=development
```

**Frontend** (`frontend/.env.local`):
```env
VITE_API_URL=http://localhost:3000/api
```

4. Set up the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start development servers:
```bash
npm run dev
```

This will start:
- Backend API at http://localhost:3000
- Frontend at http://localhost:5173

### Environment Configuration

#### Backend Environment Variables

Required variables in `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cc_sporting_events"
DIRECT_URL="postgresql://user:password@localhost:5432/cc_sporting_events"  # For Prisma migrations

# Authentication
JWT_SECRET="your-secure-random-secret-key"

# Server
PORT=3000
NODE_ENV=development

# Email (for OTP password reset)
EMAIL_SERVICE="your-email-service"  # e.g., Gmail, SendGrid
EMAIL_USER="your-email@example.com"
EMAIL_PASSWORD="your-email-password"
```

#### Frontend Environment Variables

Required variables in `frontend/.env.local`:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Optional: File Storage (if using Supabase for images)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📁 Project Structure

```
cc-sporting-events/
├── backend/                          # Express.js backend
│   ├── src/
│   │   ├── controllers/             # Request handlers
│   │   │   ├── analytics.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── community.controller.ts
│   │   │   └── event.controller.ts
│   │   ├── services/                # Business logic
│   │   │   ├── analytics.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── community.service.ts
│   │   │   ├── email.service.ts
│   │   │   └── event.service.ts
│   │   ├── repositories/            # Data access layer
│   │   │   └── community.repository.ts
│   │   ├── middlewares/             # Express middlewares
│   │   │   └── auth.middleware.ts
│   │   ├── routes/                  # API routes
│   │   │   ├── analytics.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── community.routes.ts
│   │   │   └── event.routes.ts
│   │   ├── types/                   # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/                   # Utilities
│   │   │   └── prisma.ts
│   │   └── server.ts                # Entry point
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── migrations/              # Database migrations
│   ├── .env                         # Environment variables
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                        # React frontend
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ui/                 # shadcn/ui components
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── form.tsx
│   │   │       ├── input.tsx
│   │   │       ├── table.tsx
│   │   │       └── ... (40+ components)
│   │   ├── pages/                  # Page components
│   │   │   ├── auth/
│   │   │   │   ├── SignInPage.tsx
│   │   │   │   ├── SignUpPage.tsx
│   │   │   │   ├── ResetPasswordPage.tsx
│   │   │   │   └── SetNewPasswordPage.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── EventsPage.tsx
│   │   │   │   ├── MyEventsPage.tsx
│   │   │   │   ├── CreateEventPage.tsx
│   │   │   │   ├── ParticipantsPage.tsx
│   │   │   │   ├── CommunityPage.tsx
│   │   │   │   ├── ReviewsPage.tsx
│   │   │   │   └── SettingsPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   └── LandingPage.tsx
│   │   ├── services/               # API services
│   │   │   ├── api.service.ts
│   │   │   ├── community.service.ts
│   │   │   ├── event.service.ts
│   │   │   └── storage.service.ts
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── use-toast.ts
│   │   │   ├── useAnalytics.ts
│   │   │   └── useEvents.ts
│   │   ├── contexts/               # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── stores/                 # Zustand stores
│   │   │   └── auth.store.ts
│   │   ├── lib/                    # Utility libraries
│   │   │   ├── api.ts
│   │   │   ├── types.ts
│   │   │   ├── utils.ts
│   │   │   └── supabase.ts
│   │   ├── App.tsx                 # Main app component
│   │   ├── main.tsx                # React entry point
│   │   └── index.css               # Global styles
│   ├── public/
│   ├── .env.local                  # Environment variables
│   ├── components.json             # shadcn/ui config
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── package.json                    # Root package.json with scripts
└── README.md                       # This file
```

## 🛠️ Available Scripts

### Root Level

- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start only the backend
- `npm run dev:frontend` - Start only the frontend
- `npm run build` - Build both backend and frontend
- `npm run install:all` - Install all dependencies
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Backend

```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
```

### Frontend

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. The database schema includes:

### Core User & Event Models

#### User
- **Fields**: `id`, `name`, `email`, `password`, `avatar`, `location`, `role`, `preferences`, `createdAt`, `updatedAt`
- **Roles**: `USER`, `ORGANIZER`, `ADMIN`, `GUEST`
- **Relations**: organizer profile, participations, notifications, bookmarks, feedback, posts, comments, likes

#### Organizer
- **Fields**: `id`, `userId`, `contactInfo`, `createdAt`, `updatedAt`
- **Relations**: One-to-one with User, one-to-many with Events

#### Event
- **Fields**: `id`, `name`, `description`, `date`, `time`, `location`, `latitude`, `longitude`, `sportType`, `maxParticipants`, `isSponsored`, `sponsorDetails`, `imageUrl`, `status`, `organizerId`, `createdAt`, `updatedAt`
- **Sport Types**: FOOTBALL, BASKETBALL, VOLLEYBALL, TENNIS, RUNNING, CYCLING, SOCCER, SWIMMING, YOGA, PILATES, BOXING, MARTIAL_ARTS, GOLF, BADMINTON, TABLE_TENNIS, CRICKET, RUGBY, HOCKEY, BASEBALL
- **Relations**: organizer, participations, notifications, bookmarks, feedback, teams

### Participation & Teams

#### Participation
- **Fields**: `id`, `status`, `userId`, `eventId`, `teamId`, `registeredAt`, `updatedAt`
- **Status**: `REGISTERED`
- **Relations**: user, event, team (optional)

#### Team
- **Fields**: `id`, `name`, `eventId`, `createdAt`
- **Relations**: event, participants

### Engagement Models

#### Notification
- **Fields**: `id`, `message`, `type`, `isRead`, `userId`, `eventId`, `createdAt`
- **Types**: event_reminder, event_cancelled, event_updated, etc.

#### EventBookmark
- **Fields**: `id`, `userId`, `eventId`, `createdAt`
- **Purpose**: Save favorite events for later

#### Feedback
- **Fields**: `id`, `rating`, `comment`, `userId`, `eventId`, `createdAt`, `updatedAt`
- **Rating Scale**: 1-10

### Community Features

#### CommunityPost
- **Fields**: `id`, `content`, `type`, `authorId`, `likes`, `tags`, `imageUrl`, `createdAt`, `updatedAt`
- **Types**: `DISCUSSION`, `ACHIEVEMENT`, `QUESTION`, `EVENT_SHARE`
- **Relations**: author, comments, post likes

#### PostComment
- **Fields**: `id`, `content`, `authorId`, `postId`, `likes`, `createdAt`, `updatedAt`
- **Relations**: author, post, comment likes

#### PostLike & CommentLike
- **Purpose**: Track user engagement with posts and comments
- **Prevents**: Duplicate likes per user per post/comment

### Authentication & Security

#### PasswordResetToken
- **Fields**: `id`, `otpCode`, `userId`, `expiresAt`, `isUsed`, `createdAt`
- **Purpose**: OTP-based password reset flow

See `backend/prisma/schema.prisma` for the complete schema with all indexes and constraints.

## 🎯 Key Features

### Event Management
- Create, update, and cancel sporting events
- Support for 19 different sport types
- Geolocation with latitude/longitude
- Event status tracking (active, cancelled, completed)
- Sponsored event support
- Image upload integration

### User Management
- Secure JWT-based authentication
- Role-based access control (USER, ORGANIZER, ADMIN, GUEST)
- OTP-based password reset via email
- Profile management with avatar support
- User preferences and location

### Event Discovery & Participation
- Search and filter events by sport, location, date, and status
- Join/leave events with automatic participant counting
- View participating events with pagination
- Check participation status across multiple events
- Event capacity management

### Community Features
- Create and manage community posts (discussions, achievements, questions, event shares)
- Comment on posts with threaded discussions
- Like/unlike posts and comments
- Tag-based content organization
- Trending topics and active member tracking
- Community statistics dashboard

### Analytics & Insights
- **For Organizers**: Events created, total participants, average rating, participant tracking
- **For Users**: Events joined, hours active, sports tried, participation history
- Recent activity feed
- Event-specific statistics (participants, feedback, ratings)

### Feedback System
- Rate events on a 1-10 scale
- Written feedback/reviews
- Average rating calculation per event
- Feedback history tracking

### Additional Features
- Team Formation: Create and join teams for events
- Bookmarking: Save favorite events for later
- Notifications: Event reminders and updates
- Organizer dashboard with participant management

## 🔌 Backend API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login with email/password
- `GET /me` - Get current authenticated user
- `POST /forgot-password` - Request password reset OTP
- `POST /verify-otp` - Verify OTP code
- `POST /reset-password` - Reset password with OTP
- `PUT /profile` - Update user profile (name, avatar)

### Events (`/api/events`)
- `GET /` - Get all events with filters (sportType, location, date, status)
- `GET /:id` - Get event by ID
- `POST /` - Create new event (Organizers only)
- `PUT /:id` - Update event (Organizer only)
- `DELETE /:id` - Delete event permanently (Organizer only)
- `POST /:id/join` - Join event as participant
- `POST /:id/leave` - Leave event (cancel participation)
- `POST /:id/cancel` - Cancel event (soft delete)
- `GET /my-events` - Get organizer's events
- `GET /participating` - Get user's participating events
- `GET /my-participants` - Get all participants for organizer's events
- `GET /my-statistics` - Get organizer statistics summary
- `GET /my-events-summary` - Get organizer events with participant summary
- `POST /participation-status` - Check participation status for multiple events
- `GET /my-feedback-events` - Get events user can provide feedback for
- `GET /:id/statistics` - Get event statistics (Organizer only)
- `POST /:id/feedback` - Submit event feedback (rating 1-10)
- `GET /:id/feedback` - Get user's feedback for event

### Community (`/api/community`)
- `POST /posts` - Create new community post
- `GET /posts` - Get all posts with filters (type, search, sortBy)
- `GET /posts/:id` - Get specific post by ID
- `PUT /posts/:id` - Update post (Author only)
- `DELETE /posts/:id` - Delete post (Author or Admin)
- `POST /comments` - Create comment on post
- `GET /posts/:postId/comments` - Get all comments for post
- `DELETE /comments/:id` - Delete comment (Author or Admin)
- `POST /posts/:postId/like` - Toggle like on post
- `POST /comments/:commentId/like` - Toggle like on comment
- `GET /stats` - Get community statistics
- `GET /members/active` - Get active community members
- `GET /topics/trending` - Get trending topics

### Analytics (`/api/analytics`)
- `GET /dashboard` - Get dashboard analytics (auto-detects user type)
- `GET /organizer` - Get organizer-specific analytics
- `GET /user` - Get user-specific analytics

### Health Check
- `GET /health` - API health status

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication with role verification
- **Password Security**: Bcrypt hashing with salt rounds
- **Role-Based Authorization**: ORGANIZER, USER, ADMIN, GUEST roles with middleware
- **OTP System**: 6-digit OTP codes for password reset with expiration
- **CORS Protection**: Cross-Origin Resource Sharing configured
- **Helmet.js**: Security headers for Express
- **Input Validation**: Request validation middleware for all endpoints
- **Cascading Deletes**: Proper data cleanup on user/event deletion
- **Unique Constraints**: Email uniqueness, one feedback per user per event
- **Database Indexes**: Optimized queries for email, event filters, and relations

## ⚛️ Frontend Architecture

### Pages & Routes

#### Authentication Pages (`/auth`)
- **SignInPage** - User login with email/password
- **SignUpPage** - New user registration with role selection
- **ResetPasswordPage** - Request password reset OTP
- **SetNewPasswordPage** - Set new password with OTP verification

#### Dashboard Pages (`/dashboard`)
- **DashboardPage** - Main dashboard with analytics, upcoming events, and activity feed
- **EventsPage** - Browse and search all available events
- **MyEventsPage** - View and manage organizer's created events
- **CreateEventPage** - Create new sporting event
- **ParticipantsPage** - View and manage event participants (Organizers)
- **CommunityPage** - Community posts, discussions, and interactions
- **ReviewsPage** - Event feedback and reviews
- **SettingsPage** - User profile and preferences

#### Landing Page (`/`)
- **LandingPage** - Public homepage with app overview

### State Management

#### AuthContext
- User authentication state
- Sign in/up/out functionality
- Password reset flow (OTP-based)
- Profile updates
- Role-based access control

#### Zustand Stores
- **auth.store.ts** - Persistent authentication state

### Custom Hooks

#### useAnalytics
- Fetch dashboard analytics based on user role
- Returns organizer stats (events created, participants, ratings) or user stats (events joined, hours active, sports tried)
- Automatic refetching and error handling

#### useEvents
- Fetch events with filters (sport, location, date)
- Create, update, delete events
- Join/leave events
- Manage participations
- Submit and view feedback
- TanStack Query integration for caching and optimistic updates

### Services Layer

#### event.service.ts
- Complete event CRUD operations
- Participation management (join/leave)
- Event statistics and analytics
- Feedback submission and retrieval
- Organizer-specific operations (my events, participants)

#### community.service.ts
- Post creation and management (DISCUSSION, ACHIEVEMENT, QUESTION, EVENT_SHARE)
- Comment operations
- Like/unlike functionality
- Community statistics
- Active members and trending topics

#### api.service.ts
- Centralized API client with Axios
- JWT token management
- Request/response interceptors
- Error handling

#### storage.service.ts
- Local storage utilities
- File upload integration

### UI Components

#### Custom UI Library (shadcn/ui)
Complete set of accessible components including:
- Forms (input, textarea, select, checkbox, radio)
- Feedback (alert, toast, dialog, sheet)
- Navigation (tabs, pagination, breadcrumb, menu)
- Data Display (table, card, badge, avatar)
- Layout (accordion, carousel, collapsible, resizable)
- Charts and visualizations

#### Layout Components
- **DashboardLayout** - Main dashboard shell with navigation and sidebar

### Styling & Design
- **TailwindCSS** - Utility-first CSS framework
- **Custom Theme** - Configured color palette and design tokens
- **Responsive Design** - Mobile-first approach
- **Dark Mode Ready** - Theme system support

## 📚 Tech Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database toolkit with migrations
- **PostgreSQL** - Relational database
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment configuration

### Frontend
- **React 18** - UI library with hooks
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type safety and intellisense
- **TailwindCSS** - Utility-first styling
- **React Router v6** - Client-side routing
- **TanStack Query (React Query)** - Server state management, caching, and synchronization
- **Zustand** - Lightweight state management
- **Axios** - HTTP client with interceptors
- **shadcn/ui** - Accessible component library
- **Sonner** - Toast notifications
- **date-fns** - Date manipulation

### Development Tools
- **Prisma Studio** - Database GUI
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Auto-reload for backend
- **Hot Module Replacement** - Fast refresh for frontend

## 🔄 Data Flow & Integration

### Request Flow (Frontend → Backend → Database)

1. **User Action** → React component triggers event (e.g., create event button)
2. **Service Layer** → Frontend service function called (e.g., `eventService.createEvent()`)
3. **API Client** → Axios makes HTTP request with JWT token in headers
4. **Route Handler** → Express route receives request at `/api/events`
5. **Middleware** → Auth middleware verifies JWT and injects user context
6. **Controller** → Validates request body and extracts parameters
7. **Service** → Business logic executed, data transformed
8. **Repository/Prisma** → Database queries executed
9. **Response** → Data flows back through service → controller → route → API client
10. **State Update** → TanStack Query updates cache, React re-renders with new data

### Authentication Flow

1. **Sign Up/Login**: User submits credentials → Backend validates → JWT generated → Token stored in localStorage
2. **Protected Routes**: All requests include JWT in Authorization header → Middleware verifies → User context added to request
3. **Password Reset**: Request OTP → Email sent → Verify OTP → Token validated → New password set

### Real-time Features

- **Optimistic Updates**: TanStack Query provides instant UI feedback before server confirmation
- **Cache Invalidation**: Automatic refetch on mutations (create/update/delete)
- **Pagination**: Server-side pagination for events, participants, and posts
- **Filtering**: Dynamic query parameters for search and filtering

### Type Safety

- **Shared Types**: Common interfaces defined in both backend and frontend
- **Prisma Generated Types**: Database models automatically typed
- **API Response Types**: Consistent `ApiResponse<T>` wrapper for all endpoints
- **Form Validation**: Type-safe validation in controllers using express-validator

## 🔍 Key Implementation Details

### Event Management System

- **Creation**: Organizers create events with sport type, location, date/time, and capacity
- **Participation**: Users register for events with automatic participant counting
- **Capacity Control**: System prevents over-registration based on `maxParticipants`
- **Status Management**: Events can be active, cancelled, or completed
- **Geolocation**: Optional latitude/longitude for map integration

### Community Engagement

- **Post Types**: Support for discussions, achievements, questions, and event shares
- **Tagging System**: Multi-tag support for content organization
- **Like System**: Prevents duplicate likes using unique constraints
- **Trending Algorithm**: Calculates trending topics based on post frequency
- **Active Members**: Ranks users by participation (posts + comments)

### Analytics Engine

- **Role Detection**: Automatically detects if user is organizer or regular user
- **Organizer Metrics**: Events created, total participants, average rating, trends
- **User Metrics**: Events joined, activity hours, sports variety, spending
- **Time-based Trends**: Compares current period to previous period (weekly/monthly)
- **Activity Feed**: Recent actions sorted by timestamp

### Feedback System

- **Rating Scale**: 1-10 scale for granular feedback
- **One Per User**: Unique constraint ensures one feedback per user per event
- **Participant Only**: Only registered participants can submit feedback
- **Average Calculation**: Real-time average rating computed from all feedback
- **Review Management**: Users can view and update their past reviews

## 🚢 Deployment

### Backend Deployment

1. **Build the application**:
```bash
cd backend
npm run build
```

2. **Set production environment variables** with secure credentials

3. **Run migrations**:
```bash
npm run prisma:migrate
```

4. **Start the production server**:
```bash
npm start
```

**Recommended Platforms**: Railway, Render, Heroku, AWS, DigitalOcean

### Frontend Deployment

1. **Build the application**:
```bash
cd frontend
npm run build
```

2. **Deploy the `dist` folder** to your hosting provider

**Recommended Platforms**: Vercel, Netlify, Cloudflare Pages, AWS Amplify

### Database

- Use a managed PostgreSQL service (e.g., Railway, Supabase, AWS RDS)
- Set up automated backups
- Use connection pooling for production (e.g., PgBouncer)

### Production Checklist

- [ ] Set strong JWT_SECRET (minimum 32 characters)
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure email service for OTP delivery
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Enable logging
- [ ] Set NODE_ENV=production

## 🔧 Troubleshooting

### Common Issues

**Database Connection Error**
```
Error: P1001: Can't reach database server
```
- Check if PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure database exists (`createdb cc_sporting_events`)

**Prisma Client Not Generated**
```
Error: @prisma/client did not initialize yet
```
- Run `npm run prisma:generate`
- Restart your development server

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
- Change PORT in `backend/.env`
- Or kill the process using the port

**CORS Errors in Frontend**
```
Access to XMLHttpRequest has been blocked by CORS policy
```
- Verify VITE_API_URL in `frontend/.env.local`
- Check CORS configuration in `backend/src/server.ts`

**JWT Token Invalid**
```
Error: Invalid token
```
- Clear localStorage and sign in again
- Check JWT_SECRET matches between sessions
- Token may have expired (default expiration applies)

## 🧪 Testing

### API Testing

Use tools like Postman or Thunder Client to test endpoints:

1. **Authentication**: Get JWT token from `/api/auth/login`
2. **Protected Routes**: Add token to Authorization header: `Bearer <your-token>`
3. **Test Files**: API collection available in `postman/` directory (if exists)

### Database Inspection

```bash
npm run prisma:studio
```

Opens Prisma Studio at `http://localhost:5555` for visual database inspection.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain consistent formatting (Prettier)
- Follow the established project structure

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support, please open an issue in the repository.

---

Built with ❤️ for the sporting community

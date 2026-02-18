# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CC Sporting Events is a full-stack monorepo for organizing local sporting events. It uses Express.js/TypeScript/Prisma for the backend and React/Vite/TypeScript for the frontend, with PostgreSQL as the database.

## Common Commands

### Development
```bash
npm run dev              # Start both backend (port 3000) and frontend (port 5173)
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend
```

### Database
```bash
npm run prisma:generate  # Generate Prisma client after schema changes
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio GUI at localhost:5555
```

### Build
```bash
npm run build            # Build both backend and frontend
npm run build:backend    # Build only backend (outputs to backend/dist/)
npm run build:frontend   # Build only frontend (outputs to frontend/dist/)
```

### Frontend-specific
```bash
cd frontend && npm run lint  # Run ESLint on frontend code
```

## Architecture

### Backend (Layered MVC)

The backend follows a strict layered architecture:

```
backend/src/
├── routes/          # Route definitions → attach to controllers
├── controllers/     # HTTP handling, validation, request/response
├── services/        # Business logic (no HTTP concerns)
├── repositories/    # Data access layer (Prisma queries)
├── middlewares/     # JWT auth verification, role-based access
├── types/           # Shared TypeScript interfaces
└── utils/prisma.ts  # Prisma client singleton
```

**Data flow**: Route → Middleware (auth) → Controller → Service → Repository/Prisma → Database

**Key files**:
- `server.ts` - Express app entry point
- `auth.middleware.ts` - JWT verification, injects user context into requests
- `utils/prisma.ts` - Import this for database access

### Frontend (React with TanStack Query)

```
frontend/src/
├── pages/           # Route components (auth/, dashboard/)
├── components/      # Reusable components (DashboardLayout, ui/)
├── services/        # API service functions (Axios-based)
├── hooks/           # Custom hooks (useEvents, useAnalytics)
├── contexts/        # AuthContext for auth state
├── stores/          # Zustand stores
└── lib/             # Utilities (api.ts, types.ts)
```

**State management**:
- AuthContext - authentication state
- TanStack Query - server state, caching, optimistic updates
- Zustand - persistent auth store

**UI Components**: Uses shadcn/ui (components in `components/ui/`)

### Database Schema (Prisma)

Key models in `backend/prisma/schema.prisma`:
- **User** - roles: USER, ORGANIZER, ADMIN, GUEST
- **Organizer** - 1:1 with User, owns Events
- **Event** - 19 SportTypes, has status (active/cancelled/completed)
- **Participation** - join table: User ↔ Event (unique per user/event)
- **CommunityPost** - types: DISCUSSION, ACHIEVEMENT, QUESTION, EVENT_SHARE
- **PostComment**, **PostLike**, **CommentLike** - engagement tracking
- **Feedback** - rating 1-10, one per user per event

## API Endpoints

- `/api/auth/*` - Register, login, password reset (OTP-based)
- `/api/events/*` - CRUD, join/leave, feedback, organizer stats
- `/api/community/*` - Posts, comments, likes, trending topics
- `/api/analytics/*` - Dashboard data (auto-detects user type)

## Environment Variables

**Backend** (`backend/.env`):
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct connection for migrations
- `JWT_SECRET` - JWT signing key
- `RESEND_API_KEY` - Email service API key
- `EMAIL_FROM` - Verified sender email
- `FRONTEND_URL` - Frontend URL for email links

**Frontend** (`frontend/.env.local`):
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000/api)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` - Optional for image storage

## Key Patterns

- Controllers validate input with express-validator
- Services return data objects, controllers handle HTTP responses
- All API responses use consistent `{ success, data, error }` structure
- Protected routes require JWT in Authorization header: `Bearer <token>`
- Role checks use middleware: `isOrganizer`, `isAdmin`
- TanStack Query invalidates cache after mutations for automatic refetch

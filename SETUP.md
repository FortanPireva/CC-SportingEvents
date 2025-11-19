# Setup Guide - CC Sporting Events

Complete guide to set up and run the CC Sporting Events application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **npm** (comes with Node.js)

## Step 1: Clone and Install

1. Navigate to your project directory (you're already here!):
```bash
cd demo_project
```

2. Install root dependencies:
```bash
npm install
```

3. Install all project dependencies (backend + frontend):
```bash
npm run install:all
```

## Step 2: Database Setup

### Option A: Using PostgreSQL Locally

1. Start PostgreSQL service

2. Create a new database:
```sql
CREATE DATABASE cc_sporting_events;
```

3. Create a database user (optional but recommended):
```sql
CREATE USER cc_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cc_sporting_events TO cc_user;
```

### Option B: Using Cloud PostgreSQL

Use services like:
- [Supabase](https://supabase.com/) (Free tier available)
- [Railway](https://railway.app/)
- [Neon](https://neon.tech/)

Get your connection string from the provider.

## Step 3: Environment Configuration

### Backend Environment Variables

Create `backend/.env` file (if not exists) with:

```env
DATABASE_URL="postgresql://cc_user:your_password@localhost:5432/cc_sporting_events"
JWT_SECRET="change-this-to-a-random-secure-string-in-production"
PORT=3000
NODE_ENV=development
```

**Important**: 
- Replace `cc_user` and `your_password` with your actual credentials
- Generate a strong JWT_SECRET for production (e.g., using `openssl rand -base64 32`)

### Frontend Environment Variables

Create `frontend/.env.local` file:

```env
VITE_API_URL=http://localhost:3000/api
```

## Step 4: Database Migration

1. Generate Prisma Client:
```bash
npm run prisma:generate
```

2. Run database migrations:
```bash
npm run prisma:migrate
```

When prompted for a migration name, you can use: `init`

## Step 5: Start Development Servers

### Option A: Start Both (Recommended)

```bash
npm run dev
```

This will start:
- Backend API: http://localhost:3000
- Frontend: http://localhost:5173

### Option B: Start Individually

Terminal 1 - Backend:
```bash
npm run dev:backend
```

Terminal 2 - Frontend:
```bash
npm run dev:frontend
```

## Step 6: Verify Installation

1. **Backend Health Check**:
   - Open browser: http://localhost:3000/health
   - Should see: `{"status":"ok","message":"CC Sporting Events API is running"}`

2. **Frontend**:
   - Open browser: http://localhost:5173
   - Should see the Todo App (preserved from your original design)

3. **Database**:
   ```bash
   npm run prisma:studio
   ```
   - Opens Prisma Studio at http://localhost:5555
   - You can view and edit your database visually

## Common Issues and Solutions

### Issue: "Can't reach database server"

**Solution**: 
- Ensure PostgreSQL is running
- Check your DATABASE_URL in `backend/.env`
- Test connection: `psql -U cc_user -d cc_sporting_events`

### Issue: "Port 3000 already in use"

**Solution**:
- Change PORT in `backend/.env`
- Update VITE_API_URL in `frontend/.env.local` accordingly

### Issue: "Module not found"

**Solution**:
```bash
# Clean install
rm -rf node_modules backend/node_modules frontend/node_modules
rm package-lock.json backend/package-lock.json frontend/package-lock.json
npm run install:all
```

### Issue: Prisma Client errors

**Solution**:
```bash
npm run prisma:generate
```

## Next Steps

### 1. Explore the Codebase

- **Backend**: `backend/src/` - API server code
- **Frontend**: `frontend/src/` - React application
- **Database Schema**: `backend/prisma/schema.prisma`

### 2. Development Workflow

1. Make changes to your code
2. Backend auto-reloads on save (ts-node-dev)
3. Frontend hot-reloads on save (Vite HMR)

### 3. Add New Features

Follow the technical plan in `plan.md` to implement:
- Authentication system
- Event CRUD operations
- User registration
- Participation system
- And more!

### 4. Database Management

View/edit data:
```bash
npm run prisma:studio
```

Create new migration after schema changes:
```bash
npm run prisma:migrate
```

## Useful Commands

### Development
```bash
npm run dev              # Start both servers
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
```

### Database
```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open database GUI
```

### Building for Production
```bash
npm run build            # Build both
npm run build:backend    # Backend only
npm run build:frontend   # Frontend only
```

## Project Structure

```
demo_project/
├── backend/              # Express.js API
│   ├── prisma/          # Database schema & migrations
│   ├── src/             # Source code
│   │   ├── controllers/ # Route handlers
│   │   ├── services/    # Business logic
│   │   ├── repositories/# Database operations
│   │   ├── middlewares/ # Express middleware
│   │   ├── routes/      # API routes
│   │   ├── types/       # TypeScript types
│   │   └── server.ts    # Entry point
│   └── package.json
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── hooks/       # Custom hooks
│   │   ├── stores/      # State management
│   │   └── App.tsx      # Main component
│   ├── public/          # Static assets
│   └── package.json
├── plan.md              # Technical implementation plan
├── SETUP.md             # This file
└── package.json         # Root package.json
```

## Support

If you encounter any issues:

1. Check this setup guide
2. Review the error messages carefully
3. Check the `plan.md` for technical details
4. Search for similar issues online

## What's Preserved

Your original Next.js Todo app has been successfully ported to the new React+Vite structure:
- Same design and styling
- Same functionality
- Now accessible at http://localhost:5173/

---

Happy coding! 🚀


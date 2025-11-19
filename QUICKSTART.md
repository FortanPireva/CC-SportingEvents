# 🚀 Quick Start Guide

Get your CC Sporting Events app running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] Terminal/Command Prompt open

## Step 1: Install Dependencies (2 min)

```bash
npm run install:all
```

This installs dependencies for root, backend, and frontend.

## Step 2: Configure Environment (1 min)

### Create Backend Environment File

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cc_sporting_events"
JWT_SECRET="my-secret-key-change-later"
PORT=3000
NODE_ENV=development
```

**Note**: Update `postgres:password` with your PostgreSQL credentials.

### Create Frontend Environment File

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Step 3: Set Up Database (1 min)

Create the database in PostgreSQL:

```sql
CREATE DATABASE cc_sporting_events;
```

Then run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, type: `init`

## Step 4: Start Development (30 sec)

```bash
npm run dev
```

## Step 5: Verify Everything Works

Open these URLs:

1. **Frontend (Todo App)**: http://localhost:5173
   - Should see your original Todo app

2. **Backend Health Check**: http://localhost:3000/health
   - Should see: `{"status":"ok",...}`

3. **Database GUI** (optional):
   ```bash
   npm run prisma:studio
   ```
   Opens at http://localhost:5555

## ✅ Success!

If all URLs work, you're ready to develop!

## What's Running?

- **Backend API**: http://localhost:3000
- **Frontend App**: http://localhost:5173
- **Database**: PostgreSQL (cc_sporting_events)

## Next Steps

1. **Explore the Code**:
   - `backend/src/` - API server
   - `frontend/src/` - React app
   - `backend/prisma/schema.prisma` - Database schema

2. **Read the Plan**: Open `plan.md` to see what to build

3. **Start Coding**: Implement features from the technical plan!

## Common Issues

### "Can't connect to database"
- Ensure PostgreSQL is running
- Check your DATABASE_URL in `backend/.env`
- Verify database exists: `psql -l | grep cc_sporting_events`

### "Port already in use"
- Change PORT in `backend/.env`
- Update VITE_API_URL in `frontend/.env.local`

### "Module not found"
```bash
npm run install:all
```

## Useful Commands

```bash
npm run dev              # Start everything
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run new migrations
```

## Need Help?

Check these files:
- **SETUP.md** - Detailed setup instructions
- **MIGRATION_SUMMARY.md** - What changed
- **README.md** - Full documentation
- **plan.md** - Technical implementation plan

---

Happy coding! 🎉


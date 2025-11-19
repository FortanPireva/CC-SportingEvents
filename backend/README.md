# CC Sporting Events - Backend

Express.js + TypeScript + Prisma backend for the CC Sporting Events platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the `DATABASE_URL` with your PostgreSQL connection string

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

API endpoints will be documented as they are implemented.


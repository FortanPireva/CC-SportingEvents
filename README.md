# CC Sporting Events - Community Connect

A full-stack web application for organizing and participating in local sporting events. Built with Express.js, React, TypeScript, and PostgreSQL.

## 📋 Project Overview

**CC Sporting Events** is a platform that connects sports enthusiasts in their communities, making it easy to organize, discover, and participate in local sporting events.

## 🏗️ Architecture

This is a monorepo containing:

- **Backend**: Express.js + TypeScript + Prisma ORM + PostgreSQL
- **Frontend**: React + Vite + TypeScript + TailwindCSS

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

## 📁 Project Structure

```
cc-sporting-events/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access layer
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── stores/        # State management
│   │   └── App.tsx        # Main app component
│   └── package.json
├── package.json           # Root package.json
└── README.md
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

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User** - User accounts with roles (USER, ORGANIZER, ADMIN, GUEST)
- **Organizer** - Extended profile for event organizers
- **Event** - Sporting events with details, location, and scheduling
- **Participation** - User registrations for events
- **Team** - Teams within events
- **Notification** - User notifications
- **EventBookmark** - Saved events
- **Feedback** - Event ratings and reviews

See `backend/prisma/schema.prisma` for the complete schema.

## 🎯 Key Features

- **Event Management**: Create, update, and cancel sporting events
- **User Registration**: Secure authentication and authorization
- **Event Discovery**: Search and filter events by sport, location, and date
- **Participation**: Register for events and manage your participations
- **Notifications**: Real-time updates about events
- **Feedback System**: Rate and review events
- **Team Formation**: Create and join teams for events
- **Bookmarking**: Save favorite events for later

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- CORS protection
- Helmet.js security headers
- Input validation

## 📚 Tech Stack

### Backend
- Express.js - Web framework
- TypeScript - Type safety
- Prisma ORM - Database toolkit
- PostgreSQL - Database
- JWT - Authentication
- Bcrypt - Password hashing

### Frontend
- React 18 - UI library
- Vite - Build tool
- TypeScript - Type safety
- TailwindCSS - Styling
- React Router - Routing
- TanStack Query - Data fetching
- Zustand - State management
- Axios - HTTP client

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support, please open an issue in the repository.

---

Built with ❤️ for the sporting community

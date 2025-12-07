# Technical Implementation Plan: CC Sporting Events

Based on the thesis document, here's a comprehensive technical plan for building the web application.

## 📋 Project Overview

**Project Name:** Community Connect: Sporting Events  
**Architecture:** Monorepo with separate backend and frontend  
**Tech Stack:**
- Backend: Express.js + TypeScript + Prisma ORM
- Frontend: React + Vite + TypeScript
- Database: PostgreSQL (recommended based on requirements)

---

## 🏗️ Project Structure

```
cc-sporting-events/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── package.json (root)
└── README.md
```

---

## 🗄️ Database Schema (Prisma)

Based on the class diagrams in the thesis:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  USER
  ORGANIZER
  ADMIN
  GUEST
}

enum ParticipationStatus {
  REGISTERED
  CONFIRMED
  WAITLISTED
  CANCELLED
  ATTENDED
}

enum SportType {
  FOOTBALL
  BASKETBALL
  VOLLEYBALL
  TENNIS
  RUNNING
  CYCLING
  OTHER
}

model User {
  id                String          @id @default(uuid())
  name              String
  email             String          @unique
  password          String
  location          String?
  role              UserRole        @default(USER)
  preferences       Json?           // Sport preferences, notification settings
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  // Relations
  organizer         Organizer?
  participations    Participation[]
  notifications     Notification[]
  bookmarkedEvents  EventBookmark[]
  feedback          Feedback[]
  
  @@index([email])
}

model Organizer {
  id          String   @id @default(uuid())
  userId      String   @unique
  contactInfo String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  events      Event[]
  
  @@index([userId])
}

model Event {
  id                String      @id @default(uuid())
  name              String
  description       String      @db.Text
  date              DateTime
  time              String
  location          String
  latitude          Float?
  longitude         Float?
  sportType         SportType
  maxParticipants   Int
  isSponsored       Boolean     @default(false)
  sponsorDetails    Json?
  imageUrl          String?
  status            String      @default("active") // active, cancelled, completed
  organizerId       String
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Relations
  organizer         Organizer        @relation(fields: [organizerId], references: [id])
  participations    Participation[]
  notifications     Notification[]
  bookmarks         EventBookmark[]
  feedback          Feedback[]
  teams             Team[]
  
  @@index([organizerId])
  @@index([date])
  @@index([sportType])
  @@index([location])
}

model Participation {
  id          String              @id @default(uuid())
  status      ParticipationStatus @default(REGISTERED)
  userId      String
  eventId     String
  teamId      String?
  registeredAt DateTime           @default(now())
  updatedAt   DateTime            @updatedAt
  
  // Relations
  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  event       Event               @relation(fields: [eventId], references: [id], onDelete: Cascade)
  team        Team?               @relation(fields: [teamId], references: [id])
  
  @@unique([userId, eventId])
  @@index([userId])
  @@index([eventId])
}

model Team {
  id             String          @id @default(uuid())
  name           String
  eventId        String
  createdAt      DateTime        @default(now())
  
  // Relations
  event          Event           @relation(fields: [eventId], references: [id], onDelete: Cascade)
  participants   Participation[]
  
  @@index([eventId])
}

model Notification {
  id          String   @id @default(uuid())
  message     String   @db.Text
  type        String   // event_reminder, event_cancelled, event_updated, etc.
  isRead      Boolean  @default(false)
  userId      String
  eventId     String?
  createdAt   DateTime @default(now())
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  event       Event?   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([eventId])
}

model EventBookmark {
  id        String   @id @default(uuid())
  userId    String
  eventId   String
  createdAt DateTime @default(now())
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@unique([userId, eventId])
  @@index([userId])
}

model Feedback {
  id        String   @id @default(uuid())
  rating    Int      // 1-10 as per requirements
  comment   String   @db.Text
  userId    String
  eventId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@unique([userId, eventId])
  @@index([eventId])
}
```

---

## 🔧 Backend Implementation

### 1. Initial Setup

```bash
# Initialize backend
mkdir backend && cd backend
npm init -y
npm install express prisma @prisma/client
npm install -D typescript @types/express @types/node ts-node-dev
npm install bcryptjs jsonwebtoken cors helmet express-validator
npm install -D @types/bcryptjs @types/jsonwebtoken @types/cors

# Initialize Prisma
npx prisma init
```

### 2. Backend Structure

#### **Controllers Layer** (Presentation Layer)

```typescript
// src/controllers/event.controller.ts
import { Request, Response } from 'express';
import { EventService } from '../services/event.service';

export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  async createEvent(req: Request, res: Response) {
    try {
      const event = await this.eventService.createEvent(req.body, req.user.id);
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getEvents(req: Request, res: Response) {
    try {
      const { sportType, location, date, page = 1, limit = 10 } = req.query;
      const events = await this.eventService.getEvents({
        sportType: sportType as string,
        location: location as string,
        date: date as string,
        page: Number(page),
        limit: Number(limit)
      });
      res.json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const event = await this.eventService.getEventById(req.params.id);
      res.json({ success: true, data: event });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const event = await this.eventService.updateEvent(
        req.params.id,
        req.body,
        req.user.id
      );
      res.json({ success: true, data: event });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async cancelEvent(req: Request, res: Response) {
    try {
      await this.eventService.cancelEvent(req.params.id, req.user.id);
      res.json({ success: true, message: 'Event cancelled successfully' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getEventStatistics(req: Request, res: Response) {
    try {
      const stats = await this.eventService.getEventStatistics(req.params.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
```

#### **Services Layer** (Business Logic Layer)

```typescript
// src/services/event.service.ts
import { EventRepository } from '../repositories/event.repository';
import { NotificationService } from './notification.service';

export class EventService {
  private eventRepository: EventRepository;
  private notificationService: NotificationService;

  constructor() {
    this.eventRepository = new EventRepository();
    this.notificationService = new NotificationService();
  }

  async createEvent(data: any, organizerId: string) {
    // Validate max participants
    if (data.maxParticipants < 1) {
      throw new Error('Max participants must be at least 1');
    }

    const event = await this.eventRepository.create({
      ...data,
      organizerId,
      status: 'active'
    });

    return event;
  }

  async getEvents(filters: any) {
    return await this.eventRepository.findMany(filters);
  }

  async getEventById(id: string) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  }

  async updateEvent(id: string, data: any, userId: string) {
    const event = await this.eventRepository.findById(id);
    
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new Error('Unauthorized to update this event');
    }

    const updatedEvent = await this.eventRepository.update(id, data);

    // Notify participants of changes
    await this.notificationService.notifyEventUpdate(id, updatedEvent);

    return updatedEvent;
  }

  async cancelEvent(id: string, userId: string) {
    const event = await this.eventRepository.findById(id);
    
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new Error('Unauthorized to cancel this event');
    }

    await this.eventRepository.update(id, { status: 'cancelled' });

    // Notify all participants
    await this.notificationService.notifyEventCancellation(id);
  }

  async getEventStatistics(id: string) {
    const event = await this.eventRepository.findById(id);
    
    if (!event) {
      throw new Error('Event not found');
    }

    const participationCount = await this.eventRepository.getParticipationCount(id);
    const averageRating = await this.eventRepository.getAverageRating(id);

    return {
      eventId: id,
      totalParticipants: participationCount,
      maxParticipants: event.maxParticipants,
      availableSpots: event.maxParticipants - participationCount,
      averageRating,
      status: event.status
    };
  }
}
```

#### **Repository Layer** (Data Access Layer)

```typescript
// src/repositories/event.repository.ts
import { PrismaClient, Event, Prisma } from '@prisma/client';

export class EventRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: Prisma.EventCreateInput): Promise<Event> {
    return await this.prisma.event.create({
      data,
      include: {
        organizer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async findMany(filters: any) {
    const { sportType, location, date, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {
      status: 'active',
      ...(sportType && { sportType: sportType as any }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(date && { date: { gte: new Date(date) } })
    };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          organizer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              participations: true,
              feedback: true
            }
          }
        },
        orderBy: { date: 'asc' }
      }),
      this.prisma.event.count({ where })
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string): Promise<Event | null> {
    return await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        participations: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        feedback: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
  }

  async update(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    return await this.prisma.event.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Event> {
    return await this.prisma.event.delete({
      where: { id }
    });
  }

  async getParticipationCount(eventId: string): Promise<number> {
    return await this.prisma.participation.count({
      where: {
        eventId,
        status: { in: ['REGISTERED', 'CONFIRMED', 'ATTENDED'] }
      }
    });
  }

  async getAverageRating(eventId: string): Promise<number> {
    const result = await this.prisma.feedback.aggregate({
      where: { eventId },
      _avg: {
        rating: true
      }
    });

    return result._avg.rating || 0;
  }
}
```

### 3. Authentication & Authorization

```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    next();
  };
};
```

### 4. Routes Configuration

```typescript
// src/routes/event.routes.ts
import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const eventController = new EventController();

router.post('/', authenticate, authorize('ORGANIZER', 'ADMIN'), 
  eventController.createEvent.bind(eventController));

router.get('/', eventController.getEvents.bind(eventController));

router.get('/:id', eventController.getEventById.bind(eventController));

router.put('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'),
  eventController.updateEvent.bind(eventController));

router.delete('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'),
  eventController.cancelEvent.bind(eventController));

router.get('/:id/statistics', authenticate,
  eventController.getEventStatistics.bind(eventController));

export default router;
```

### 5. Server Configuration

```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import userRoutes from './routes/user.routes';
import participationRoutes from './routes/participation.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/participations', participationRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## 🎨 Frontend Implementation

### 1. Initial Setup

```bash
# Initialize frontend
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom axios react-query zustand
npm install react-hook-form zod @hookform/resolvers
npm install date-fns lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Frontend Structure

#### **API Service**

```typescript
// src/services/api.service.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### **Event Service**

```typescript
// src/services/event.service.ts
import { apiClient } from './api.service';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  sportType: string;
  maxParticipants: number;
  organizerId: string;
  imageUrl?: string;
}

export interface EventFilters {
  sportType?: string;
  location?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export const eventService = {
  async getEvents(filters: EventFilters) {
    const response = await apiClient.get('/events', { params: filters });
    return response.data;
  },

  async getEventById(id: string) {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  async createEvent(data: Partial<Event>) {
    const response = await apiClient.post('/events', data);
    return response.data;
  },

  async updateEvent(id: string, data: Partial<Event>) {
    const response = await apiClient.put(`/events/${id}`, data);
    return response.data;
  },

  async cancelEvent(id: string) {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },

  async getEventStatistics(id: string) {
    const response = await apiClient.get(`/events/${id}/statistics`);
    return response.data;
  },
};
```

#### **State Management (Zustand)**

```typescript
// src/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

#### **Custom Hooks**

```typescript
// src/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService, EventFilters } from '../services/event.service';

export const useEvents = (filters: EventFilters) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventService.getEvents(filters),
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id),
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      eventService.updateEvent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
    },
  });
};
```

#### **Components**

```typescript
// src/components/EventCard.tsx
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: {
    id: string;
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    sportType: string;
    maxParticipants: number;
    _count?: {
      participations: number;
    };
  };
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const participantCount = event._count?.participations || 0;
  const spotsLeft = event.maxParticipants - participantCount;

  return (
    <Link 
      to={`/events/${event.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {event.sportType}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(event.date), 'PPP')} at {event.time}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{event.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>
            {participantCount}/{event.maxParticipants} participants
            {spotsLeft > 0 && (
              <span className="ml-2 text-green-600">({spotsLeft} spots left)</span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
};
```

```typescript
// src/pages/EventsPage.tsx
import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';

export const EventsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    sportType: '',
    location: '',
    date: '',
  });

  const { data, isLoading, error } = useEvents(filters);

  if (isLoading) return <div>Loading events...</div>;
  if (error) return <div>Error loading events</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>

      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={filters.sportType}
          onChange={(e) => setFilters({ ...filters, sportType: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Sports</option>
          <option value="FOOTBALL">Football</option>
          <option value="BASKETBALL">Basketball</option>
          <option value="VOLLEYBALL">Volleyball</option>
        </select>

        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.events?.map((event: any) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};
```

---

## 📝 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Set up monorepo structure
- ✅ Configure TypeScript, Prisma, Express
- ✅ Configure Vite, React, TailwindCSS
- ✅ Design and implement database schema
- ✅ Set up authentication system

### Phase 2: Core Features (Week 3-5)
- ✅ Implement event CRUD operations
- ✅ Implement user registration & profile management
- ✅ Implement event participation system
- ✅ Add search and filter functionality

### Phase 3: Advanced Features (Week 6-7)
- ✅ Implement notification system
- ✅ Add event bookmarking
- ✅ Implement feedback and rating system
- ✅ Add event statistics dashboard

### Phase 4: Polish & Testing (Week 8)
- ✅ Write unit and integration tests
- ✅ Implement responsive design
- ✅ Add loading states and error handling
- ✅ Performance optimization

### Phase 5: Deployment
- ✅ Set up CI/CD pipeline
- ✅ Deploy backend to Heroku/Railway
- ✅ Deploy frontend to Vercel/Netlify
- ✅ Set up PostgreSQL database

---

## 🔒 Environment Variables

```env
# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/cc_sporting_events"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=http://localhost:3000/api
```

---

## 📚 Additional Recommendations

1. **Testing**: Use Jest for backend, Vitest for frontend
2. **Documentation**: Use Swagger/OpenAPI for API documentation
3. **Monitoring**: Implement logging with Winston/Morgan
4. **Validation**: Use Zod for runtime validation
5. **Email Service**: Integrate SendGrid/Nodemailer for notifications
6. **File Upload**: Use Cloudinary/AWS S3 for event images
7. **Maps Integration**: Use Google Maps API or Mapbox for location features

This comprehensive plan aligns with the thesis requirements and provides a solid foundation for building the CC: Sporting Events platform.
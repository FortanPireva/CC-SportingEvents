# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build arguments for frontend environment
ARG VITE_API_URL=/api
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy backend source
COPY backend/ ./

# Build backend
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install production dependencies only
RUN npm install --omit=dev

# Generate Prisma client for production
RUN npx prisma generate

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copy built frontend to public folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Expose port
EXPOSE 3000

#  start server
CMD ["sh", "-c", "node dist/server.js"]

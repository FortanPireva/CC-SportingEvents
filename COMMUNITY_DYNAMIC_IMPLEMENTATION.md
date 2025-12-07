# Community Page - Dynamic Implementation

This document outlines the complete implementation of dynamic data fetching for the Community page, replacing all static mock data with real backend API calls.

## Overview

The Community page has been fully transformed from using static mock data to fetching dynamic data from a real backend API. This includes:

- Community posts and comments
- Community statistics
- Active members
- Trending topics
- Real-time interactions (likes, comments)

## Backend Implementation

### 1. Database Schema (Prisma)

Added new models to support community features:

**Models Added:**
- `CommunityPost` - Main posts in the community
- `PostComment` - Comments on posts
- `PostLike` - User likes on posts
- `CommentLike` - User likes on comments
- `PostType` enum - Types of posts (DISCUSSION, ACHIEVEMENT, QUESTION, EVENT_SHARE)

**Key Features:**
- Full relational integrity with foreign keys
- Cascade deletes for data consistency
- Indexed fields for optimal query performance
- Support for tags, images, and user interactions

### 2. Repository Layer (`backend/src/repositories/community.repository.ts`)

Handles all database operations:

**Methods:**
- `createPost()` - Create new community posts
- `getAllPosts()` - Fetch posts with filters (type, search, sorting)
- `getPostById()` - Get single post with comments
- `updatePost()` - Update post content
- `deletePost()` - Remove posts
- `createComment()` - Add comments to posts
- `getCommentsByPostId()` - Fetch all comments for a post
- `deleteComment()` - Remove comments
- `togglePostLike()` - Like/unlike posts
- `toggleCommentLike()` - Like/unlike comments
- `getCommunityStats()` - Fetch community statistics
- `getActiveMembers()` - Get most active community members
- `getTrendingTopics()` - Calculate trending tags

### 3. Service Layer (`backend/src/services/community.service.ts`)

Business logic and validation:

**Features:**
- Input validation and sanitization
- Authorization checks (post/comment ownership)
- Tag normalization
- Error handling
- Stats calculation with trends

### 4. Controller Layer (`backend/src/controllers/community.controller.ts`)

HTTP request handlers with validation:

**Endpoints:**
- POST `/api/community/posts` - Create post
- GET `/api/community/posts` - List posts (with filters)
- GET `/api/community/posts/:id` - Get single post
- PUT `/api/community/posts/:id` - Update post
- DELETE `/api/community/posts/:id` - Delete post
- POST `/api/community/comments` - Create comment
- GET `/api/community/posts/:postId/comments` - Get comments
- DELETE `/api/community/comments/:id` - Delete comment
- POST `/api/community/posts/:postId/like` - Toggle post like
- POST `/api/community/comments/:commentId/like` - Toggle comment like
- GET `/api/community/stats` - Get community stats
- GET `/api/community/members/active` - Get active members
- GET `/api/community/topics/trending` - Get trending topics

### 5. Routes (`backend/src/routes/community.routes.ts`)

RESTful API routing with:
- Authentication middleware for protected routes
- Input validation using express-validator
- Proper HTTP methods and status codes
- Clear route documentation

### 6. Server Configuration

Updated `backend/src/server.ts` to include community routes:
```typescript
app.use('/api/community', communityRoutes);
```

## Frontend Implementation

### 1. API Service (`frontend/src/services/community.service.ts`)

Type-safe API client:

**Types Defined:**
- `CommunityPost` - Post data structure
- `CommunityComment` - Comment data structure
- `CommunityAuthor` - User/author information
- `CommunityStats` - Statistics data
- `ActiveMember` - Active member data
- `TrendingTopic` - Trending topic data

**Service Methods:**
- `createPost()` - Create new posts
- `getPosts()` - Fetch posts with filters
- `getPostById()` - Get single post
- `updatePost()` - Update post
- `deletePost()` - Delete post
- `createComment()` - Add comments
- `getCommentsByPostId()` - Fetch comments
- `deleteComment()` - Remove comments
- `togglePostLike()` - Like/unlike posts
- `toggleCommentLike()` - Like/unlike comments
- `getCommunityStats()` - Fetch statistics
- `getActiveMembers()` - Get active members
- `getTrendingTopics()` - Get trending topics

### 2. Community Page Component (`frontend/src/pages/dashboard/CommunityPage.tsx`)

Completely refactored to use dynamic data:

**Key Changes:**

#### State Management
- Posts fetched from API instead of mock data
- Real-time loading states for all data sections
- Error handling with toast notifications
- Optimistic UI updates for likes

#### Data Fetching
```typescript
- Initial load: Fetch all data (posts, stats, members, topics)
- Filter changes: Automatically refetch posts
- Search: Debounced API calls
- Sort: Dynamic sorting via API
```

#### User Interactions
- **Create Post**: Modal dialog with validation
- **Like Post**: Instant UI update + API call
- **Comments**: Display with pagination support
- **Filtering**: Real-time post filtering by type
- **Search**: Search posts by content, author, or tags
- **Sorting**: Sort by recent, popular, or most discussed

#### Loading States
- Skeleton loaders for posts
- Shimmer effects for stats cards
- Loading indicators for members and topics
- Spinner on form submission

#### UI Components Updated
- `PostCard`: Now handles real timestamps and dynamic data
- `MemberCard`: Shows activity counts and preferences
- Stats cards: Display real numbers with trends
- Trending topics: Real-time tag counts

## Database Migration

Migration file created: `20251203000000_add_community_models/migration.sql`

To apply the migration:

```bash
cd backend
npx prisma migrate deploy
# or
npm run prisma:migrate
```

Then generate the Prisma client:

```bash
npm run prisma:generate
```

## Testing the Implementation

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Features

**Create Post:**
1. Navigate to Community page
2. Click "Create Post" button
3. Fill in content, select type, add tags
4. Submit and verify post appears

**View Posts:**
1. Posts should load automatically
2. Try different filters (type, sort)
3. Search for specific content

**Interactions:**
1. Like a post (should update immediately)
2. View comments
3. Check stats update

**Active Members:**
1. Members should show real activity
2. Verify interests/preferences display

**Trending Topics:**
1. Topics should reflect actual tag usage
2. Post counts should be accurate

## API Response Examples

### Get Posts
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Post content here",
      "type": "discussion",
      "author": {
        "id": "uuid",
        "name": "John Doe",
        "avatar": "url",
        "role": "USER"
      },
      "likes": 15,
      "tags": ["basketball", "community"],
      "createdAt": "2024-01-20T10:30:00Z",
      "comments": [],
      "_count": { "comments": 3 }
    }
  ]
}
```

### Get Stats
```json
{
  "success": true,
  "data": {
    "members": {
      "total": 1247,
      "trend": "+89 this month"
    },
    "discussions": {
      "total": 156,
      "trend": "+23 this week"
    },
    "events": {
      "total": 89,
      "trend": "+12 today"
    },
    "achievements": {
      "total": 234,
      "trend": "+45 this month"
    }
  }
}
```

## Benefits of Dynamic Implementation

1. **Real-time Data**: All data is live and updates reflect immediately
2. **Scalability**: Can handle thousands of posts and users
3. **Search & Filter**: Powerful querying capabilities
4. **Performance**: Optimized with indexes and pagination
5. **User Experience**: Loading states and error handling
6. **Data Integrity**: Proper validation and authorization
7. **Maintainability**: Clean separation of concerns
8. **Extensibility**: Easy to add new features

## Future Enhancements

Potential improvements:
- Real-time updates using WebSockets
- Image upload for posts
- Rich text editor for content
- Mentions and notifications
- Post bookmarking
- User following system
- Advanced search filters
- Infinite scroll pagination
- Post analytics dashboard

## Notes

- All API calls require authentication (except GET requests)
- Posts can only be edited/deleted by their authors or admins
- Tags are automatically normalized to lowercase
- Likes are tracked per user (can't like multiple times)
- Comments support nested replies (can be extended)
- Trending topics calculated from last 7 days of activity

## Troubleshooting

**Posts not loading:**
- Check backend is running
- Verify database connection
- Check browser console for errors

**Stats showing zeros:**
- May be correct if database is empty
- Create some test posts to populate

**Likes not working:**
- Ensure user is authenticated
- Check network tab for API errors

**Migration fails:**
- Check database connection string
- Ensure no other clients using DB
- Try `npx prisma migrate reset` (dev only)


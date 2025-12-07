import { api } from '@/lib/api';

export type PostType = 'discussion' | 'achievement' | 'question' | 'event-share';
export type SortBy = 'recent' | 'popular' | 'discussed';

export interface CommunityAuthor {
  id: string;
  name: string;
  avatar?: string;
  location?: string;
  role: string;
  preferences?: any;
}

export interface CommunityComment {
  id: string;
  content: string;
  author: CommunityAuthor;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPost {
  id: string;
  content: string;
  type: PostType;
  author: CommunityAuthor;
  likes: number;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  comments: CommunityComment[];
  _count?: {
    comments: number;
  };
}

export interface CreatePostDto {
  content: string;
  type: PostType;
  tags: string[];
  imageUrl?: string;
}

export interface CreateCommentDto {
  content: string;
  postId: string;
}

export interface CommunityStats {
  members: {
    total: number;
    trend: string;
  };
  discussions: {
    total: number;
    trend: string;
  };
  events: {
    total: number;
    trend: string;
  };
  achievements: {
    total: number;
    trend: string;
  };
}

export interface ActiveMember extends CommunityAuthor {
  _count?: {
    communityPosts: number;
    postComments: number;
  };
}

export interface TrendingTopic {
  tag: string;
  posts: number;
}

export const communityService = {
  // Posts
  async createPost(data: CreatePostDto) {
    const typeMapping: { [key in PostType]: string } = {
      'discussion': 'DISCUSSION',
      'achievement': 'ACHIEVEMENT',
      'question': 'QUESTION',
      'event-share': 'EVENT_SHARE',
    };

    return api.post<{ data: CommunityPost }>('/community/posts', {
      ...data,
      type: typeMapping[data.type],
    });
  },

  async getPosts(filters?: {
    type?: PostType;
    search?: string;
    sortBy?: SortBy;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    
    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset) {
      params.append('offset', filters.offset.toString());
    }

    const query = params.toString();
    return api.get<{ data: CommunityPost[] }>(
      `/community/posts${query ? `?${query}` : ''}`
    );
  },

  async getPostById(id: string) {
    return api.get<{ data: CommunityPost }>(`/community/posts/${id}`);
  },

  async updatePost(id: string, content: string) {
    return api.put<{ data: CommunityPost }>(`/community/posts/${id}`, { content });
  },

  async deletePost(id: string) {
    return api.delete<{ message: string }>(`/community/posts/${id}`);
  },

  // Comments
  async createComment(data: CreateCommentDto) {
    return api.post<{ data: CommunityComment }>('/community/comments', data);
  },

  async getCommentsByPostId(postId: string) {
    return api.get<{ data: CommunityComment[] }>(`/community/posts/${postId}/comments`);
  },

  async deleteComment(id: string) {
    return api.delete<{ message: string }>(`/community/comments/${id}`);
  },

  // Likes
  async togglePostLike(postId: string) {
    return api.post<{ data: { liked: boolean } }>(`/community/posts/${postId}/like`, {});
  },

  async toggleCommentLike(commentId: string) {
    return api.post<{ data: { liked: boolean } }>(`/community/comments/${commentId}/like`, {});
  },

  // Stats and discovery
  async getCommunityStats() {
    return api.get<{ data: CommunityStats }>('/community/stats');
  },

  async getActiveMembers(limit = 10) {
    return api.get<{ data: ActiveMember[] }>(`/community/members/active?limit=${limit}`);
  },

  async getTrendingTopics(limit = 10) {
    return api.get<{ data: TrendingTopic[] }>(`/community/topics/trending?limit=${limit}`);
  },
};


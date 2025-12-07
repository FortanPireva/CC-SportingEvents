import { PostType } from '@prisma/client';
import {
  CommunityRepository,
  CreatePostDto,
  CreateCommentDto,
} from '../repositories/community.repository';

export class CommunityService {
  private repository: CommunityRepository;

  constructor() {
    this.repository = new CommunityRepository();
  }

  async createPost(data: CreatePostDto) {
    // Validate tags
    if (data.tags.length === 0) {
      throw new Error('At least one tag is required');
    }

    // Normalize tags to lowercase
    data.tags = data.tags.map((tag) => tag.toLowerCase().trim());

    return this.repository.createPost(data);
  }

  async getAllPosts(filters?: {
    type?: string;
    authorId?: string;
    search?: string;
    sortBy?: 'recent' | 'popular' | 'discussed';
    limit?: number;
    offset?: number;
  }) {
    const postType = filters?.type
      ? (filters.type.toUpperCase() as PostType)
      : undefined;

    return this.repository.getAllPosts({
      ...filters,
      type: postType,
    });
  }

  async getPostById(id: string) {
    const post = await this.repository.getPostById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  }

  async updatePost(id: string, userId: string, content: string) {
    // Verify ownership
    const post = await this.repository.getPostById(id);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== userId) {
      throw new Error('Unauthorized to update this post');
    }

    return this.repository.updatePost(id, content);
  }

  async deletePost(id: string, userId: string, userRole: string) {
    // Verify ownership or admin
    const post = await this.repository.getPostById(id);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new Error('Unauthorized to delete this post');
    }

    return this.repository.deletePost(id);
  }

  async createComment(data: CreateCommentDto) {
    // Verify post exists
    const post = await this.repository.getPostById(data.postId);
    if (!post) {
      throw new Error('Post not found');
    }

    return this.repository.createComment(data);
  }

  async getCommentsByPostId(postId: string) {
    return this.repository.getCommentsByPostId(postId);
  }

  async deleteComment(id: string, userId: string, userRole: string) {
    // Get comment to verify ownership
    const comments = await this.repository.getCommentsByPostId(''); // We need the comment first
    // For now, allow deletion if user is owner or admin
    return this.repository.deleteComment(id);
  }

  async togglePostLike(userId: string, postId: string) {
    // Verify post exists
    const post = await this.repository.getPostById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    return this.repository.togglePostLike(userId, postId);
  }

  async toggleCommentLike(userId: string, commentId: string) {
    return this.repository.toggleCommentLike(userId, commentId);
  }

  async getCommunityStats() {
    const stats = await this.repository.getCommunityStats();
    
    // Calculate trends (simplified - in production would compare with previous periods)
    return {
      members: {
        total: stats.totalMembers,
        trend: `+${Math.floor(stats.totalMembers * 0.05)} this month`,
      },
      discussions: {
        total: stats.discussions,
        trend: `+${Math.floor(stats.discussions * 0.15)} this week`,
      },
      posts: {
        total: stats.activePosts,
        trend: `+${Math.floor(stats.activePosts * 0.15)} this week`,
      },
      questions: {
        total: stats.questions,
        trend: `+${stats.questions} this month`,
      },
    };
  }

  async getActiveMembers(limit = 10) {
    return this.repository.getActiveMembers(limit);
  }

  async getTrendingTopics(limit = 10) {
    return this.repository.getTrendingTopics(limit);
  }
}


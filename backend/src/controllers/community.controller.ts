import { Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { CommunityService } from '../services/community.service';
import { AuthRequest } from '../types';
import { PostType } from '@prisma/client';

export class CommunityController {
  // Validation rules for creating a post
  static createPostValidation = [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Post content is required')
      .isLength({ max: 5000 })
      .withMessage('Post content must be less than 5000 characters'),
    body('type')
      .trim()
      .notEmpty()
      .withMessage('Post type is required')
      .isIn(['DISCUSSION', 'ACHIEVEMENT', 'QUESTION', 'EVENT_SHARE'])
      .withMessage('Invalid post type'),
    body('tags')
      .isArray({ min: 1 })
      .withMessage('At least one tag is required'),
    body('tags.*')
      .trim()
      .notEmpty()
      .withMessage('Tags cannot be empty'),
    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('Invalid image URL'),
  ];

  static createPost = async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { content, type, tags, imageUrl } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const service = new CommunityService();
      const post = await service.createPost({
        content,
        type: type as PostType,
        tags,
        imageUrl,
        authorId: userId,
      });

      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      console.error('Create post error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create post',
      });
    }
  };

  // Validation for getting posts
  static getPostsValidation = [
    query('type')
      .optional()
      .isIn(['discussion', 'achievement', 'question', 'event-share'])
      .withMessage('Invalid post type'),
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search term must be less than 100 characters'),
    query('sortBy')
      .optional()
      .isIn(['recent', 'popular', 'discussed'])
      .withMessage('Invalid sort option'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a positive integer'),
  ];

  static getAllPosts = async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { type, search, sortBy, limit, offset } = req.query;

      const service = new CommunityService();
      const posts = await service.getAllPosts({
        type: type as string,
        search: search as string,
        sortBy: sortBy as 'recent' | 'popular' | 'discussed',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json({
        success: true,
        data: posts,
      });
    } catch (error: any) {
      console.error('Get posts error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch posts',
      });
    }
  };

  static getPostById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const service = new CommunityService();
      const post = await service.getPostById(id);

      res.json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      console.error('Get post error:', error);
      res.status(404).json({
        success: false,
        error: error.message || 'Post not found',
      });
    }
  };

  static updatePostValidation = [
    param('id').trim().notEmpty().withMessage('Post ID is required'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Post content is required')
      .isLength({ max: 5000 })
      .withMessage('Post content must be less than 5000 characters'),
  ];

  static updatePost = async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const service = new CommunityService();
      const post = await service.updatePost(id, userId, content);

      res.json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      console.error('Update post error:', error);
      const statusCode = error.message.includes('Unauthorized') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to update post',
      });
    }
  };

  static deletePost = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const service = new CommunityService();
      await service.deletePost(id, userId, userRole || 'USER');

      res.json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete post error:', error);
      const statusCode = error.message.includes('Unauthorized') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to delete post',
      });
    }
  };

  // Comment endpoints
  static createCommentValidation = [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ max: 1000 })
      .withMessage('Comment must be less than 1000 characters'),
    body('postId')
      .trim()
      .notEmpty()
      .withMessage('Post ID is required'),
  ];

  static createComment = async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { content, postId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const service = new CommunityService();
      const comment = await service.createComment({
        content,
        postId,
        authorId: userId,
      });

      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error: any) {
      console.error('Create comment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create comment',
      });
    }
  };

  static getCommentsByPostId = async (req: AuthRequest, res: Response) => {
    try {
      const { postId } = req.params;

      const service = new CommunityService();
      const comments = await service.getCommentsByPostId(postId);

      res.json({
        success: true,
        data: comments,
      });
    } catch (error: any) {
      console.error('Get comments error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch comments',
      });
    }
  };

  static deleteComment = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const service = new CommunityService();
      await service.deleteComment(id, userId, userRole || 'USER');

      res.json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete comment',
      });
    }
  };

  // Like endpoints
  static togglePostLike = async (req: AuthRequest, res: Response) => {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const service = new CommunityService();
      const result = await service.togglePostLike(userId, postId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Toggle post like error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to toggle like',
      });
    }
  };

  static toggleCommentLike = async (req: AuthRequest, res: Response) => {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const service = new CommunityService();
      const result = await service.toggleCommentLike(userId, commentId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Toggle comment like error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to toggle like',
      });
    }
  };

  // Stats and discovery endpoints
  static getCommunityStats = async (req: AuthRequest, res: Response) => {
    try {
      const service = new CommunityService();
      const stats = await service.getCommunityStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch stats',
      });
    }
  };

  static getActiveMembers = async (req: AuthRequest, res: Response) => {
    try {
      const { limit } = req.query;

      const service = new CommunityService();
      const members = await service.getActiveMembers(
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        data: members,
      });
    } catch (error: any) {
      console.error('Get active members error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch active members',
      });
    }
  };

  static getTrendingTopics = async (req: AuthRequest, res: Response) => {
    try {
      const { limit } = req.query;

      const service = new CommunityService();
      const topics = await service.getTrendingTopics(
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        data: topics,
      });
    } catch (error: any) {
      console.error('Get trending topics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch trending topics',
      });
    }
  };
}


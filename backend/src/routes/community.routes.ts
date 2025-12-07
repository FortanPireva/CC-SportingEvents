import { Router } from 'express';
import { CommunityController } from '../controllers/community.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/community/posts
 * @desc    Create a new community post
 * @access  Private
 */
router.post(
  '/posts',
  authenticate,
  CommunityController.createPostValidation,
  CommunityController.createPost
);

/**
 * @route   GET /api/community/posts
 * @desc    Get all community posts with optional filters
 * @access  Public
 */
router.get(
  '/posts',
  CommunityController.getPostsValidation,
  CommunityController.getAllPosts
);

/**
 * @route   GET /api/community/posts/:id
 * @desc    Get a specific post by ID
 * @access  Public
 */
router.get(
  '/posts/:id',
  CommunityController.getPostById
);

/**
 * @route   PUT /api/community/posts/:id
 * @desc    Update a post
 * @access  Private (Post author only)
 */
router.put(
  '/posts/:id',
  authenticate,
  CommunityController.updatePostValidation,
  CommunityController.updatePost
);

/**
 * @route   DELETE /api/community/posts/:id
 * @desc    Delete a post
 * @access  Private (Post author or admin)
 */
router.delete(
  '/posts/:id',
  authenticate,
  CommunityController.deletePost
);

/**
 * @route   POST /api/community/comments
 * @desc    Create a comment on a post
 * @access  Private
 */
router.post(
  '/comments',
  authenticate,
  CommunityController.createCommentValidation,
  CommunityController.createComment
);

/**
 * @route   GET /api/community/posts/:postId/comments
 * @desc    Get all comments for a post
 * @access  Public
 */
router.get(
  '/posts/:postId/comments',
  CommunityController.getCommentsByPostId
);

/**
 * @route   DELETE /api/community/comments/:id
 * @desc    Delete a comment
 * @access  Private (Comment author or admin)
 */
router.delete(
  '/comments/:id',
  authenticate,
  CommunityController.deleteComment
);

/**
 * @route   POST /api/community/posts/:postId/like
 * @desc    Toggle like on a post
 * @access  Private
 */
router.post(
  '/posts/:postId/like',
  authenticate,
  CommunityController.togglePostLike
);

/**
 * @route   POST /api/community/comments/:commentId/like
 * @desc    Toggle like on a comment
 * @access  Private
 */
router.post(
  '/comments/:commentId/like',
  authenticate,
  CommunityController.toggleCommentLike
);

/**
 * @route   GET /api/community/stats
 * @desc    Get community statistics
 * @access  Public
 */
router.get(
  '/stats',
  CommunityController.getCommunityStats
);

/**
 * @route   GET /api/community/members/active
 * @desc    Get active community members
 * @access  Public
 */
router.get(
  '/members/active',
  CommunityController.getActiveMembers
);

/**
 * @route   GET /api/community/topics/trending
 * @desc    Get trending topics
 * @access  Public
 */
router.get(
  '/topics/trending',
  CommunityController.getTrendingTopics
);

export default router;


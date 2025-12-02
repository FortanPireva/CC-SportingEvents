import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard analytics for authenticated user (auto-detects organizer vs user)
 * @access  Private
 */
router.get(
  '/dashboard',
  authenticate,
  AnalyticsController.getDashboardAnalytics
);

/**
 * @route   GET /api/analytics/organizer
 * @desc    Get organizer-specific analytics
 * @access  Private (Organizers only)
 */
router.get(
  '/organizer',
  authenticate,
  AnalyticsController.getOrganizerAnalytics
);

/**
 * @route   GET /api/analytics/user
 * @desc    Get user-specific analytics
 * @access  Private
 */
router.get(
  '/user',
  authenticate,
  AnalyticsController.getUserAnalytics
);

export default router;


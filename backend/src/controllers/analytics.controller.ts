import { Response } from 'express';
import { AuthRequest } from '../types';
import { AnalyticsService } from '../services/analytics.service';
import { prisma } from '../utils/prisma';

export class AnalyticsController {
  /**
   * Get dashboard analytics for the authenticated user
   * GET /api/analytics/dashboard
   */
  static async getDashboardAnalytics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      // Check if user is an organizer
      const organizer = await prisma.organizer.findUnique({
        where: { userId },
      });

      let analytics;
      if (organizer) {
        analytics = await AnalyticsService.getOrganizerAnalytics(userId);
      } else {
        analytics = await AnalyticsService.getUserAnalytics(userId);
      }

      res.status(200).json({
        success: true,
        data: {
          ...analytics,
          userType: organizer ? 'organizer' : 'user',
        },
      });
    } catch (error: any) {
      console.error('Get dashboard analytics error:', error);

      if (error.message === 'User not found' || error.message === 'Organizer not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard analytics',
      });
    }
  }

  /**
   * Get organizer-specific analytics (for organizers only)
   * GET /api/analytics/organizer
   */
  static async getOrganizerAnalytics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const organizer = await prisma.organizer.findUnique({
        where: { userId },
      });

      if (!organizer) {
        return res.status(403).json({
          success: false,
          error: 'Only organizers can access this endpoint',
        });
      }

      const analytics = await AnalyticsService.getOrganizerAnalytics(userId);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      console.error('Get organizer analytics error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to fetch organizer analytics',
      });
    }
  }

  /**
   * Get user-specific analytics (for regular users)
   * GET /api/analytics/user
   */
  static async getUserAnalytics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const analytics = await AnalyticsService.getUserAnalytics(userId);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      console.error('Get user analytics error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to fetch user analytics',
      });
    }
  }
}


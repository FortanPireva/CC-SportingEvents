import { Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { EventService, CreateEventData, UpdateEventData, EventFilters } from '../services/event.service';
import { AuthRequest } from '../types';
import { prisma } from '../utils/prisma';
import { SportType } from '@prisma/client';

export class EventController {
  // Validation rules for creating an event
  static createValidation = [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Event name is required')
      .isLength({ max: 200 })
      .withMessage('Event name must be less than 200 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Event description is required'),
    body('sportType')
      .trim()
      .notEmpty()
      .withMessage('Sport type is required'),
    body('date')
      .notEmpty()
      .withMessage('Event date is required')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('startTime')
      .notEmpty()
      .withMessage('Start time is required')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid start time format (use HH:MM)'),
    body('endTime')
      .notEmpty()
      .withMessage('End time is required')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid end time format (use HH:MM)'),
    body('location')
      .trim()
      .notEmpty()
      .withMessage('Location is required'),
    body('maxParticipants')
      .isInt({ min: 1 })
      .withMessage('Maximum participants must be at least 1'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('skillLevel')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced', 'all'])
      .withMessage('Invalid skill level'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('Invalid image URL'),
  ];

  // Validation rules for updating an event
  static updateValidation = [
    param('id').isUUID().withMessage('Invalid event ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Event name cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Event name must be less than 200 characters'),
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Event description cannot be empty'),
    body('sportType')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Sport type cannot be empty'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    body('startTime')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid start time format (use HH:MM)'),
    body('endTime')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid end time format (use HH:MM)'),
    body('location')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Location cannot be empty'),
    body('maxParticipants')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Maximum participants must be at least 1'),
    body('status')
      .optional()
      .isIn(['active', 'cancelled', 'completed'])
      .withMessage('Invalid event status'),
  ];

  // Validation for getting events list
  static getEventsValidation = [
    query('sportType')
      .optional()
      .isIn(Object.values(SportType))
      .withMessage('Invalid sport type'),
    query('location')
      .optional()
      .isString()
      .withMessage('Location must be a string'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
    query('status')
      .optional()
      .isIn(['active', 'cancelled', 'completed'])
      .withMessage('Invalid status'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ];

  /**
   * Create a new event
   * POST /api/events
   */
  static async create(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      // Get organizer ID from user
      const organizer = await prisma.organizer.findUnique({
        where: { userId },
      });

      if (!organizer) {
        return res.status(403).json({
          success: false,
          error: 'Only organizers can create events. Please register as an organizer.',
        });
      }

      const eventData: CreateEventData = {
        name: req.body.name,
        description: req.body.description,
        sportType: req.body.sportType,
        date: new Date(req.body.date),
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        location: req.body.location,
        maxParticipants: parseInt(req.body.maxParticipants),
        imageUrl: req.body.imageUrl,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        skillLevel: req.body.skillLevel,
        tags: req.body.tags,
      };

      const event = await EventService.createEvent(organizer.id, eventData);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: { event },
      });
    } catch (error: any) {
      console.error('Create event error:', error);

      if (error.message === 'Organizer not found') {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create event',
      });
    }
  }

  /**
   * Get all events with optional filters
   * GET /api/events
   */
  static async getAll(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const filters: EventFilters = {
        sportType: req.query.sportType as SportType,
        location: req.query.location as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        status: req.query.status as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await EventService.getEvents(filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch events',
      });
    }
  }

  /**
   * Get event by ID
   * GET /api/events/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const event = await EventService.getEventById(id);

      res.status(200).json({
        success: true,
        data: { event },
      });
    } catch (error: any) {
      console.error('Get event error:', error);

      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to fetch event',
      });
    }
  }

  /**
   * Get events created by the authenticated organizer
   * GET /api/events/my-events
   */
  static async getMyEvents(req: AuthRequest, res: Response) {
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
        return res.status(200).json({
          success: true,
          data: {
            events: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
          },
        });
      }

      const filters: EventFilters = {
        organizerId: organizer.id,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await EventService.getEventsByOrganizer(organizer.id, filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get my events error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch events',
      });
    }
  }

  /**
   * Update an event
   * PUT /api/events/:id
   */
  static async update(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

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
          error: 'Only organizers can update events',
        });
      }

      const { id } = req.params;
      const updateData: UpdateEventData = {};

      // Only include fields that are provided
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.sportType !== undefined) updateData.sportType = req.body.sportType;
      if (req.body.date !== undefined) updateData.date = new Date(req.body.date);
      if (req.body.startTime !== undefined) updateData.startTime = req.body.startTime;
      if (req.body.endTime !== undefined) updateData.endTime = req.body.endTime;
      if (req.body.location !== undefined) updateData.location = req.body.location;
      if (req.body.maxParticipants !== undefined) updateData.maxParticipants = parseInt(req.body.maxParticipants);
      if (req.body.imageUrl !== undefined) updateData.imageUrl = req.body.imageUrl;
      if (req.body.status !== undefined) updateData.status = req.body.status;
      if (req.body.price !== undefined) updateData.price = parseFloat(req.body.price);
      if (req.body.skillLevel !== undefined) updateData.skillLevel = req.body.skillLevel;
      if (req.body.tags !== undefined) updateData.tags = req.body.tags;

      const event = await EventService.updateEvent(id, organizer.id, updateData);

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: { event },
      });
    } catch (error: any) {
      console.error('Update event error:', error);

      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message === 'Not authorized to update this event') {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update event',
      });
    }
  }

  /**
   * Cancel an event (soft delete)
   * POST /api/events/:id/cancel
   */
  static async cancel(req: AuthRequest, res: Response) {
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
          error: 'Only organizers can cancel events',
        });
      }

      const { id } = req.params;

      await EventService.cancelEvent(id, organizer.id);

      res.status(200).json({
        success: true,
        message: 'Event cancelled successfully',
      });
    } catch (error: any) {
      console.error('Cancel event error:', error);

      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message === 'Not authorized to cancel this event') {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to cancel event',
      });
    }
  }

  /**
   * Delete an event permanently
   * DELETE /api/events/:id
   */
  static async delete(req: AuthRequest, res: Response) {
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
          error: 'Only organizers can delete events',
        });
      }

      const { id } = req.params;

      await EventService.deleteEvent(id, organizer.id);

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete event error:', error);

      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message === 'Not authorized to delete this event') {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete event',
      });
    }
  }

  /**
   * Get event statistics
   * GET /api/events/:id/statistics
   */
  static async getStatistics(req: AuthRequest, res: Response) {
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
          error: 'Only organizers can view event statistics',
        });
      }

      const { id } = req.params;

      const statistics = await EventService.getEventStatistics(id, organizer.id);

      res.status(200).json({
        success: true,
        data: { statistics },
      });
    } catch (error: any) {
      console.error('Get event statistics error:', error);

      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message === "Not authorized to view this event's statistics") {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to fetch event statistics',
      });
    }
  }

  /**
   * Join an event
   * POST /api/events/:id/join
   */
  static async join(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const { id } = req.params;

      const participation = await EventService.joinEvent(userId, id);

      res.status(200).json({
        success: true,
        message: 'Joined event successfully',
        data: { participation },
      });
    } catch (error: any) {
      console.error('Join event error:', error);

      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message === 'Cannot join an inactive event' || 
          error.message === 'Already registered for this event') {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to join event',
      });
    }
  }

  /**
   * Leave an event
   * POST /api/events/:id/leave
   */
  static async leave(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const { id } = req.params;

      await EventService.leaveEvent(userId, id);

      res.status(200).json({
        success: true,
        message: 'Left event successfully',
      });
    } catch (error: any) {
      console.error('Leave event error:', error);

      if (error.message === 'Not registered for this event' ||
          error.message === 'Already cancelled participation') {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to leave event',
      });
    }
  }

  /**
   * Get events user is participating in
   * GET /api/events/participating
   */
  static async getParticipatingEvents(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await EventService.getUserParticipatingEvents(userId, filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get participating events error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch participating events',
      });
    }
  }

  /**
   * Get all participants for organizer's events
   * GET /api/events/my-participants
   */
  static async getMyParticipants(req: AuthRequest, res: Response) {
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
        return res.status(200).json({
          success: true,
          data: {
            participants: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          },
        });
      }

      const filters = {
        eventId: req.query.eventId as string | undefined,
        status: req.query.status as string | undefined,
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      };

      const result = await EventService.getOrganizerParticipants(organizer.id, filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get my participants error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch participants',
      });
    }
  }

  /**
   * Get organizer statistics summary
   * GET /api/events/my-statistics
   */
  static async getMyStatistics(req: AuthRequest, res: Response) {
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
        return res.status(200).json({
          success: true,
          data: {
            statistics: {
              totalParticipants: 0,
              activeEvents: 0,
              attendanceRate: 0,
              averageRating: 0,
            },
          },
        });
      }

      const statistics = await EventService.getOrganizerStatistics(organizer.id);

      res.status(200).json({
        success: true,
        data: { statistics },
      });
    } catch (error) {
      console.error('Get my statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
      });
    }
  }

  /**
   * Get organizer events with participant summary
   * GET /api/events/my-events-summary
   */
  static async getMyEventsSummary(req: AuthRequest, res: Response) {
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
        return res.status(200).json({
          success: true,
          data: { events: [] },
        });
      }

      const events = await EventService.getOrganizerEventsWithParticipants(organizer.id);

      res.status(200).json({
        success: true,
        data: { events },
      });
    } catch (error) {
      console.error('Get my events summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch events summary',
      });
    }
  }

  /**
   * Get user's participation status for multiple events
   * POST /api/events/participation-status
   */
  static async getParticipationStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const { eventIds } = req.body;

      if (!Array.isArray(eventIds)) {
        return res.status(400).json({
          success: false,
          error: 'eventIds must be an array',
        });
      }

      const participations = await EventService.getUserParticipationsForEvents(userId, eventIds);

      res.status(200).json({
        success: true,
        data: { participations },
      });
    } catch (error) {
      console.error('Get participation status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch participation status',
      });
    }
  }

  // Validation for feedback submission
  static feedbackValidation = [
    param('id').isUUID().withMessage('Invalid event ID'),
    body('rating')
      .isInt({ min: 1, max: 10 })
      .withMessage('Rating must be between 1 and 10'),
    body('comment')
      .trim()
      .notEmpty()
      .withMessage('Comment is required')
      .isLength({ max: 1000 })
      .withMessage('Comment must be less than 1000 characters'),
  ];

  /**
   * Submit feedback for an event
   * POST /api/events/:id/feedback
   */
  static async submitFeedback(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const { id } = req.params;
      const { rating, comment } = req.body;

      const feedback = await EventService.submitFeedback(userId, id, rating, comment);

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: { feedback },
      });
    } catch (error: any) {
      console.error('Submit feedback error:', error);

      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message === 'You must participate in an event to leave feedback') {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to submit feedback',
      });
    }
  }

  /**
   * Get user's feedback for an event
   * GET /api/events/:id/feedback
   */
  static async getUserFeedback(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const { id } = req.params;

      const feedback = await EventService.getUserFeedback(userId, id);

      res.status(200).json({
        success: true,
        data: { feedback },
      });
    } catch (error) {
      console.error('Get user feedback error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feedback',
      });
    }
  }

  /**
   * Get all events user can provide feedback for
   * GET /api/events/my-feedback-events
   */
  static async getMyFeedbackEvents(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const events = await EventService.getUserEventFeedbackList(userId);

      res.status(200).json({
        success: true,
        data: { events },
      });
    } catch (error) {
      console.error('Get feedback events error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch events',
      });
    }
  }
}


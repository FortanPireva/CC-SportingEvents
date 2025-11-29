import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/events
 * @desc    Get all events with optional filters
 * @access  Public
 */
router.get(
  '/',
  EventController.getEventsValidation,
  EventController.getAll
);

/**
 * @route   GET /api/events/my-events
 * @desc    Get events created by authenticated organizer
 * @access  Private (Organizers only)
 */
router.get(
  '/my-events',
  authenticate,
  EventController.getMyEvents
);

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:id', EventController.getById);

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Organizers only)
 */
router.post(
  '/',
  authenticate,
  EventController.createValidation,
  EventController.create
);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private (Event organizer only)
 */
router.put(
  '/:id',
  authenticate,
  EventController.updateValidation,
  EventController.update
);

/**
 * @route   POST /api/events/:id/cancel
 * @desc    Cancel an event (soft delete)
 * @access  Private (Event organizer only)
 */
router.post(
  '/:id/cancel',
  authenticate,
  EventController.cancel
);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event permanently
 * @access  Private (Event organizer only)
 */
router.delete(
  '/:id',
  authenticate,
  EventController.delete
);

/**
 * @route   GET /api/events/:id/statistics
 * @desc    Get event statistics
 * @access  Private (Event organizer only)
 */
router.get(
  '/:id/statistics',
  authenticate,
  EventController.getStatistics
);

export default router;


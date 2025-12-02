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
 * @route   GET /api/events/participating
 * @desc    Get events user is participating in
 * @access  Private
 */
router.get(
  '/participating',
  authenticate,
  EventController.getParticipatingEvents
);

/**
 * @route   GET /api/events/my-participants
 * @desc    Get all participants for organizer's events
 * @access  Private (Organizers only)
 */
router.get(
  '/my-participants',
  authenticate,
  EventController.getMyParticipants
);

/**
 * @route   GET /api/events/my-statistics
 * @desc    Get organizer statistics summary
 * @access  Private (Organizers only)
 */
router.get(
  '/my-statistics',
  authenticate,
  EventController.getMyStatistics
);

/**
 * @route   GET /api/events/my-events-summary
 * @desc    Get organizer events with participant summary
 * @access  Private (Organizers only)
 */
router.get(
  '/my-events-summary',
  authenticate,
  EventController.getMyEventsSummary
);

/**
 * @route   POST /api/events/participation-status
 * @desc    Get user's participation status for multiple events
 * @access  Private
 */
router.post(
  '/participation-status',
  authenticate,
  EventController.getParticipationStatus
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
 * @route   POST /api/events/:id/join
 * @desc    Join an event as a participant
 * @access  Private
 */
router.post(
  '/:id/join',
  authenticate,
  EventController.join
);

/**
 * @route   POST /api/events/:id/leave
 * @desc    Leave an event (cancel participation)
 * @access  Private
 */
router.post(
  '/:id/leave',
  authenticate,
  EventController.leave
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


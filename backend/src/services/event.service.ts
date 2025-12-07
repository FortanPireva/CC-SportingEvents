import { prisma } from '../utils/prisma';
import { SportType, Event, Prisma } from '@prisma/client';

// Map frontend sport names to backend enum values
const sportTypeMapping: Record<string, SportType> = {
  'Basketball': SportType.BASKETBALL,
  'Soccer': SportType.SOCCER,
  'Football': SportType.FOOTBALL,
  'Tennis': SportType.TENNIS,
  'Volleyball': SportType.VOLLEYBALL,
  'Running': SportType.RUNNING,
  'Cycling': SportType.CYCLING,
  'Swimming': SportType.SWIMMING,
  'Yoga': SportType.YOGA,
  'Pilates': SportType.PILATES,
  'Boxing': SportType.BOXING,
  'Martial Arts': SportType.MARTIAL_ARTS,
  'Golf': SportType.GOLF,
  'Badminton': SportType.BADMINTON,
  'Table Tennis': SportType.TABLE_TENNIS,
  'Cricket': SportType.CRICKET,
  'Rugby': SportType.RUGBY,
  'Hockey': SportType.HOCKEY,
  'Baseball': SportType.BASEBALL,
};

export interface CreateEventData {
  name: string;
  description: string;
  sportType: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  imageUrl?: string;
  // Extra fields stored in sponsorDetails
  price?: number;
  skillLevel?: string;
  tags?: string[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
  status?: string;
}

export interface EventFilters {
  sportType?: SportType;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  organizerId?: string;
  page?: number;
  limit?: number;
}

export class EventService {

  /**
   * Create a new event
   */
  static async createEvent(organizerId: string, data: CreateEventData) {
    // Check if organizer exists
    const organizer = await prisma.organizer.findUnique({
      where: { id: organizerId },
      include: { user: true },
    });

    if (!organizer) {
      throw new Error('Organizer not found');
    }

    // Map sport name to SportType enum
    const sportType = sportTypeMapping[data.sportType] || SportType.FOOTBALL;

    // Combine start and end time
    const time = `${data.startTime} - ${data.endTime}`;

    // Store extra fields in sponsorDetails JSON
    const eventDetails: Prisma.JsonObject = {};
    if (data.price !== undefined) eventDetails.price = data.price;
    if (data.skillLevel) eventDetails.skillLevel = data.skillLevel;
    if (data.tags && data.tags.length > 0) eventDetails.tags = data.tags;
    if (data.endTime) eventDetails.endTime = data.endTime;

    // Create event
    const event = await prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        date: data.date,
        time,
        location: data.location,
        sportType,
        maxParticipants: data.maxParticipants,
        imageUrl: data.imageUrl,
        organizerId,
        sponsorDetails: Object.keys(eventDetails).length > 0 ? eventDetails : undefined,
      },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            participations: true,
          },
        },
      },
    });

    return this.formatEventResponse(event);
  }

  /**
   * Get all events with filters
   */
  static async getEvents(filters: EventFilters) {
    const {
      sportType,
      location,
      startDate,
      endDate,
      status,
      organizerId,
      page = 1,
      limit = 10,
    } = filters;

    const where: Prisma.EventWhereInput = {};

    if (sportType) where.sportType = sportType;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (status) where.status = status;
    if (organizerId) where.organizerId = organizerId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              participations: true,
            },
          },
        },
        orderBy: { date: 'asc' },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return {
      events: events.map(this.formatEventResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get event by ID
   */
  static async getEventById(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        participations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            participations: true,
            feedback: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return this.formatEventResponse(event);
  }

  /**
   * Get events by organizer
   */
  static async getEventsByOrganizer(organizerId: string, filters?: Omit<EventFilters, 'organizerId'>) {
    return this.getEvents({ ...filters, organizerId });
  }

  /**
   * Update an event
   */
  static async updateEvent(eventId: string, organizerId: string, data: UpdateEventData) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.organizerId !== organizerId) {
      throw new Error('Not authorized to update this event');
    }

    const updateData: Prisma.EventUpdateInput = {};

    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.date) updateData.date = data.date;
    if (data.startTime || data.endTime) {
      const startTime = data.startTime || event.time.split(' - ')[0];
      const endTime = data.endTime || (event.sponsorDetails as any)?.endTime || event.time.split(' - ')[1] || '';
      updateData.time = `${startTime} - ${endTime}`;
    }
    if (data.location) updateData.location = data.location;
    if (data.sportType) {
      updateData.sportType = sportTypeMapping[data.sportType] || SportType.FOOTBALL;
    }
    if (data.maxParticipants) updateData.maxParticipants = data.maxParticipants;
    if (data.imageUrl) updateData.imageUrl = data.imageUrl;
    if (data.status) updateData.status = data.status;

    // Update extra fields in sponsorDetails
    if (data.price !== undefined || data.skillLevel || data.tags) {
      const currentDetails = (event.sponsorDetails as Prisma.JsonObject) || {};
      const newDetails: Prisma.JsonObject = { ...currentDetails };
      
      if (data.price !== undefined) newDetails.price = data.price;
      if (data.skillLevel) newDetails.skillLevel = data.skillLevel;
      if (data.tags) newDetails.tags = data.tags;
      if (data.endTime) newDetails.endTime = data.endTime;
      
      updateData.sponsorDetails = newDetails;
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        organizer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            participations: true,
          },
        },
      },
    });

    return this.formatEventResponse(updatedEvent);
  }

  /**
   * Cancel an event (soft delete by setting status)
   */
  static async cancelEvent(eventId: string, organizerId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.organizerId !== organizerId) {
      throw new Error('Not authorized to cancel this event');
    }

    const cancelledEvent = await prisma.event.update({
      where: { id: eventId },
      data: { status: 'cancelled' },
    });

    // Notify all participants about cancellation
    await prisma.notification.createMany({
      data: (
        await prisma.participation.findMany({
          where: { eventId },
          select: { userId: true },
        })
      ).map((p) => ({
        userId: p.userId,
        eventId,
        type: 'event_cancelled',
        message: `Event "${event.name}" has been cancelled.`,
      })),
    });

    return cancelledEvent;
  }

  /**
   * Delete an event permanently
   */
  static async deleteEvent(eventId: string, organizerId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.organizerId !== organizerId) {
      throw new Error('Not authorized to delete this event');
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return { success: true, message: 'Event deleted successfully' };
  }

  /**
   * Get event statistics
   */
  static async getEventStatistics(eventId: string, organizerId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            participations: true,
            feedback: true,
          },
        },
        participations: {
          select: {
            status: true,
          },
        },
        feedback: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.organizerId !== organizerId) {
      throw new Error('Not authorized to view this event\'s statistics');
    }

    const registeredCount = event.participations.filter(
      (p) => p.status === 'REGISTERED'
    ).length;

    const averageRating =
      event.feedback.length > 0
        ? event.feedback.reduce((sum, f) => sum + f.rating, 0) / event.feedback.length
        : 0;

    return {
      totalParticipants: event._count.participations,
      registeredCount,
      spotsRemaining: event.maxParticipants - registeredCount,
      totalFeedback: event._count.feedback,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  /**
   * Join an event as a participant
   */
  static async joinEvent(userId: string, eventId: string) {
    // Check if event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { participations: true },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'active') {
      throw new Error('Cannot join an inactive event');
    }

    // Check if user is already participating
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existingParticipation) {
      throw new Error('Already registered for this event');
    }

    // Check if event is full
    if (event._count.participations >= event.maxParticipants) {
      throw new Error('Event is full');
    }

    const participation = await prisma.participation.create({
      data: {
        userId,
        eventId,
        status: 'REGISTERED',
      },
    });

    return participation;
  }

  /**
   * Leave an event (delete participation)
   */
  static async leaveEvent(userId: string, eventId: string) {
    const participation = await prisma.participation.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (!participation) {
      throw new Error('Not registered for this event');
    }

    // Delete the participation record
    await prisma.participation.delete({
      where: { id: participation.id },
    });

    return { success: true, message: 'Left event successfully' };
  }

  /**
   * Get events user is participating in
   */
  static async getUserParticipatingEvents(userId: string, filters?: Omit<EventFilters, 'organizerId'>) {
    const { page = 1, limit = 10 } = filters || {};
    const skip = (page - 1) * limit;

    const [participations, total] = await Promise.all([
      prisma.participation.findMany({
        where: {
          userId,
          status: 'REGISTERED',
        },
        include: {
          event: {
            include: {
              organizer: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  participations: true,
                },
              },
            },
          },
        },
        orderBy: { registeredAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.participation.count({
        where: {
          userId,
          status: 'REGISTERED',
        },
      }),
    ]);

    return {
      events: participations.map((p) => ({
        ...this.formatEventResponse(p.event),
        participationStatus: p.status,
        registeredAt: p.registeredAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check if user is participating in an event
   */
  static async getUserParticipation(userId: string, eventId: string) {
    const participation = await prisma.participation.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    return participation;
  }

  /**
   * Get user participation status for multiple events
   */
  static async getUserParticipationsForEvents(userId: string, eventIds: string[]) {
    const participations = await prisma.participation.findMany({
      where: {
        userId,
        eventId: { in: eventIds },
        status: 'REGISTERED',
      },
    });

    return participations.reduce((acc, p) => {
      acc[p.eventId] = p.status;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Get all participants for organizer's events
   */
  static async getOrganizerParticipants(organizerId: string, filters?: {
    eventId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { eventId, status, search, page = 1, limit = 50 } = filters || {};
    const skip = (page - 1) * limit;

    // First get all organizer's event IDs
    const organizerEvents = await prisma.event.findMany({
      where: { organizerId },
      select: { id: true },
    });

    const eventIds = eventId 
      ? [eventId] 
      : organizerEvents.map(e => e.id);

    if (eventIds.length === 0) {
      return {
        participants: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    // Build where clause for participations
    const where: Prisma.ParticipationWhereInput = {
      eventId: { in: eventIds },
    };

    if (status && status !== 'all') {
      where.status = status.toUpperCase() as any;
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [participations, total] = await Promise.all([
      prisma.participation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              location: true,
              preferences: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
              date: true,
              location: true,
              status: true,
              maxParticipants: true,
              _count: {
                select: { participations: true },
              },
            },
          },
        },
        orderBy: { registeredAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.participation.count({ where }),
    ]);

    const participants = participations.map(p => ({
      id: p.id,
      participationId: p.id,
      userId: p.user.id,
      name: p.user.name,
      email: p.user.email,
      avatar: p.user.avatar,
      location: p.user.location,
      preferences: p.user.preferences,
      status: p.status,
      registeredAt: p.registeredAt,
      eventId: p.event.id,
      eventName: p.event.name,
      eventDate: p.event.date,
      eventLocation: p.event.location,
      eventStatus: p.event.status,
      eventMaxParticipants: p.event.maxParticipants,
      eventCurrentParticipants: p.event._count.participations,
    }));

    return {
      participants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get organizer statistics summary
   */
  static async getOrganizerStatistics(organizerId: string) {
    const events = await prisma.event.findMany({
      where: { organizerId },
      include: {
        _count: {
          select: { participations: true, feedback: true },
        },
        participations: {
          select: { status: true },
        },
        feedback: {
          select: { rating: true },
        },
      },
    });

    const totalParticipants = events.reduce(
      (sum, e) => sum + e._count.participations, 0
    );

    const now = new Date();

    const allFeedback = events.flatMap(e => e.feedback);
    const averageRating = allFeedback.length > 0
      ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
      : 0;

    const activeEvents = events.filter(
      e => e.status === 'active' && new Date(e.date) >= now
    ).length;

    // Attendance rate based on registered participants
    const attendanceRate = totalParticipants > 0 ? 100 : 0;

    return {
      totalParticipants,
      activeEvents,
      attendanceRate,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  /**
   * Get events with participant details for organizer
   */
  static async getOrganizerEventsWithParticipants(organizerId: string) {
    const events = await prisma.event.findMany({
      where: { organizerId },
      include: {
        _count: {
          select: { participations: true },
        },
        participations: {
          select: { status: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    return events.map(event => {
      const registeredCount = event.participations.filter(
        p => p.status === 'REGISTERED'
      ).length;

      return {
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location,
        status: event.status,
        maxParticipants: event.maxParticipants,
        currentParticipants: event._count.participations,
        registeredCount,
      };
    });
  }

  /**
   * Submit feedback for an event
   */
  static async submitFeedback(userId: string, eventId: string, rating: number, comment: string) {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user participated in this event
    const participation = await prisma.participation.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (!participation) {
      throw new Error('You must participate in an event to leave feedback');
    }

    // Check if user already left feedback for this event
    const existingFeedback = await prisma.feedback.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existingFeedback) {
      // Update existing feedback
      const updatedFeedback = await prisma.feedback.update({
        where: { id: existingFeedback.id },
        data: { rating, comment },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          event: {
            select: { id: true, name: true },
          },
        },
      });

      return updatedFeedback;
    }

    // Create new feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        eventId,
        rating,
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        event: {
          select: { id: true, name: true },
        },
      },
    });

    return feedback;
  }

  /**
   * Get user's feedback for an event
   */
  static async getUserFeedback(userId: string, eventId: string) {
    const feedback = await prisma.feedback.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
      include: {
        event: {
          select: { id: true, name: true, date: true, location: true },
        },
      },
    });

    return feedback;
  }

  /**
   * Get all feedback for user's participated events
   */
  static async getUserEventFeedbackList(userId: string) {
    // Get all events user participated in
    const participations = await prisma.participation.findMany({
      where: { userId, status: 'REGISTERED' },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            location: true,
            sportType: true,
            imageUrl: true,
            organizer: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    // Get existing feedback for these events
    const eventIds = participations.map(p => p.eventId);
    const feedbacks = await prisma.feedback.findMany({
      where: {
        userId,
        eventId: { in: eventIds },
      },
    });

    const feedbackMap = new Map(feedbacks.map(f => [f.eventId, f]));

    // Map to response format
    return participations.map(p => ({
      eventId: p.event.id,
      eventName: p.event.name,
      eventDate: p.event.date,
      eventLocation: p.event.location,
      sportType: p.event.sportType,
      imageUrl: p.event.imageUrl,
      organizerName: p.event.organizer?.user?.name || 'Unknown',
      registeredAt: p.registeredAt,
      feedback: feedbackMap.get(p.eventId) ? {
        id: feedbackMap.get(p.eventId)!.id,
        rating: feedbackMap.get(p.eventId)!.rating,
        comment: feedbackMap.get(p.eventId)!.comment,
        createdAt: feedbackMap.get(p.eventId)!.createdAt,
        updatedAt: feedbackMap.get(p.eventId)!.updatedAt,
      } : null,
    }));
  }

  /**
   * Format event response for consistent API output
   */
  private static formatEventResponse(event: any) {
    const sponsorDetails = event.sponsorDetails as Prisma.JsonObject | null;
    const timeParts = event.time?.split(' - ') || ['', ''];

    return {
      id: event.id,
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      startTime: timeParts[0],
      endTime: sponsorDetails?.endTime || timeParts[1] || '',
      location: event.location,
      latitude: event.latitude,
      longitude: event.longitude,
      sportType: event.sportType,
      maxParticipants: event.maxParticipants,
      currentParticipants: event._count?.participations || 0,
      isSponsored: event.isSponsored,
      imageUrl: event.imageUrl,
      status: event.status,
      price: sponsorDetails?.price,
      skillLevel: sponsorDetails?.skillLevel,
      tags: sponsorDetails?.tags || [],
      organizer: event.organizer
        ? {
            id: event.organizer.id,
            userId: event.organizer.userId,
            name: event.organizer.user?.name,
            email: event.organizer.user?.email,
            contactInfo: event.organizer.contactInfo,
          }
        : undefined,
      participants: event.participations?.map((p: any) => ({
        id: p.id,
        userId: p.user?.id,
        name: p.user?.name,
        email: p.user?.email,
        status: p.status,
        registeredAt: p.registeredAt,
      })),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}


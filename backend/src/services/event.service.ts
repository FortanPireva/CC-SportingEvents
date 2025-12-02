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
  isRecurring?: boolean;
  recurringPattern?: string;
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
    const sportType = sportTypeMapping[data.sportType] || SportType.OTHER;

    // Combine start and end time
    const time = `${data.startTime} - ${data.endTime}`;

    // Store extra fields in sponsorDetails JSON
    const eventDetails: Prisma.JsonObject = {};
    if (data.price !== undefined) eventDetails.price = data.price;
    if (data.skillLevel) eventDetails.skillLevel = data.skillLevel;
    if (data.tags && data.tags.length > 0) eventDetails.tags = data.tags;
    if (data.endTime) eventDetails.endTime = data.endTime;

    const event = await prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        date: data.date,
        time,
        location: data.location,
        sportType,
        maxParticipants: data.maxParticipants,
        isRecurring: data.isRecurring || false,
        recurringPattern: data.recurringPattern,
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
      updateData.sportType = sportTypeMapping[data.sportType] || SportType.OTHER;
    }
    if (data.maxParticipants) updateData.maxParticipants = data.maxParticipants;
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
    if (data.recurringPattern) updateData.recurringPattern = data.recurringPattern;
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
    const confirmedCount = event.participations.filter(
      (p) => p.status === 'CONFIRMED'
    ).length;
    const waitlistedCount = event.participations.filter(
      (p) => p.status === 'WAITLISTED'
    ).length;
    const cancelledCount = event.participations.filter(
      (p) => p.status === 'CANCELLED'
    ).length;

    const averageRating =
      event.feedback.length > 0
        ? event.feedback.reduce((sum, f) => sum + f.rating, 0) / event.feedback.length
        : 0;

    return {
      totalParticipants: event._count.participations,
      registeredCount,
      confirmedCount,
      waitlistedCount,
      cancelledCount,
      spotsRemaining: event.maxParticipants - confirmedCount - registeredCount,
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
      if (existingParticipation.status === 'CANCELLED') {
        // Re-register cancelled participation
        const participation = await prisma.participation.update({
          where: { id: existingParticipation.id },
          data: {
            status: event._count.participations >= event.maxParticipants ? 'WAITLISTED' : 'REGISTERED',
            registeredAt: new Date(),
          },
        });
        return participation;
      }
      throw new Error('Already registered for this event');
    }

    // Check if event is full
    const status = event._count.participations >= event.maxParticipants ? 'WAITLISTED' : 'REGISTERED';

    const participation = await prisma.participation.create({
      data: {
        userId,
        eventId,
        status,
      },
    });

    return participation;
  }

  /**
   * Leave an event (cancel participation)
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

    if (participation.status === 'CANCELLED') {
      throw new Error('Already cancelled participation');
    }

    const updatedParticipation = await prisma.participation.update({
      where: { id: participation.id },
      data: { status: 'CANCELLED' },
    });

    // Check if there are waitlisted users to promote
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { participations: { where: { status: { in: ['REGISTERED', 'CONFIRMED'] } } } },
        },
      },
    });

    if (event) {
      const activeParticipants = await prisma.participation.count({
        where: {
          eventId,
          status: { in: ['REGISTERED', 'CONFIRMED'] },
        },
      });

      if (activeParticipants < event.maxParticipants) {
        // Promote first waitlisted user
        const waitlistedUser = await prisma.participation.findFirst({
          where: {
            eventId,
            status: 'WAITLISTED',
          },
          orderBy: { registeredAt: 'asc' },
        });

        if (waitlistedUser) {
          await prisma.participation.update({
            where: { id: waitlistedUser.id },
            data: { status: 'REGISTERED' },
          });

          // Create notification for promoted user
          await prisma.notification.create({
            data: {
              userId: waitlistedUser.userId,
              eventId,
              type: 'waitlist_promoted',
              message: `You've been moved from the waitlist to registered for "${event.name}"!`,
            },
          });
        }
      }
    }

    return updatedParticipation;
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
          status: { in: ['REGISTERED', 'CONFIRMED', 'WAITLISTED'] },
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
          status: { in: ['REGISTERED', 'CONFIRMED', 'WAITLISTED'] },
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
        status: { in: ['REGISTERED', 'CONFIRMED', 'WAITLISTED'] },
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

    // Calculate attendance rate for past events only
    const now = new Date();
    const pastEvents = events.filter(e => new Date(e.date) < now);
    
    // Get participations from past events
    const pastEventParticipations = pastEvents.flatMap(e => e.participations);
    
    // Expected attendees: those who registered, confirmed, or attended (excluding cancelled/waitlisted)
    const expectedAttendees = pastEventParticipations.filter(
      p => p.status === 'REGISTERED' || p.status === 'CONFIRMED' || p.status === 'ATTENDED'
    ).length;
    
    // Actual attendees: those who actually attended
    const actualAttendees = pastEventParticipations.filter(
      p => p.status === 'ATTENDED'
    ).length;

    const allFeedback = events.flatMap(e => e.feedback);
    const averageRating = allFeedback.length > 0
      ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
      : 0;

    const activeEvents = events.filter(
      e => e.status === 'active' && new Date(e.date) >= now
    ).length;

    // Attendance rate = actual attendees / expected attendees (for past events)
    const attendanceRate = expectedAttendees > 0
      ? Math.round((actualAttendees / expectedAttendees) * 100)
      : 0;

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
      const confirmedCount = event.participations.filter(
        p => p.status === 'CONFIRMED' || p.status === 'REGISTERED'
      ).length;

      return {
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location,
        status: event.status,
        maxParticipants: event.maxParticipants,
        currentParticipants: event._count.participations,
        confirmedCount,
      };
    });
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
      isRecurring: event.isRecurring,
      recurringPattern: event.recurringPattern,
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


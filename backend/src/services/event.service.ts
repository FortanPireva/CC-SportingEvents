import { prisma } from '../utils/prisma';
import { SportType, Event, Prisma } from '@prisma/client';

// Map frontend sport names to backend enum values
const sportTypeMapping: Record<string, SportType> = {
  'Basketball': SportType.BASKETBALL,
  'Soccer': SportType.FOOTBALL,
  'Football': SportType.FOOTBALL,
  'Tennis': SportType.TENNIS,
  'Volleyball': SportType.VOLLEYBALL,
  'Running': SportType.RUNNING,
  'Cycling': SportType.CYCLING,
  'Swimming': SportType.OTHER,
  'Yoga': SportType.OTHER,
  'Pilates': SportType.OTHER,
  'Boxing': SportType.OTHER,
  'Martial Arts': SportType.OTHER,
  'Golf': SportType.OTHER,
  'Badminton': SportType.OTHER,
  'Table Tennis': SportType.OTHER,
  'Cricket': SportType.OTHER,
  'Rugby': SportType.OTHER,
  'Hockey': SportType.OTHER,
  'Baseball': SportType.OTHER,
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


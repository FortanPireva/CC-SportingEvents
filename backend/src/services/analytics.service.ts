import { prisma } from '../utils/prisma';
import { ParticipationStatus } from '@prisma/client';

export interface OrganizerStats {
  eventsCreated: number;
  eventsCreatedThisMonth: number;
  totalParticipants: number;
  participantsThisWeek: number;
  averageRating: number;
  ratingChangeThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
}

export interface UserStats {
  eventsJoined: number;
  eventsJoinedThisMonth: number;
  hoursActive: number;
  hoursThisWeek: number;
  sportsTried: number;
  sportsTriedThisMonth: number;
  moneySpent: number;
  moneySpentThisMonth: number;
}

export interface RecentActivity {
  id: string;
  type: 'event_created' | 'event_joined' | 'review_received' | 'event_cancelled';
  message: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  sport: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  price?: number;
  skillLevel?: string;
  tags: string[];
  status: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DashboardAnalytics {
  stats: OrganizerStats | UserStats;
  upcomingEvents: UpcomingEvent[];
  recentActivity: RecentActivity[];
}

export interface PublicStats {
  totalUsers: number;
  totalEvents: number;
  sportTypesAvailable: number;
  uniqueLocations: number;
}

export class AnalyticsService {
  /**
   * Get public stats for the landing page (no auth required)
   */
  static async getPublicStats(): Promise<PublicStats> {
    const [totalUsers, totalEvents, sportTypes, locations] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.event.groupBy({ by: ['sportType'] }),
      prisma.event.findMany({
        distinct: ['location'],
        select: { location: true },
      }),
    ]);

    return {
      totalUsers,
      totalEvents,
      sportTypesAvailable: sportTypes.length,
      uniqueLocations: locations.length,
    };
  }

  /**
   * Get dashboard analytics for an organizer
   */
  static async getOrganizerAnalytics(userId: string): Promise<DashboardAnalytics> {
    const organizer = await prisma.organizer.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!organizer) {
      throw new Error('Organizer not found');
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get all events by this organizer
    const allEvents = await prisma.event.findMany({
      where: { organizerId: organizer.id },
      include: {
        participations: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        feedback: {
          select: { rating: true, createdAt: true },
        },
        _count: {
          select: { participations: true },
        },
      },
    });

    // Events created stats
    const eventsCreated = allEvents.length;
    const eventsCreatedThisMonth = allEvents.filter(
      (e) => e.createdAt >= startOfMonth
    ).length;

    // Participants stats
    const totalParticipants = allEvents.reduce(
      (sum, e) => sum + e._count.participations,
      0
    );
    const participantsThisWeek = allEvents.reduce((sum, event) => {
      const weekParticipants = event.participations.filter(
        (p) => p.registeredAt >= startOfWeek
      ).length;
      return sum + weekParticipants;
    }, 0);

    // Rating stats
    const allFeedback = allEvents.flatMap((e) => e.feedback);
    const averageRating =
      allFeedback.length > 0
        ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
        : 0;

    const feedbackThisMonth = allFeedback.filter(
      (f) => f.createdAt >= startOfMonth
    );
    const feedbackLastMonth = allFeedback.filter(
      (f) =>
        f.createdAt < startOfMonth &&
        f.createdAt >= new Date(now.getFullYear(), now.getMonth() - 1, 1)
    );

    const avgRatingThisMonth =
      feedbackThisMonth.length > 0
        ? feedbackThisMonth.reduce((sum, f) => sum + f.rating, 0) / feedbackThisMonth.length
        : averageRating;
    const avgRatingLastMonth =
      feedbackLastMonth.length > 0
        ? feedbackLastMonth.reduce((sum, f) => sum + f.rating, 0) / feedbackLastMonth.length
        : averageRating;
    const ratingChangeThisMonth = Number((avgRatingThisMonth - avgRatingLastMonth).toFixed(1));

    // Revenue calculation (from price in sponsorDetails)
    let totalRevenue = 0;
    let revenueThisMonth = 0;
    for (const event of allEvents) {
      const price = (event.sponsorDetails as any)?.price || 0;
      const registeredParticipants = event.participations.filter(
        (p) => p.status === ParticipationStatus.REGISTERED
      ).length;
      totalRevenue += price * registeredParticipants;

      const monthParticipants = event.participations.filter(
        (p) =>
          p.status === ParticipationStatus.REGISTERED &&
          p.registeredAt >= startOfMonth
      ).length;
      revenueThisMonth += price * monthParticipants;
    }

    const stats: OrganizerStats = {
      eventsCreated,
      eventsCreatedThisMonth,
      totalParticipants,
      participantsThisWeek,
      averageRating: Number(averageRating.toFixed(1)), // Keep 1-10 scale
      ratingChangeThisMonth: Number(ratingChangeThisMonth.toFixed(1)),
      totalRevenue,
      revenueThisMonth,
    };

    // Get upcoming events
    const upcomingEvents = await this.getUpcomingEventsForOrganizer(organizer.id);

    // Get recent activity
    const recentActivity = await this.getRecentActivityForOrganizer(organizer.id);

    return {
      stats,
      upcomingEvents,
      recentActivity,
    };
  }

  /**
   * Get dashboard analytics for a regular user
   */
  static async getUserAnalytics(userId: string): Promise<DashboardAnalytics> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        participations: {
          include: {
            event: {
              include: {
                organizer: {
                  include: {
                    user: {
                      select: { id: true, name: true, email: true },
                    },
                  },
                },
                participations: {
                  include: {
                    user: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Events joined stats
    const activeParticipations = user.participations.filter(
      (p) => p.status === ParticipationStatus.REGISTERED
    );
    const eventsJoined = activeParticipations.length;
    const eventsJoinedThisMonth = activeParticipations.filter(
      (p) => p.registeredAt >= startOfMonth
    ).length;

    // Hours active (estimate based on event duration)
    let hoursActive = 0;
    let hoursThisWeek = 0;
    for (const participation of activeParticipations) {
      const event = participation.event;
      const timeParts = event.time?.split(' - ') || [];
      if (timeParts.length === 2) {
        const startParts = timeParts[0].split(':').map(Number);
        const endParts = timeParts[1].split(':').map(Number);
        const duration =
          endParts[0] - startParts[0] + (endParts[1] - startParts[1]) / 60;
        if (duration > 0) {
          hoursActive += duration;
          if (event.date >= startOfWeek) {
            hoursThisWeek += duration;
          }
        }
      }
    }

    // Sports tried
    const allSports = new Set(activeParticipations.map((p) => p.event.sportType));
    const sportsTried = allSports.size;
    const sportsThisMonth = new Set(
      activeParticipations
        .filter((p) => p.registeredAt >= startOfMonth)
        .map((p) => p.event.sportType)
    );
    const sportsTriedThisMonth = sportsThisMonth.size;

    // Money spent on events
    let moneySpent = 0;
    let moneySpentThisMonth = 0;
    for (const participation of activeParticipations) {
      const event = participation.event;
      const price = (event.sponsorDetails as any)?.price || 0;
      moneySpent += price;
      if (participation.registeredAt >= startOfMonth) {
        moneySpentThisMonth += price;
      }
    }

    const stats: UserStats = {
      eventsJoined,
      eventsJoinedThisMonth,
      hoursActive: Math.round(hoursActive),
      hoursThisWeek: Math.round(hoursThisWeek),
      sportsTried,
      sportsTriedThisMonth,
      moneySpent: Math.round(moneySpent * 100) / 100, // Round to 2 decimal places
      moneySpentThisMonth: Math.round(moneySpentThisMonth * 100) / 100,
    };

    // Get upcoming events the user has joined or might be interested in
    const upcomingEvents = await this.getUpcomingEventsForUser(userId);

    // Get recent activity
    const recentActivity = await this.getRecentActivityForUser(userId);

    return {
      stats,
      upcomingEvents,
      recentActivity,
    };
  }

  /**
   * Get upcoming events for an organizer
   */
  private static async getUpcomingEventsForOrganizer(
    organizerId: string
  ): Promise<UpcomingEvent[]> {
    const events = await prisma.event.findMany({
      where: {
        organizerId,
        date: { gte: new Date() },
        status: { not: 'cancelled' },
      },
      include: {
        organizer: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { participations: true },
        },
      },
      orderBy: { date: 'asc' },
      take: 5,
    });

    return events.map((event) => this.formatUpcomingEvent(event));
  }

  /**
   * Get upcoming events for a user (events they've joined + recommendations)
   */
  private static async getUpcomingEventsForUser(
    userId: string
  ): Promise<UpcomingEvent[]> {
    // Get events the user has joined
    const joinedEvents = await prisma.event.findMany({
      where: {
        date: { gte: new Date() },
        status: { not: 'cancelled' },
        participations: {
          some: {
            userId,
            status: ParticipationStatus.REGISTERED,
          },
        },
      },
      include: {
        organizer: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { participations: true },
        },
      },
      orderBy: { date: 'asc' },
      take: 5,
    });

    // If less than 5, get some recommended events
    if (joinedEvents.length < 5) {
      const joinedEventIds = joinedEvents.map((e) => e.id);
      const recommendedEvents = await prisma.event.findMany({
        where: {
          id: { notIn: joinedEventIds },
          date: { gte: new Date() },
          status: 'active',
        },
        include: {
          organizer: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          _count: {
            select: { participations: true },
          },
        },
        orderBy: { date: 'asc' },
        take: 5 - joinedEvents.length,
      });

      return [...joinedEvents, ...recommendedEvents].map((event) =>
        this.formatUpcomingEvent(event)
      );
    }

    return joinedEvents.map((event) => this.formatUpcomingEvent(event));
  }

  /**
   * Get recent activity for an organizer
   */
  private static async getRecentActivityForOrganizer(
    organizerId: string
  ): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Recent participations in organizer's events
    const recentParticipations = await prisma.participation.findMany({
      where: {
        event: { organizerId },
        status: ParticipationStatus.REGISTERED,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        event: {
          select: { id: true, name: true },
        },
      },
      orderBy: { registeredAt: 'desc' },
      take: 5,
    });

    for (const p of recentParticipations) {
      activities.push({
        id: p.id,
        type: 'event_joined',
        message: `joined ${p.event.name}`,
        userName: p.user.name,
        userAvatar: p.user.avatar || undefined,
        timestamp: p.registeredAt,
      });
    }

    // Recent feedback on organizer's events
    const recentFeedback = await prisma.feedback.findMany({
      where: {
        event: { organizerId },
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        event: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    for (const f of recentFeedback) {
      activities.push({
        id: f.id,
        type: 'review_received',
        message: `left a ${f.rating}-star review`,
        userName: f.user.name,
        userAvatar: f.user.avatar || undefined,
        timestamp: f.createdAt,
      });
    }

    // Sort by timestamp and take top 5
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  }

  /**
   * Get recent activity for a user
   */
  private static async getRecentActivityForUser(
    userId: string
  ): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // User's recent event participations
    const recentParticipations = await prisma.participation.findMany({
      where: {
        userId,
        status: ParticipationStatus.REGISTERED,
      },
      include: {
        event: {
          include: {
            organizer: {
              include: {
                user: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
      take: 5,
    });

    for (const p of recentParticipations) {
      activities.push({
        id: p.id,
        type: 'event_created',
        message: `created ${p.event.name}`,
        userName: p.event.organizer.user.name,
        timestamp: p.registeredAt,
      });
    }

    // Recent notifications for the user
    const recentNotifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    for (const n of recentNotifications) {
      activities.push({
        id: n.id,
        type: n.type as RecentActivity['type'],
        message: n.message,
        userName: 'System',
        timestamp: n.createdAt,
      });
    }

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  }

  /**
   * Format event for API response
   */
  private static formatUpcomingEvent(event: any): UpcomingEvent {
    const sponsorDetails = event.sponsorDetails || {};
    const timeParts = event.time?.split(' - ') || ['', ''];

    return {
      id: event.id,
      title: event.name,
      description: event.description,
      sport: event.sportType,
      date: event.date,
      startTime: timeParts[0],
      endTime: sponsorDetails.endTime || timeParts[1] || '',
      location: event.location,
      maxParticipants: event.maxParticipants,
      currentParticipants: event._count?.participations || 0,
      price: sponsorDetails.price,
      skillLevel: sponsorDetails.skillLevel,
      tags: sponsorDetails.tags || [],
      status: event.status,
      organizer: {
        id: event.organizer.id,
        name: event.organizer.user.name,
        email: event.organizer.user.email,
      },
    };
  }
}


import { api, ApiResponse } from '@/lib/api';

// Event types matching the Prisma schema
export type SportType = 'FOOTBALL' | 'BASKETBALL' | 'VOLLEYBALL' | 'TENNIS' | 'RUNNING' | 'CYCLING' | 'OTHER';

export interface EventOrganizer {
  id: string;
  userId: string;
  name: string;
  email: string;
  contactInfo?: string;
}

export interface EventParticipant {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: 'REGISTERED';
  registeredAt: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  startTime: string;
  endTime: string;
  location: string;
  latitude?: number;
  longitude?: number;
  sportType: SportType;
  maxParticipants: number;
  currentParticipants: number;
  isRecurring: boolean;
  recurringPattern?: string;
  isSponsored: boolean;
  imageUrl?: string;
  status: string;
  price?: number;
  skillLevel?: string;
  tags: string[];
  organizer?: EventOrganizer;
  participants?: EventParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  name: string;
  description: string;
  sportType: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  isRecurring?: boolean;
  recurringPattern?: string;
  imageUrl?: string;
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
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EventStatistics {
  totalParticipants: number;
  registeredCount: number;
  spotsRemaining: number;
  totalFeedback: number;
  averageRating: number;
}

export interface EventWithParticipation extends Event {
  participationStatus: 'REGISTERED';
  registeredAt: string;
}

export interface ParticipatingEventsResponse {
  events: EventWithParticipation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Participation {
  id: string;
  status: 'REGISTERED';
  userId: string;
  eventId: string;
  registeredAt: string;
}

export interface EventParticipantDetail {
  id: string;
  participationId: string;
  userId: string;
  name: string;
  email: string;
  location?: string;
  preferences?: string[];
  status: 'REGISTERED';
  registeredAt: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventStatus: string;
  eventMaxParticipants: number;
  eventCurrentParticipants: number;
}

export interface ParticipantsResponse {
  participants: EventParticipantDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrganizerStatistics {
  totalParticipants: number;
  activeEvents: number;
  attendanceRate: number;
  averageRating: number;
}

export interface EventSummary {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  maxParticipants: number;
  currentParticipants: number;
  registeredCount: number;
}

export interface ParticipantFilters {
  eventId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Feedback {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  event?: {
    id: string;
    name: string;
  };
}

export interface FeedbackEvent {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  sportType: string;
  imageUrl?: string;
  organizerName: string;
  registeredAt: string;
  feedback: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export const eventService = {
  /**
   * Get all events with optional filters
   */
  async getEvents(filters?: EventFilters): Promise<ApiResponse<EventsResponse>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.sportType) params.append('sportType', filters.sportType);
      if (filters.location) params.append('location', filters.location);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }
    const queryString = params.toString();
    return api.get<EventsResponse>(`/events${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<ApiResponse<{ event: Event }>> {
    return api.get<{ event: Event }>(`/events/${id}`);
  },

  /**
   * Get events created by the authenticated organizer
   */
  async getMyEvents(page?: number, limit?: number): Promise<ApiResponse<EventsResponse>> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const queryString = params.toString();
    return api.get<EventsResponse>(`/events/my-events${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventData): Promise<ApiResponse<{ event: Event }>> {
    return api.post<{ event: Event }>('/events', data);
  },

  /**
   * Update an event
   */
  async updateEvent(id: string, data: UpdateEventData): Promise<ApiResponse<{ event: Event }>> {
    return api.put<{ event: Event }>(`/events/${id}`, data);
  },

  /**
   * Cancel an event (soft delete)
   */
  async cancelEvent(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(`/events/${id}/cancel`, {});
  },

  /**
   * Delete an event permanently
   */
  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/events/${id}`);
  },

  /**
   * Get event statistics
   */
  async getEventStatistics(id: string): Promise<ApiResponse<{ statistics: EventStatistics }>> {
    return api.get<{ statistics: EventStatistics }>(`/events/${id}/statistics`);
  },

  /**
   * Join an event as a participant
   */
  async joinEvent(id: string): Promise<ApiResponse<{ participation: Participation }>> {
    return api.post<{ participation: Participation }>(`/events/${id}/join`, {});
  },

  /**
   * Leave an event (cancel participation)
   */
  async leaveEvent(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(`/events/${id}/leave`, {});
  },

  /**
   * Get events user is participating in
   */
  async getParticipatingEvents(page?: number, limit?: number): Promise<ApiResponse<ParticipatingEventsResponse>> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const queryString = params.toString();
    return api.get<ParticipatingEventsResponse>(`/events/participating${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get user's participation status for multiple events
   */
  async getParticipationStatus(eventIds: string[]): Promise<ApiResponse<{ participations: Record<string, string> }>> {
    return api.post<{ participations: Record<string, string> }>('/events/participation-status', { eventIds });
  },

  /**
   * Get all participants for organizer's events
   */
  async getMyParticipants(filters?: ParticipantFilters): Promise<ApiResponse<ParticipantsResponse>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.eventId) params.append('eventId', filters.eventId);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }
    const queryString = params.toString();
    return api.get<ParticipantsResponse>(`/events/my-participants${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get organizer statistics summary
   */
  async getMyStatistics(): Promise<ApiResponse<{ statistics: OrganizerStatistics }>> {
    return api.get<{ statistics: OrganizerStatistics }>('/events/my-statistics');
  },

  /**
   * Get organizer events with participant summary
   */
  async getMyEventsSummary(): Promise<ApiResponse<{ events: EventSummary[] }>> {
    return api.get<{ events: EventSummary[] }>('/events/my-events-summary');
  },

  /**
   * Submit feedback for an event (rating 1-10)
   */
  async submitFeedback(eventId: string, rating: number, comment: string): Promise<ApiResponse<{ feedback: Feedback }>> {
    return api.post<{ feedback: Feedback }>(`/events/${eventId}/feedback`, { rating, comment });
  },

  /**
   * Get user's feedback for a specific event
   */
  async getUserFeedback(eventId: string): Promise<ApiResponse<{ feedback: Feedback | null }>> {
    return api.get<{ feedback: Feedback | null }>(`/events/${eventId}/feedback`);
  },

  /**
   * Get all events user can provide feedback for
   */
  async getMyFeedbackEvents(): Promise<ApiResponse<{ events: FeedbackEvent[] }>> {
    return api.get<{ events: FeedbackEvent[] }>('/events/my-feedback-events');
  },
};

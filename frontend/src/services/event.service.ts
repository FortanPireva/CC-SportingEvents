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
  status: 'REGISTERED' | 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED' | 'ATTENDED';
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
  confirmedCount: number;
  waitlistedCount: number;
  cancelledCount: number;
  spotsRemaining: number;
  totalFeedback: number;
  averageRating: number;
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
};

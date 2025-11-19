import { apiClient } from './api.service';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  sportType: string;
  maxParticipants: number;
  organizerId: string;
  imageUrl?: string;
}

export interface EventFilters {
  sportType?: string;
  location?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export const eventService = {
  async getEvents(filters: EventFilters) {
    const response = await apiClient.get('/events', { params: filters });
    return response.data;
  },

  async getEventById(id: string) {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  async createEvent(data: Partial<Event>) {
    const response = await apiClient.post('/events', data);
    return response.data;
  },

  async updateEvent(id: string, data: Partial<Event>) {
    const response = await apiClient.put(`/events/${id}`, data);
    return response.data;
  },

  async cancelEvent(id: string) {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },

  async getEventStatistics(id: string) {
    const response = await apiClient.get(`/events/${id}/statistics`);
    return response.data;
  },
};


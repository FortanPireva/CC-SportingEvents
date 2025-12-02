import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/services/api.service';

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
  connectionsMade: number;
  connectionsThisMonth: number;
}

export interface RecentActivity {
  id: string;
  type: 'event_created' | 'event_joined' | 'review_received' | 'event_cancelled';
  message: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  sport: string;
  date: string;
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
  userType: 'organizer' | 'user';
}

interface UseAnalyticsReturn {
  analytics: DashboardAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedFetch = useRef(false);

  const fetchAnalytics = useCallback(async () => {
    // Check if user is authenticated before making request
    const token = localStorage.getItem('cc_auth_token');
    if (!token) {
      setIsLoading(false);
      setError('Not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get('/analytics/dashboard');
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch analytics');
      }
    } catch (err: any) {
      // Don't set error for 401 - let the interceptor handle redirect
      if (err.response?.status === 401) {
        return;
      }
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch once on mount
    if (!hasAttemptedFetch.current) {
      hasAttemptedFetch.current = true;
      fetchAnalytics();
    }
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}

// Type guard to check if stats are organizer stats
export function isOrganizerStats(stats: OrganizerStats | UserStats): stats is OrganizerStats {
  return 'eventsCreated' in stats;
}

// Type guard to check if stats are user stats
export function isUserStats(stats: OrganizerStats | UserStats): stats is UserStats {
  return 'eventsJoined' in stats;
}


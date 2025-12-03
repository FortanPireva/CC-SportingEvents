'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  DollarSign,
  Activity,
  Plus,
  Star,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics, isOrganizerStats, isUserStats, UpcomingEvent, RecentActivity } from '@/hooks/useAnalytics';
import { eventService, Event } from '@/services/event.service';

// Helper to format relative time
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

// Helper to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { analytics, isLoading, error, refetch } = useAnalytics();
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Fetch organizer's events to calculate revenue dynamically
  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      if (user?.type === 'organizer' || analytics?.userType === 'organizer') {
        setEventsLoading(true);
        try {
          const response = await eventService.getMyEvents(1, 100);
          if (response.success && response.data) {
            setOrganizerEvents(response.data.events);
          }
        } catch (error) {
          console.error('Failed to fetch organizer events:', error);
        } finally {
          setEventsLoading(false);
        }
      }
    };

    fetchOrganizerEvents();
  }, [user?.type, analytics?.userType]);

  // Calculate revenue from events (price * currentParticipants)
  const calculateTotalRevenue = () => {
    return organizerEvents.reduce((sum, event) => sum + (event.price || 0) * event.currentParticipants, 0);
  };

  // Calculate this month's revenue
  const calculateRevenueThisMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return organizerEvents
      .filter(event => new Date(event.createdAt) >= startOfMonth)
      .reduce((sum, event) => sum + (event.price || 0) * event.currentParticipants, 0);
  };

  // Build stats array based on user type and analytics data
  const getStats = () => {
    if (!analytics) return [];

    if (analytics.userType === 'organizer' && isOrganizerStats(analytics.stats)) {
      const stats = analytics.stats;
      const totalRevenue = calculateTotalRevenue();
      const revenueThisMonth = calculateRevenueThisMonth();
      return [
        { 
          title: 'Events Created', 
          value: stats.eventsCreated.toString(), 
          icon: Calendar, 
          trend: `+${stats.eventsCreatedThisMonth} this month`,
          color: 'text-blue-600'
        },
        { 
          title: 'Total Participants', 
          value: stats.totalParticipants.toString(), 
          icon: Users, 
          trend: `+${stats.participantsThisWeek} this month`,
          color: 'text-black-600' 
        },
        { 
          title: 'Average Rating', 
          value: stats.averageRating.toFixed(1), 
          icon: Star, 
          trend: `From feedback (1-10)`,
          color: 'text-yellow-600' 
        },
        { 
          title: 'Revenue Generated', 
          value: `$${totalRevenue.toFixed(2)}`, 
          icon: DollarSign, 
          trend: `+$${revenueThisMonth.toFixed(2)} this month`,
          color: 'text-green-600' 
        }
      ];
    } else if (isUserStats(analytics.stats)) {
      const stats = analytics.stats;
      return [
        { 
          title: 'Events Joined', 
          value: stats.eventsJoined.toString(), 
          icon: Calendar, 
          trend: `+${stats.eventsJoinedThisMonth} this month`,
          color: 'text-purple-600'  
        },
        { 
          title: 'Hours Active', 
          value: stats.hoursActive.toString(), 
          icon: Clock, 
          trend: `+${stats.hoursThisWeek} this month`,
          color: 'text-black-600'  
        },
        { 
          title: 'Sports Tried', 
          value: stats.sportsTried.toString(), 
          icon: Activity, 
          trend: `+${stats.sportsTriedThisMonth} this month`,
          color: 'text-blue-600'  
        },
        { 
          title: 'Money Spent', 
          value: `$${stats.moneySpent.toFixed(2)}`, 
          icon: DollarSign, 
          trend: `+$${stats.moneySpentThisMonth.toFixed(2)} this month`,
          color: 'text-green-600' 
        }
      ];
    }

    return [];
  };

  const stats = getStats();
  const isOrganizer = analytics?.userType === 'organizer' || user?.type === 'organizer';

  // Loading skeleton
  if (isLoading || (isOrganizer && eventsLoading)) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          {/* Welcome Section Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32 mt-4 md:mt-0" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refetch}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 mt-1">
              {isOrganizer 
                ? "Here's what's happening with your events"
                : "Ready to get active? Here are your upcoming activities"
              }
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="w-full md:w-auto" onClick={() => isOrganizer ? navigate('/dashboard/create-event') : navigate('/dashboard/events')}>
              <Plus className="mr-2 h-4 w-4" />
              {isOrganizer ? 'Create Event' : 'Find Events'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={"h-4 w-4 " + stat.color} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {isOrganizer ? 'Your Upcoming Events' : 'Upcoming Events'}
                  </CardTitle>
                  <CardDescription>
                    {isOrganizer 
                      ? 'Events you\'re organizing' 
                      : 'Events you\'ve joined or might be interested in'
                    }
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.upcomingEvents && analytics.upcomingEvents.length > 0 ? (
                  analytics.upcomingEvents.map((event: UpcomingEvent) => (
                    <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Activity className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {event.title}
                            </h4>
                            <p className="text-sm text-gray-500 line-clamp-1">{event.description}</p>
                          </div>
                          <Badge variant="outline">{event.sport}</Badge>
                        </div>
                        <div className="mt-2 flex items-center flex-wrap gap-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {event.startTime} - {event.endTime}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-3 w-3" />
                            {event.currentParticipants}/{event.maxParticipants}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming events</p>
                    <p className="text-sm mt-1">
                      {isOrganizer ? 'Create your first event to get started!' : 'Browse events to find activities near you.'}
                    </p>
                  </div>
                )}
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => isOrganizer ? navigate('/dashboard/create-event') : navigate('/dashboard/events')}
                  >
                    {isOrganizer ? 'Create New Event' : 'Browse More Events'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isOrganizer ? (
                  <>
                    <Button className="w-full justify-start" onClick={() => navigate('/dashboard/create-event')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/dashboard/participants')}>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Participants
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full justify-start" onClick={() => navigate('/dashboard/events')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Find Events
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/dashboard/community')}>
                      <Users className="mr-2 h-4 w-4" />
                      Join Community
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/dashboard/reviews')}>
                      <Star className="mr-2 h-4 w-4" />
                      Leave Review
                    </Button>
                  </> 
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity: RecentActivity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        {activity.userAvatar && <AvatarImage src={activity.userAvatar} />}
                        <AvatarFallback>{getInitials(activity.userName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.userName}</span> {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

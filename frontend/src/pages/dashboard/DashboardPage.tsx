'use client';

import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  TrendingUp,
  Activity,
  Plus,
  Star,
  ArrowRight
} from 'lucide-react';
import { Event } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();

  // Mock data for demonstration
  const upcomingEvents: Event[] = [
    {
      id: '1',
      title: 'Basketball Tournament',
      description: 'Weekly basketball tournament for all skill levels',
      sport: 'Basketball',
      organizer: { 
        id: '2', 
        email: 'john@example.com', 
        name: 'John Smith', 
        type: 'organizer',
        joinedAt: new Date()
      },
      date: new Date('2024-01-15'),
      startTime: '18:00',
      endTime: '20:00',
      location: 'Community Sports Center',
      maxParticipants: 16,
      currentParticipants: 12,
      participants: [],
      skill_level: 'all',
      status: 'upcoming',
      tags: ['competitive', 'tournament'],
      created_at: new Date(),
      price: 15
    },
    {
      id: '2',
      title: 'Morning Yoga Session',
      description: 'Relaxing yoga session to start your day',
      sport: 'Yoga',
      organizer: { 
        id: '3', 
        email: 'sarah@example.com', 
        name: 'Sarah Johnson', 
        type: 'organizer',
        joinedAt: new Date()
      },
      date: new Date('2024-01-16'),
      startTime: '07:00',
      endTime: '08:30',
      location: 'Riverside Park',
      maxParticipants: 20,
      currentParticipants: 8,
      participants: [],
      skill_level: 'beginner',
      status: 'upcoming',
      tags: ['wellness', 'outdoor'],
      created_at: new Date()
    }
  ];

  const stats = user?.type === 'organizer' 
    ? [
        { title: 'Events Created', value: '12', icon: Calendar, trend: '+2 this month' },
        { title: 'Total Participants', value: '156', icon: Users, trend: '+23 this week' },
        { title: 'Average Rating', value: '4.8', icon: Star, trend: '+0.2 this month' },
        { title: 'Revenue', value: '$1,240', icon: TrendingUp, trend: '+$320 this month' }
      ]
    : [
        { title: 'Events Joined', value: '8', icon: Calendar, trend: '+2 this month' },
        { title: 'Hours Active', value: '24', icon: Clock, trend: '+6 this week' },
        { title: 'Sports Tried', value: '5', icon: Activity, trend: '+1 this month' },
        { title: 'Friends Made', value: '12', icon: Users, trend: '+3 this month' }
      ];

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
              {user?.type === 'organizer' 
                ? "Here's what's happening with your events"
                : "Ready to get active? Here are your upcoming activities"
              }
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {user?.type === 'organizer' ? 'Create Event' : 'Find Events'}
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
                <stat.icon className="h-4 w-4 text-muted-foreground" />
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
                    {user?.type === 'organizer' ? 'Your Upcoming Events' : 'Upcoming Events'}
                  </CardTitle>
                  <CardDescription>
                    {user?.type === 'organizer' 
                      ? 'Events you\'re organizing' 
                      : 'Events you\'ve joined or might be interested in'
                    }
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event) => (
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
                          <p className="text-sm text-gray-500">{event.description}</p>
                        </div>
                        <Badge variant="outline">{event.sport}</Badge>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {event.date.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {event.startTime}
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
                ))}
                <div className="text-center pt-4">
                  <Button variant="outline" className="w-full">
                    {user?.type === 'organizer' ? 'Create New Event' : 'Browse More Events'}
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
                {user?.type === 'organizer' ? (
                  <>
                    <Button className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Participants
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MapPin className="mr-2 h-4 w-4" />
                      Book Venue
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Find Events
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Join Community
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
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
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">John Smith</span> created Basketball Tournament
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Sarah Johnson</span> joined your yoga session
                    </p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150" />
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Mike Rodriguez</span> left a 5-star review
                    </p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
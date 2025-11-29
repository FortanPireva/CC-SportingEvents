'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Users, MapPin, Clock, Search, Filter, Star, DollarSign, TrendingUp, Eye, CreditCard as Edit, Trash2, Plus, MoveHorizontal as MoreHorizontal, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle } from 'lucide-react';
import { mockEvents, mockUsers } from '@/lib/mockData';
import { Event } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export default function MyEventsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Filter events to show only those organized by the current user
  const myEvents = mockEvents.filter(event => event.organizer.id === user?.id || event.organizer.email.includes('organizer'));
  
  const filterEvents = (events: Event[]) => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.sport.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'participants':
          return b.currentParticipants - a.currentParticipants;
        case 'revenue':
          return (b.price || 0) * b.currentParticipants - (a.price || 0) * a.currentParticipants;
        default:
          return 0;
      }
    });
  };

  const filteredEvents = filterEvents(myEvents);
  const upcomingEvents = filteredEvents.filter(event => event.status === 'upcoming');
  const ongoingEvents = filteredEvents.filter(event => event.status === 'ongoing');
  const completedEvents = filteredEvents.filter(event => event.status === 'completed');
  const cancelledEvents = filteredEvents.filter(event => event.status === 'cancelled');

  const stats = [
    { 
      title: 'Total Events', 
      value: myEvents.length.toString(), 
      icon: Calendar, 
      trend: '+3 this month',
      color: 'text-blue-600'
    },
    { 
      title: 'Total Participants', 
      value: myEvents.reduce((sum, event) => sum + event.currentParticipants, 0).toString(), 
      icon: Users, 
      trend: '+47 this week',
      color: 'text-green-600'
    },
    { 
      title: 'Revenue Generated', 
      value: `$${myEvents.reduce((sum, event) => sum + (event.price || 0) * event.currentParticipants, 0)}`, 
      icon: DollarSign, 
      trend: '+$890 this month',
      color: 'text-purple-600'
    },
    { 
      title: 'Average Rating', 
      value: '4.8', 
      icon: Star, 
      trend: '+0.2 this month',
      color: 'text-yellow-600'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ongoing':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const EventCard = ({ event }: { event: Event }) => {
    const revenue = (event.price || 0) * event.currentParticipants;
    const fillRate = Math.round((event.currentParticipants / event.maxParticipants) * 100);
    
    return (
      <Card className="hover:shadow-lg transition-shadow group">
        <div className="relative">
          {event.image && (
            <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Badge className={getStatusColor(event.status)}>
              {getStatusIcon(event.status)}
              <span className="ml-1 capitalize">{event.status}</span>
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{event.title}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {event.description}
              </CardDescription>
            </div>
            <div className="flex space-x-1 ml-2">
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-2 h-4 w-4" />
                {event.date.toLocaleDateString()}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="mr-2 h-4 w-4" />
                {event.startTime}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="mr-2 h-4 w-4" />
                {event.location}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="mr-2 h-4 w-4" />
                {event.currentParticipants}/{event.maxParticipants}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Capacity</span>
                <span className="font-medium">{fillRate}% filled</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    fillRate >= 90 ? 'bg-red-500' : 
                    fillRate >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${fillRate}%` }}
                ></div>
              </div>
            </div>
            
            {event.price && (
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-primary">${event.price}</span> per person
                </div>
                <div className="text-sm font-medium text-green-600">
                  ${revenue} revenue
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-3 border-t">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all your organized events
            </p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create New Event
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="participants">Participants</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="all">
              All ({filteredEvents.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="ongoing">
              Ongoing ({ongoingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedEvents.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledEvents.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Create your first event to get started with organizing sports activities.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="ongoing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="cancelled" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cancelledEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
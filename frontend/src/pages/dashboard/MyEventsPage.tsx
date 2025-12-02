'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Users, MapPin, Clock, Search, Star, DollarSign, TrendingUp, Eye, Trash2, Plus, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, Loader2 } from 'lucide-react';
import { eventService, Event } from '@/services/event.service';
import { toast } from 'sonner';

export default function MyEventsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch organizer's events
  useEffect(() => {
    const fetchMyEvents = async () => {
      setIsLoading(true);
      try {
        const response = await eventService.getMyEvents(1, 100);
        if (response.success && response.data) {
          setEvents(response.data.events);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.error('Failed to load your events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  
  // Calculate event status based on date, time, and backend status
  const getEventStatus = (event: Event): EventStatus => {
    // If explicitly cancelled or completed in backend, use that
    if (event.status === 'cancelled') return 'cancelled';
    if (event.status === 'completed') return 'completed';
    
    const now = new Date();
    const eventDate = new Date(event.date);
    
    // Parse start and end times
    const [startHour, startMin] = (event.startTime || '00:00').split(':').map(Number);
    const [endHour, endMin] = (event.endTime || '23:59').split(':').map(Number);
    
    // Create datetime objects for event start and end
    const eventStart = new Date(eventDate);
    eventStart.setHours(startHour, startMin, 0, 0);
    
    const eventEnd = new Date(eventDate);
    eventEnd.setHours(endHour, endMin, 0, 0);
    
    // If event end time is before start time, assume it ends the next day
    if (eventEnd <= eventStart) {
      eventEnd.setDate(eventEnd.getDate() + 1);
    }
    
    // Determine status based on current time
    if (now < eventStart) {
      return 'upcoming';
    } else if (now >= eventStart && now <= eventEnd) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  };

  const filterEvents = (eventsList: Event[]) => {
    return eventsList.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.sportType.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    }).sort((a, b) => {
      // Sort by date ascending
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  const filteredEvents = filterEvents(events);
  const upcomingEvents = filteredEvents.filter(event => getEventStatus(event) === 'upcoming');
  const ongoingEvents = filteredEvents.filter(event => getEventStatus(event) === 'ongoing');
  const completedEvents = filteredEvents.filter(event => getEventStatus(event) === 'completed');
  const cancelledEvents = filteredEvents.filter(event => getEventStatus(event) === 'cancelled');

  const stats = [
    { 
      title: 'Total Events', 
      value: events.length.toString(), 
      icon: Calendar, 
      trend: `${events.filter(e => getEventStatus(e) === 'upcoming').length} upcoming`,
      color: 'text-blue-600'
    },
    { 
      title: 'Total Participants', 
      value: events.reduce((sum, event) => sum + event.currentParticipants, 0).toString(), 
      icon: Users, 
      trend: 'Across all events',
      color: 'text-green-600'
    },
    { 
      title: 'Revenue Generated', 
      value: `$${events.reduce((sum, event) => sum + (event.price || 0) * event.currentParticipants, 0).toFixed(2)}`, 
      icon: DollarSign, 
      trend: 'Total earnings',
      color: 'text-purple-600'
    },
    { 
      title: 'Avg. Capacity', 
      value: events.length > 0 
        ? `${Math.round(events.reduce((sum, e) => sum + (e.currentParticipants / e.maxParticipants * 100), 0) / events.length)}%` 
        : '0%', 
      icon: Star, 
      trend: 'Fill rate',
      color: 'text-yellow-600'
    }
  ];

  const getStatusIcon = (event: Event) => {
    const status = getEventStatus(event);
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

  const getStatusColor = (event: Event) => {
    const status = getEventStatus(event);
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

  const handleCancelEvent = async (event: Event) => {
    try {
      const response = await eventService.cancelEvent(event.id);
      if (response.success) {
        setEvents(prev => prev.map(e => 
          e.id === event.id ? { ...e, status: 'cancelled' } : e
        ));
        toast.success('Event cancelled successfully');
      }
    } catch (error) {
      console.error('Failed to cancel event:', error);
      toast.error('Failed to cancel event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await eventService.deleteEvent(eventToDelete.id);
      if (response.success) {
        setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
        toast.success('Event deleted successfully');
        setDeleteDialogOpen(false);
        setEventToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const EventCard = ({ event }: { event: Event }) => {
    const revenue = (event.price || 0) * event.currentParticipants;
    const fillRate = Math.round((event.currentParticipants / event.maxParticipants) * 100);
    const eventDate = new Date(event.date);
    
    return (
      <Card className="hover:shadow-lg transition-shadow group">
        <div className="relative">
          {event.imageUrl && (
            <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
              <img 
                src={event.imageUrl} 
                alt={event.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          {!event.imageUrl && (
            <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
              <Calendar className="h-16 w-16 text-primary/40" />
            </div>
          )}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Badge className={getStatusColor(event)}>
              {getStatusIcon(event)}
              <span className="ml-1 capitalize">{getEventStatus(event)}</span>
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{event.name}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {event.description}
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              {event.sportType}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-2 h-4 w-4" />
                {eventDate.toLocaleDateString()}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="mr-2 h-4 w-4" />
                {event.startTime}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="mr-2 h-4 w-4" />
                <span className="truncate">{event.location}</span>
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
            
            {event.price !== undefined && event.price > 0 && (
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-primary">${event.price}</span> per person
                </div>
                <div className="text-sm font-medium text-green-600">
                  ${revenue.toFixed(2)} revenue
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-3 border-t">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                {getEventStatus(event) !== 'cancelled' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCancelEvent(event)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEventToDelete(event);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-gray-600">Loading your events...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
          <Button className="mt-4 md:mt-0" onClick={() => navigate('/dashboard/create-event')}>
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

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, description, or sport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
                    {events.length === 0 
                      ? "Create your first event to get started with organizing sports activities."
                      : "Try adjusting your filters to find events."}
                  </p>
                  <Button onClick={() => navigate('/dashboard/create-event')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-6">
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Create a new event to get started.
                  </p>
                  <Button onClick={() => navigate('/dashboard/create-event')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="ongoing" className="space-y-6">
            {ongoingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No ongoing events</h3>
                  <p className="text-gray-600 text-center">
                    Events that are currently in progress will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-6">
            {completedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed events</h3>
                  <p className="text-gray-600 text-center">
                    Completed events will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="cancelled" className="space-y-6">
            {cancelledEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cancelledEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cancelled events</h3>
                  <p className="text-gray-600 text-center">
                    Cancelled events will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Event</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{eventToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteEvent}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

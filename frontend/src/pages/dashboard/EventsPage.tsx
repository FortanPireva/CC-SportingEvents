'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  Search,
  Filter,
  Star,
  DollarSign,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  Loader2,
  Plus
} from 'lucide-react';
import { eventService, Event, EventWithParticipation } from '@/services/event.service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function EventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinedEvents, setJoinedEvents] = useState<EventWithParticipation[]>([]);
  const [participationStatus, setParticipationStatus] = useState<Record<string, string>>({});
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);
  const [leavingEventId, setLeavingEventId] = useState<string | null>(null);

  // Fetch all events and participation status
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await eventService.getEvents({ 
          status: 'active',
          limit: 100 
        });
        if (response.success && response.data) {
          setEvents(response.data.events);
          
          // If user is logged in, fetch participation status
          if (user) {
            const eventIds = response.data.events.map(e => e.id);
            if (eventIds.length > 0) {
              const statusResponse = await eventService.getParticipationStatus(eventIds);
              if (statusResponse.success && statusResponse.data) {
                setParticipationStatus(statusResponse.data.participations);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Fetch events user is participating in
  useEffect(() => {
    const fetchJoinedEvents = async () => {
      if (!user) {
        setJoinedEvents([]);
        return;
      }
      
      try {
        const response = await eventService.getParticipatingEvents(1, 100);
        if (response.success && response.data) {
          setJoinedEvents(response.data.events);
        }
      } catch (error) {
        console.error('Failed to fetch joined events:', error);
      }
    };

    fetchJoinedEvents();
  }, [user]);

  // Handle joining an event
  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      toast.error('Please sign in to join events');
      navigate('/auth/signin');
      return;
    }

    setJoiningEventId(eventId);
    try {
      const response = await eventService.joinEvent(eventId);
      if (response.success && response.data) {
        const status = response.data.participation.status;
        setParticipationStatus(prev => ({ ...prev, [eventId]: status }));
        
        // Update joined events list
        const eventToAdd = events.find(e => e.id === eventId);
        if (eventToAdd) {
          setJoinedEvents(prev => [...prev, {
            ...eventToAdd,
            participationStatus: status as 'REGISTERED' | 'CONFIRMED' | 'WAITLISTED',
            registeredAt: new Date().toISOString(),
          }]);
          
          // Update current participants count
          setEvents(prev => prev.map(e => 
            e.id === eventId 
              ? { ...e, currentParticipants: e.currentParticipants + 1 }
              : e
          ));
        }

        toast.success(status === 'WAITLISTED' 
          ? 'Added to waitlist successfully!' 
          : 'Joined event successfully!');
      } else {
        toast.error(response.error || 'Failed to join event');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to join event');
    } finally {
      setJoiningEventId(null);
    }
  };

  // Handle leaving an event
  const handleLeaveEvent = async (eventId: string) => {
    setLeavingEventId(eventId);
    try {
      const response = await eventService.leaveEvent(eventId);
      if (response.success) {
        setParticipationStatus(prev => {
          const updated = { ...prev };
          delete updated[eventId];
          return updated;
        });
        
        // Remove from joined events list
        setJoinedEvents(prev => prev.filter(e => e.id !== eventId));
        
        // Update current participants count
        setEvents(prev => prev.map(e => 
          e.id === eventId 
            ? { ...e, currentParticipants: Math.max(0, e.currentParticipants - 1) }
            : e
        ));

        toast.success('Left event successfully');
      } else {
        toast.error(response.error || 'Failed to leave event');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave event');
    } finally {
      setLeavingEventId(null);
    }
  };

  // Map backend status to frontend status
  const mapStatus = (status: string): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' => {
    switch (status) {
      case 'active':
        return 'upcoming';
      case 'cancelled':
        return 'cancelled';
      case 'completed':
        return 'completed';
      default:
        return 'upcoming';
    }
  };

  const upcomingEvents = events.filter(event => mapStatus(event.status) === 'upcoming');
  const pastEvents = events.filter(event => mapStatus(event.status) === 'completed');

  const filterEvents = (eventsList: Event[]) => {
    return eventsList.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.sportType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSport = selectedSport === 'all' || event.sportType === selectedSport;
      const matchesSkill = selectedSkillLevel === 'all' || event.skillLevel === selectedSkillLevel;
      
      return matchesSearch && matchesSport && matchesSkill;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'popularity':
          return b.currentParticipants - a.currentParticipants;
        case 'price':
          return (a.price || 0) - (b.price || 0);
        default:
          return 0;
      }
    });
  };

  const filteredUpcomingEvents = filterEvents(upcomingEvents);
  const filteredPastEvents = filterEvents(pastEvents);

  const stats = [
    { title: 'Total Events', value: events.length.toString(), icon: Calendar, trend: `${upcomingEvents.length} upcoming` },
    ...(user ? [{ title: 'My Joined Events', value: joinedEvents.length.toString(), icon: Users, trend: 'Events you\'re attending' }] : []),
    { title: 'Active Participants', value: events.reduce((sum, e) => sum + e.currentParticipants, 0).toString(), icon: Users, trend: 'Across all events' },
    { title: 'Sports Available', value: [...new Set(events.map(e => e.sportType))].length.toString(), icon: Star, trend: 'Different sports' },
    ...(user ? [] : [{ title: 'Avg. Price', value: events.length > 0 ? `$${(events.filter(e => e.price).reduce((sum, e) => sum + (e.price || 0), 0) / (events.filter(e => e.price).length || 1)).toFixed(2)}` : '$0', icon: DollarSign, trend: 'Per event' }])
  ];

  // Get unique sports from events
  const sports: string[] = ['all', ...Array.from(new Set(events.map(event => event.sportType)))];
  const skillLevels = ['all', 'beginner', 'intermediate', 'advanced'];

  const EventCard = ({ event, showLeaveButton = false }: { event: Event | EventWithParticipation; showLeaveButton?: boolean }) => {
    const eventDate = new Date(event.date);
    const status = mapStatus(event.status);
    const isJoined = participationStatus[event.id] !== undefined;
    const userParticipationStatus = participationStatus[event.id];
    const isJoining = joiningEventId === event.id;
    const isLeaving = leavingEventId === event.id;
    const isFull = event.currentParticipants >= event.maxParticipants;
    
    return (
      <Card className="hover:shadow-lg transition-shadow group">
        <div className="relative">
          {event.imageUrl ? (
            <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
              <img 
                src={event.imageUrl} 
                alt={event.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
              <Calendar className="h-16 w-16 text-primary/40" />
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            {isJoined && (
              <Badge variant="default" className="bg-green-500">
                {userParticipationStatus === 'WAITLISTED' ? 'Waitlisted' : 'Joined'}
              </Badge>
            )}
            <Badge variant={status === 'upcoming' ? 'default' : 'secondary'}>
              {status}
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
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {eventDate.toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {event.startTime}
                </div>
              </div>
              {event.price !== undefined && event.price > 0 && (
                <div className="flex items-center text-primary font-medium">
                  <DollarSign className="mr-1 h-4 w-4" />
                  {event.price}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                <span className="truncate max-w-[150px]">{event.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                {event.currentParticipants}/{event.maxParticipants}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {event.organizer?.name?.split(' ').map(n => n[0]).join('') || 'O'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{event.organizer?.name || 'Organizer'}</span>
              </div>
              {event.skillLevel && (
                <Badge variant="secondary" className="text-xs">
                  {event.skillLevel}
                </Badge>
              )}
            </div>
            
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {event.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {status === 'upcoming' && (
                isJoined || showLeaveButton ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleLeaveEvent(event.id)}
                    disabled={isLeaving}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isLeaving ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4 mr-1" />
                    )}
                    Leave Event
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => handleJoinEvent(event.id)}
                    disabled={isJoining || (isFull && !isJoined)}
                  >
                    {isJoining ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : null}
                    {isFull ? 'Join Waitlist' : 'Join Event'}
                  </Button>
                )
              )}
              {status !== 'upcoming' && (
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              )}
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
            <p className="text-gray-600">Loading events...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-1">
              Discover and join amazing sports events in your community
            </p>
          </div>
          {user?.role === 'ORGANIZER' && (
            <Button className="mt-4 md:mt-0" onClick={() => navigate('/dashboard/create-event')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>

        {/* Stats */}
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
            <CardTitle className="text-lg">Find Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map(sport => (
                    <SelectItem key={sport} value={sport}>
                      {sport === 'all' ? 'All Sports' : sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Skill Level" />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
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
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className={`grid w-full ${user ? 'grid-cols-3 lg:w-[600px]' : 'grid-cols-2 lg:w-[400px]'}`}>
            <TabsTrigger value="upcoming">
              Upcoming Events ({filteredUpcomingEvents.length})
            </TabsTrigger>
            {user && (
              <TabsTrigger value="joined">
                My Joined Events ({joinedEvents.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="past">
              Past Events ({filteredPastEvents.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-6">
            {filteredUpcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUpcomingEvents.map((event) => (
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
                      ? "No events have been created yet. Check back later!"
                      : "Try adjusting your filters or search terms to find more events."}
                  </p>
                  {user?.role === 'ORGANIZER' && (
                    <Button onClick={() => navigate('/dashboard/create-event')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {user && (
            <TabsContent value="joined" className="space-y-6">
              {joinedEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedEvents.map((event) => (
                    <EventCard key={event.id} event={event} showLeaveButton />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No joined events</h3>
                    <p className="text-gray-600 text-center mb-4">
                      You haven't joined any events yet. Browse upcoming events and join one!
                    </p>
                    <Button variant="outline" onClick={() => {
                      const tabs = document.querySelector('[data-state="active"][value="upcoming"]');
                      if (tabs) (tabs as HTMLElement).click();
                    }}>
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
          
          <TabsContent value="past" className="space-y-6">
            {filteredPastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No past events found</h3>
                  <p className="text-gray-600 text-center">
                    Past events will appear here once they're completed.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

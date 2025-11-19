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
  Share2
} from 'lucide-react';
import { mockEvents } from '@/lib/mockData';
import { Event } from '@/lib/types';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const upcomingEvents = mockEvents.filter(event => event.status === 'upcoming');
  const pastEvents = mockEvents.filter(event => event.status === 'completed');

  const filterEvents = (events: Event[]) => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.sport.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSport = selectedSport === 'all' || event.sport === selectedSport;
      const matchesSkill = selectedSkillLevel === 'all' || event.skill_level === selectedSkillLevel;
      
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
    { title: 'Total Events', value: mockEvents.length.toString(), icon: Calendar, trend: '+12% this month' },
    { title: 'Active Participants', value: '247', icon: Users, trend: '+18% this week' },
    { title: 'Average Rating', value: '4.7', icon: Star, trend: '+0.3 this month' },
    { title: 'Revenue Generated', value: '$3,240', icon: DollarSign, trend: '+25% this month' }
  ];

  const sports = ['all', ...Array.from(new Set(mockEvents.map(event => event.sport)))];
  const skillLevels = ['all', 'beginner', 'intermediate', 'advanced'];

  const EventCard = ({ event }: { event: Event }) => (
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
        <div className="absolute top-4 right-4">
          <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
            {event.status}
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
          <Badge variant="outline" className="ml-2">
            {event.sport}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {event.date.toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {event.startTime}
              </div>
            </div>
            {event.price && (
              <div className="flex items-center text-primary font-medium">
                <DollarSign className="mr-1 h-4 w-4" />
                {event.price}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="mr-1 h-4 w-4" />
              {event.location}
            </div>
            <div className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              {event.currentParticipants}/{event.maxParticipants}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                <AvatarFallback className="text-xs">
                  {event.organizer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{event.organizer.name}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {event.skill_level}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4 mr-1" />
                24
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                156
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" disabled={event.currentParticipants >= event.maxParticipants}>
              {event.status === 'upcoming' ? 'Join Event' : 'View Details'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          <Button className="mt-4 md:mt-0">
            Create Event
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
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="upcoming">
              Upcoming Events ({filteredUpcomingEvents.length})
            </TabsTrigger>
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
                    Try adjusting your filters or search terms to find more events.
                  </p>
                  <Button>Create New Event</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
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
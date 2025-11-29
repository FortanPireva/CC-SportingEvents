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
import { Users, Search, Filter, Mail, Phone, MapPin, Calendar, Star, TrendingUp, UserPlus, UserMinus, MessageCircle, MoveHorizontal as MoreHorizontal, Download, Send, CircleCheck as CheckCircle, Circle as XCircle, Clock, Award } from 'lucide-react';
import { mockEvents, mockUsers } from '@/lib/mockData';
import { User, Event } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export default function ParticipantsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Get events organized by current user
  const myEvents = mockEvents.filter(event => 
    event.organizer.id === user?.id || event.organizer.email.includes('organizer')
  );

  // Get all participants from user's events
  const allParticipants = myEvents.flatMap(event => 
    event.participants.map(participant => ({
      ...participant,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventStatus: event.status,
      joinedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      attendanceStatus: Math.random() > 0.2 ? 'confirmed' : Math.random() > 0.5 ? 'pending' : 'cancelled'
    }))
  );

  const filterParticipants = () => {
    return allParticipants.filter(participant => {
      const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           participant.eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEvent = selectedEvent === 'all' || participant.eventId === selectedEvent;
      const matchesStatus = selectedStatus === 'all' || participant.attendanceStatus === selectedStatus;
      
      return matchesSearch && matchesEvent && matchesStatus;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'event':
          return a.eventTitle.localeCompare(b.eventTitle);
        case 'date':
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        default:
          return 0;
      }
    });
  };

  const filteredParticipants = filterParticipants();

  const stats = [
    { 
      title: 'Total Participants', 
      value: allParticipants.length.toString(), 
      icon: Users, 
      trend: '+23 this month',
      color: 'text-blue-600'
    },
    { 
      title: 'Active Events', 
      value: myEvents.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length.toString(), 
      icon: Calendar, 
      trend: '+2 this week',
      color: 'text-green-600'
    },
    { 
      title: 'Attendance Rate', 
      value: `${Math.round((allParticipants.filter(p => p.attendanceStatus === 'confirmed').length / allParticipants.length) * 100)}%`, 
      icon: CheckCircle, 
      trend: '+5% this month',
      color: 'text-purple-600'
    },
    { 
      title: 'Avg. Rating', 
      value: '4.7', 
      icon: Star, 
      trend: '+0.3 this month',
      color: 'text-yellow-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const ParticipantCard = ({ participant }: { participant: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={participant.avatar} alt={participant.name} />
            <AvatarFallback>
              {participant.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{participant.name}</h4>
                <p className="text-sm text-gray-500">{participant.email}</p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {participant.location}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(participant.attendanceStatus)}>
                  {getStatusIcon(participant.attendanceStatus)}
                  <span className="ml-1 capitalize">{participant.attendanceStatus}</span>
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-3 w-3 mr-2" />
                <span className="font-medium">{participant.eventTitle}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-3 w-3 mr-2" />
                Joined {formatDate(participant.joinedDate)}
              </div>
              {participant.preferences && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {participant.preferences.slice(0, 3).map((sport: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {sport}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EventParticipants = ({ event }: { event: Event }) => {
    const eventParticipants = allParticipants.filter(p => p.eventId === event.id);
    const confirmedCount = eventParticipants.filter(p => p.attendanceStatus === 'confirmed').length;
    const fillRate = Math.round((event.currentParticipants / event.maxParticipants) * 100);
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <CardDescription>
                {formatDate(event.date)} • {event.location}
              </CardDescription>
            </div>
            <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{event.currentParticipants}</div>
                <div className="text-xs text-gray-500">Registered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
                <div className="text-xs text-gray-500">Confirmed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{fillRate}%</div>
                <div className="text-xs text-gray-500">Capacity</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Capacity</span>
                <span>{event.currentParticipants}/{event.maxParticipants}</span>
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
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <UserPlus className="h-4 w-4 mr-1" />
                Invite
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Send className="h-4 w-4 mr-1" />
                Message All
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
            <h1 className="text-3xl font-bold text-gray-900">Participants</h1>
            <p className="text-gray-600 mt-1">
              Manage participants across all your events
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Participants
            </Button>
          </div>
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Participants List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search participants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Events" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      {myEvents.map((event) => (
                        <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="date">Join Date</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <div className="space-y-4">
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((participant, index) => (
                  <ParticipantCard key={`${participant.id}-${participant.eventId}-${index}`} participant={participant} />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
                    <p className="text-gray-600 text-center mb-4">
                      Try adjusting your filters or invite more people to your events.
                    </p>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Participants
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Overview</CardTitle>
                <CardDescription>Participants by event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myEvents.slice(0, 3).map((event) => (
                  <EventParticipants key={event.id} event={event} />
                ))}
                {myEvents.length > 3 && (
                  <Button variant="outline" className="w-full">
                    View All Events
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send Announcement
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export List
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="h-4 w-4 mr-2" />
                  Send Certificates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Bulk Invite
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {allParticipants.slice(0, 5).map((participant, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback className="text-xs">
                        {participant.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{participant.name}</span> joined {participant.eventTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(participant.joinedDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
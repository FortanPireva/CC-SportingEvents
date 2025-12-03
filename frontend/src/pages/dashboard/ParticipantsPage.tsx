'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Filter, Mail, MapPin, Calendar, Star, TrendingUp, UserPlus, MessageCircle, MoveHorizontal as MoreHorizontal, Download, Send, CircleCheck as CheckCircle, Circle as XCircle, Clock, Award, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { eventService, EventParticipantDetail, EventSummary, OrganizerStatistics } from '@/services/event.service';
import * as XLSX from 'xlsx';

export default function ParticipantsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Data states
  const [participants, setParticipants] = useState<EventParticipantDetail[]>([]);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [statistics, setStatistics] = useState<OrganizerStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchData();
  }, [selectedEvent, selectedStatus, pagination.page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch participants, events, and statistics in parallel
      const [participantsRes, eventsRes, statsRes] = await Promise.all([
        eventService.getMyParticipants({
          eventId: selectedEvent !== 'all' ? selectedEvent : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          page: pagination.page,
          limit: pagination.limit,
        }),
        eventService.getMyEventsSummary(),
        eventService.getMyStatistics(),
      ]);

      if (participantsRes.success && participantsRes.data) {
        setParticipants(participantsRes.data.participants);
        setPagination(participantsRes.data.pagination);
      }

      if (eventsRes.success && eventsRes.data) {
        setEvents(eventsRes.data.events);
      }

      if (statsRes.success && statsRes.data) {
        setStatistics(statsRes.data.statistics);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load participants');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter participants by search term (client-side for real-time filtering)
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = searchTerm === '' ||
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'event':
        return a.eventName.localeCompare(b.eventName);
      case 'date':
        return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
      default:
        return 0;
    }
  });

  const stats = [
    { 
      title: 'Total Participants', 
      value: statistics?.totalParticipants?.toString() || '0', 
      icon: Users, 
      trend: 'All time',
      color: 'text-blue-600'
    },
    { 
      title: 'Active Events', 
      value: statistics?.activeEvents?.toString() || '0', 
      icon: Calendar, 
      trend: 'Upcoming',
      color: 'text-green-600'
    },
    { 
      title: 'Attendance Rate', 
      value: `${statistics?.attendanceRate || 0}%`, 
      icon: CheckCircle, 
      trend: 'Confirmed',
      color: 'text-purple-600'
    },
    { 
      title: 'Avg. Rating', 
      value: statistics?.averageRating?.toFixed(1) || '0.0', 
      icon: Star, 
      trend: 'From feedback',
      color: 'text-yellow-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'registered':
        return 'bg-green-100 text-green-800';
      case 'waitlisted':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'attended':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'registered':
      case 'attended':
        return <CheckCircle className="h-4 w-4" />;
      case 'waitlisted':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const exportToExcel = () => {
    // Prepare data for export - use filtered participants if there are filters applied
    const dataToExport = filteredParticipants.length > 0 ? filteredParticipants : participants;
    
    if (dataToExport.length === 0) {
      alert('No participants to export');
      return;
    }

    // Transform data into a format suitable for Excel
    const excelData = dataToExport.map((participant) => ({
      'Name': participant.name,
      'Email': participant.email,
      'Location': participant.location || 'N/A',
      'Status': participant.status,
      'Event Name': participant.eventName,
      'Event Date': formatDate(participant.eventDate),
      'Event Location': participant.eventLocation,
      'Registered At': formatDate(participant.registeredAt),
      'Preferences': participant.preferences?.join(', ') || 'N/A',
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 },  // Name
      { wch: 30 },  // Email
      { wch: 20 },  // Location
      { wch: 12 },  // Status
      { wch: 30 },  // Event Name
      { wch: 15 },  // Event Date
      { wch: 25 },  // Event Location
      { wch: 15 },  // Registered At
      { wch: 30 },  // Preferences
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `participants_export_${date}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, fileName);
  };

  const ParticipantCard = ({ participant }: { participant: EventParticipantDetail }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {participant.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{participant.name}</h4>
                <p className="text-sm text-gray-500">{participant.email}</p>
                {participant.location && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {participant.location}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(participant.status)}>
                  {getStatusIcon(participant.status)}
                  <span className="ml-1 capitalize">{participant.status.toLowerCase()}</span>
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-3 w-3 mr-2" />
                <span className="font-medium">{participant.eventName}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-3 w-3 mr-2" />
                Joined {formatDate(participant.registeredAt)}
              </div>
              {participant.preferences && Array.isArray(participant.preferences) && participant.preferences.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {participant.preferences.slice(0, 3).map((pref: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {pref}
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

  const EventParticipants = ({ event }: { event: EventSummary }) => {
    const fillRate = event.maxParticipants > 0 
      ? Math.round((event.currentParticipants / event.maxParticipants) * 100)
      : 0;
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{event.name}</CardTitle>
              <CardDescription className="text-xs">
                {formatDate(event.date)} • {event.location}
              </CardDescription>
            </div>
            <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{event.currentParticipants}</div>
                <div className="text-xs text-gray-500">Registered</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{event.confirmedCount}</div>
                <div className="text-xs text-gray-500">Confirmed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{fillRate}%</div>
                <div className="text-xs text-gray-500">Capacity</div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Capacity</span>
                <span>{event.currentParticipants}/{event.maxParticipants}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    fillRate >= 90 ? 'bg-red-500' : 
                    fillRate >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(fillRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading && participants.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
            <h1 className="text-3xl font-bold text-gray-900">Participants</h1>
            <p className="text-gray-600 mt-1">
              Manage participants across all your events
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={exportToExcel} disabled={participants.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export ({filteredParticipants.length})
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={fetchData}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

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
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                      ))}
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
                </div>
              </CardContent>
            </Card>

            {/* Loading indicator for filter changes */}
            {isLoading && participants.length > 0 && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}

            {/* Participants */}
            <div className="space-y-4">
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((participant) => (
                  <ParticipantCard key={participant.id} participant={participant} />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
                    <p className="text-gray-600 text-center mb-4">
                      {participants.length === 0 
                        ? "You don't have any participants yet. Create events and invite people to join!"
                        : "Try adjusting your filters or search term."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button 
                  variant="outline" 
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button 
                  variant="outline" 
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Overview</CardTitle>
                <CardDescription>Participants by event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {events.length > 0 ? (
                  <>
                    {events.slice(0, 3).map((event) => (
                      <EventParticipants key={event.id} event={event} />
                    ))}
                    {events.length > 3 && (
                      <Button variant="outline" className="w-full">
                        View All Events ({events.length})
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No events yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {participants.slice(0, 5).map((participant) => (
                  <div key={participant.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {participant.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{participant.name}</span> joined {participant.eventName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(participant.registeredAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {participants.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

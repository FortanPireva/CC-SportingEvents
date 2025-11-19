'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Search, Filter, Star, DollarSign, Clock, Users, Wifi, Car, Coffee, Zap, Shield, Calendar, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';
import { mockFacilities } from '@/lib/mockData';
import { Facility } from '@/lib/types';

export default function VenuesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedVenue, setSelectedVenue] = useState<Facility | null>(null);

  const filterVenues = (venues: Facility[]) => {
    return venues.filter(venue => {
      const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           venue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           venue.sports.some(sport => sport.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSport = selectedSport === 'all' || venue.sports.includes(selectedSport);
      const matchesPrice = priceRange === 'all' || 
                          (priceRange === 'budget' && venue.hourlyRate <= 40) ||
                          (priceRange === 'mid' && venue.hourlyRate > 40 && venue.hourlyRate <= 70) ||
                          (priceRange === 'premium' && venue.hourlyRate > 70);
      
      return matchesSearch && matchesSport && matchesPrice;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.hourlyRate - b.hourlyRate;
        case 'rating':
          return 0; // Would sort by actual ratings in real app
        default:
          return 0;
      }
    });
  };

  const filteredVenues = filterVenues(mockFacilities);

  const stats = [
    { title: 'Total Venues', value: mockFacilities.length.toString(), icon: MapPin, trend: '+3 new this month' },
    { title: 'Average Rate', value: `$${Math.round(mockFacilities.reduce((sum, v) => sum + v.hourlyRate, 0) / mockFacilities.length)}`, icon: DollarSign, trend: 'per hour' },
    { title: 'Sports Covered', value: Array.from(new Set(mockFacilities.flatMap(v => v.sports))).length.toString(), icon: Users, trend: 'different activities' },
    { title: 'Bookings Today', value: '24', icon: Calendar, trend: '+15% vs yesterday' }
  ];

  const allSports = ['all', ...Array.from(new Set(mockFacilities.flatMap(venue => venue.sports)))];

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      'Parking': Car,
      'WiFi': Wifi,
      'Cafe': Coffee,
      'Air Conditioning': Zap,
      'Locker Rooms': Shield,
      'Equipment Rental': Users,
      'Lighting': Zap,
      'Sound System': Zap,
      'First Aid': Shield,
      'Accessible': Shield
    };
    return iconMap[amenity] || CheckCircle;
  };

  const VenueCard = ({ venue }: { venue: Facility }) => {
    const availableSlots = venue.availability[0]?.slots.filter(slot => slot.available).length || 0;
    const totalSlots = venue.availability[0]?.slots.length || 0;
    const availabilityRate = totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0;

    return (
      <Card className="hover:shadow-lg transition-shadow group">
        <div className="relative">
          <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-t-lg flex items-center justify-center">
            <MapPin className="h-16 w-16 text-primary/60" />
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant={availabilityRate > 50 ? 'default' : 'secondary'}>
              {availabilityRate}% Available
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{venue.name}</CardTitle>
              <CardDescription className="text-sm flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {venue.location}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">${venue.hourlyRate}</div>
              <div className="text-xs text-gray-500">per hour</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Sports Available</div>
              <div className="flex flex-wrap gap-1">
                {venue.sports.slice(0, 4).map((sport, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {sport}
                  </Badge>
                ))}
                {venue.sports.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{venue.sports.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Top Amenities</div>
              <div className="grid grid-cols-3 gap-2">
                {venue.amenities.slice(0, 6).map((amenity, index) => {
                  const IconComponent = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center text-xs text-gray-600">
                      <IconComponent className="h-3 w-3 mr-1" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  4.{Math.floor(Math.random() * 5) + 3}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {availableSlots} slots today
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => setSelectedVenue(venue)}>
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{venue.name}</DialogTitle>
                    <DialogDescription className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {venue.location}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">${venue.hourlyRate}</div>
                        <div className="text-sm text-gray-600">per hour</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{availabilityRate}%</div>
                        <div className="text-sm text-gray-600">available today</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Sports & Activities</h4>
                      <div className="flex flex-wrap gap-2">
                        {venue.sports.map((sport, index) => (
                          <Badge key={index} variant="outline">
                            {sport}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Amenities & Features</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {venue.amenities.map((amenity, index) => {
                          const IconComponent = getAmenityIcon(amenity);
                          return (
                            <div key={index} className="flex items-center text-sm">
                              <IconComponent className="h-4 w-4 mr-2 text-green-600" />
                              {amenity}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Today's Availability</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {venue.availability[0]?.slots.map((slot, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded text-center text-xs ${
                              slot.available 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <div className="font-medium">{slot.start}</div>
                            <div className="flex items-center justify-center mt-1">
                              {slot.available ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button className="flex-1">Book Now</Button>
                      <Button variant="outline" className="flex-1">Add to Favorites</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
            <h1 className="text-3xl font-bold text-gray-900">Venues</h1>
            <p className="text-gray-600 mt-1">
              Find and book the perfect venue for your sports activities
            </p>
          </div>
          <Button className="mt-4 md:mt-0">
            List Your Venue
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
                <p className="text-xs text-muted-foreground">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Find Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search venues..."
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
                  {allSports.map(sport => (
                    <SelectItem key={sport} value={sport}>
                      {sport === 'all' ? 'All Sports' : sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">Budget ($0-40)</SelectItem>
                  <SelectItem value="mid">Mid-range ($41-70)</SelectItem>
                  <SelectItem value="premium">Premium ($71+)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Venues Grid */}
        <div className="space-y-6">
          {filteredVenues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
                <p className="text-gray-600 text-center mb-4">
                  Try adjusting your filters or search terms to find more venues.
                </p>
                <Button>List Your Venue</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                View My Bookings
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Star className="h-6 w-6 mb-2" />
                Favorite Venues
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <MapPin className="h-6 w-6 mb-2" />
                Venues Near Me
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
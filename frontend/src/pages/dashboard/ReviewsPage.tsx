'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, Search, Filter, TrendingUp, MessageCircle, ThumbsUp, Calendar, MapPin, Plus, Award, Users, Activity, Reply, MoveHorizontal as MoreHorizontal } from 'lucide-react';
import { mockReviews, mockEvents, mockFacilities } from '@/lib/mockData';
import { Review } from '@/lib/mockData';

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewContent, setNewReviewContent] = useState('');

  const filterReviews = (reviews: Review[]) => {
    return reviews.filter(review => {
      const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.reviewer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = selectedRating === 'all' || review.rating.toString() === selectedRating;
      const matchesType = selectedType === 'all' || 
                         (selectedType === 'events' && review.eventId) ||
                         (selectedType === 'venues' && review.facilityId);
      
      return matchesSearch && matchesRating && matchesType;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });
  };

  const filteredReviews = filterReviews(mockReviews);

  const stats = [
    { title: 'Total Reviews', value: mockReviews.length.toString(), icon: Star, trend: '+15 this week' },
    { title: 'Average Rating', value: (mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length).toFixed(1), icon: Award, trend: '+0.2 this month' },
    { title: 'Response Rate', value: `${Math.round((mockReviews.filter(r => r.response).length / mockReviews.length) * 100)}%`, icon: MessageCircle, trend: '+5% this month' },
    { title: 'Helpful Votes', value: mockReviews.reduce((sum, r) => sum + r.helpful, 0).toString(), icon: ThumbsUp, trend: '+89 this week' }
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const StarRating = ({ rating, size = 'sm' }: { rating: number, size?: 'sm' | 'lg' }) => {
    const starSize = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getReviewSubject = (review: Review) => {
    if (review.eventId) {
      const event = mockEvents.find(e => e.id === review.eventId);
      return { type: 'Event', name: event?.title || 'Unknown Event', icon: Calendar };
    }
    if (review.facilityId) {
      const facility = mockFacilities.find(f => f.id === review.facilityId);
      return { type: 'Venue', name: facility?.name || 'Unknown Venue', icon: MapPin };
    }
    return { type: 'Unknown', name: 'Unknown', icon: Activity };
  };

  const ReviewCard = ({ review }: { review: Review }) => {
    const subject = getReviewSubject(review);
    const SubjectIcon = subject.icon;
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.reviewer.avatar} alt={review.reviewer.name} />
                <AvatarFallback>
                  {review.reviewer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{review.reviewer.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {review.reviewer.type}
                  </Badge>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{formatTimeAgo(review.timestamp)}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <StarRating rating={review.rating} />
                  <span className="text-sm font-medium">{review.rating}/5</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <SubjectIcon className="h-4 w-4" />
              <span className="font-medium">{subject.type}:</span>
              <span>{subject.name}</span>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
              <p className="text-gray-700 leading-relaxed">{review.content}</p>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful ({review.helpful})
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              </div>
              <Badge variant="outline" className="text-xs">
                {subject.type}
              </Badge>
            </div>
            
            {review.response && (
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-200">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={review.response.author.avatar} alt={review.response.author.name} />
                    <AvatarFallback className="text-xs">
                      {review.response.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-blue-900">{review.response.author.name}</span>
                      <Badge variant="secondary" className="text-xs">Organizer</Badge>
                      <span className="text-xs text-blue-600">{formatTimeAgo(review.response.timestamp)}</span>
                    </div>
                    <p className="text-sm text-blue-800 mt-1">{review.response.content}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const RatingDistribution = () => {
    const distribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: mockReviews.filter(r => r.rating === rating).length,
      percentage: Math.round((mockReviews.filter(r => r.rating === rating).length / mockReviews.length) * 100)
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {distribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-16">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-12">{count}</span>
            </div>
          ))}
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
            <h1 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h1>
            <p className="text-gray-600 mt-1">
              Read and share experiences from our sports community
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>
                  Share your experience to help others in the community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newReviewRating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-gray-600 ml-2">{newReviewRating}/5</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Summarize your experience"
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Review</label>
                  <Textarea
                    placeholder="Tell us about your experience..."
                    value={newReviewContent}
                    onChange={(e) => setNewReviewContent(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Submit Review</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Reviews Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedRating} onValueChange={setSelectedRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Ratings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="venues">Venues</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="rating">Highest Rating</SelectItem>
                      <SelectItem value="helpful">Most Helpful</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <div className="space-y-6">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Star className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                    <p className="text-gray-600 text-center mb-4">
                      Try adjusting your filters or be the first to write a review!
                    </p>
                    <Button>Write Review</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Distribution */}
            <RatingDistribution />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.reviewer.avatar} alt={review.reviewer.name} />
                      <AvatarFallback className="text-xs">
                        {review.reviewer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{review.reviewer.name}</span> left a review
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(review.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="h-4 w-4 mr-2" />
                  My Reviews
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Top Reviewers
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="h-4 w-4 mr-2" />
                  Review Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
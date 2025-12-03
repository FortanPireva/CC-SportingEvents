'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Star, TrendingUp, Calendar, MapPin, Award, Loader2, CheckCircle, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { eventService, FeedbackEvent } from '@/services/event.service';
import { toast } from 'sonner';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<FeedbackEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<FeedbackEvent | null>(null);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getMyFeedbackEvents();
      if (response.success && response.data) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedEvent) return;

    try {
      setIsSubmitting(true);
      const response = await eventService.submitFeedback(
        selectedEvent.eventId,
        newReviewRating,
        newReviewContent
      );

      if (response.success) {
        toast.success('Feedback submitted successfully!');
        setDialogOpen(false);
        setNewReviewRating(5);
        setNewReviewContent('');
        setSelectedEvent(null);
        // Refresh the events list
        fetchEvents();
      } else {
        toast.error(response.error || 'Failed to submit feedback');
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFeedbackDialog = (event: FeedbackEvent) => {
    setSelectedEvent(event);
    if (event.feedback) {
      setNewReviewRating(event.feedback.rating);
      setNewReviewContent(event.feedback.comment);
    } else {
      setNewReviewRating(5);
      setNewReviewContent('');
    }
    setDialogOpen(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate statistics
  const eventsWithFeedback = events.filter(e => e.feedback !== null);
  const totalRatings = eventsWithFeedback.length;
  const averageRating = totalRatings > 0
    ? eventsWithFeedback.reduce((sum, e) => sum + (e.feedback?.rating || 0), 0) / totalRatings
    : 0;
  const pendingFeedback = events.filter(e => e.feedback === null).length;

  const stats = [
    { title: 'Events Attended', value: events.length.toString(), icon: Calendar, trend: 'All time' },
    { title: 'Reviews Given', value: totalRatings.toString(), icon: Star, trend: 'Total' },
    { title: 'Average Rating', value: averageRating.toFixed(1), icon: Award, trend: 'Out of 10' },
    { title: 'Pending Reviews', value: pendingFeedback.toString(), icon: Edit, trend: 'To complete' }
  ];

  const RatingSelector = ({ rating, onRatingChange }: { rating: number; onRatingChange: (r: number) => void }) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-amber-500">{rating}/10</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                onClick={() => onRatingChange(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= rating
                      ? 'text-amber-400 fill-current'
                      : 'text-gray-300 hover:text-amber-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={rating}
          onChange={(e) => onRatingChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Poor</span>
          <span>Average</span>
          <span>Excellent</span>
        </div>
      </div>
    );
  };

  const EventCard = ({ event }: { event: FeedbackEvent }) => {
    const hasFeedback = event.feedback !== null;

    return (
      <Card className={`hover:shadow-md transition-shadow ${hasFeedback ? 'border-green-200 bg-green-50/30' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">{event.eventName}</h4>
                {hasFeedback && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Reviewed
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.eventLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{event.sportType}</Badge>
                  <span className="text-gray-400">•</span>
                  <span>by {event.organizerName}</span>
                </div>
              </div>

              {hasFeedback && event.feedback && (
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400 fill-current" />
                      <span className="font-bold text-amber-600">{event.feedback.rating}/10</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{event.feedback.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Submitted {formatDate(event.feedback.createdAt)}
                  </p>
                </div>
              )}
            </div>

            <Button
              variant={hasFeedback ? 'outline' : 'default'}
              onClick={() => openFeedbackDialog(event)}
              className="ml-4"
            >
              {hasFeedback ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Review
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Rate Event
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const RatingDistribution = () => {
    const distribution = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: eventsWithFeedback.filter(e => e.feedback?.rating === rating).length,
    }));

    const maxCount = Math.max(...distribution.map(d => d.count), 1);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {distribution.map(({ rating, count }) => (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-12">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="h-3 w-3 text-amber-400 fill-current" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-amber-400 h-2 rounded-full transition-all"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
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
            <h1 className="text-3xl font-bold text-gray-900">Feedback & Ratings</h1>
            <p className="text-gray-600 mt-1">
              Rate events you've attended to help organizers improve
            </p>
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
          {/* Events List */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Events to Review</CardTitle>
                <CardDescription>
                  Rate events you've participated in (1-10 scale)
                </CardDescription>
              </CardHeader>
            </Card>

            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <EventCard key={event.eventId} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Join events to be able to leave feedback and ratings!
                  </p>
                  <Button onClick={() => window.location.href = '/dashboard/events'}>
                    Browse Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Distribution */}
            {eventsWithFeedback.length > 0 && <RatingDistribution />}

            {/* Rating Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rating Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">9-10</span>
                  <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">7-8</span>
                  <Badge className="bg-blue-100 text-blue-700">Good</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">5-6</span>
                  <Badge className="bg-yellow-100 text-yellow-700">Average</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">3-4</span>
                  <Badge className="bg-orange-100 text-orange-700">Below Average</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">1-2</span>
                  <Badge className="bg-red-100 text-red-700">Poor</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feedback Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• Be specific about what you liked or disliked</p>
                <p>• Mention the organization and facilities</p>
                <p>• Share if the event met your expectations</p>
                <p>• Your feedback helps organizers improve</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent?.feedback ? 'Edit Your Review' : 'Rate This Event'}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.eventName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Your Rating</label>
              <RatingSelector rating={newReviewRating} onRatingChange={setNewReviewRating} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Your Feedback</label>
              <Textarea
                placeholder="Tell us about your experience... What did you enjoy? What could be improved?"
                value={newReviewContent}
                onChange={(e) => setNewReviewContent(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {newReviewContent.length}/1000 characters
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || !newReviewContent.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : selectedEvent?.feedback ? (
                  'Update Review'
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

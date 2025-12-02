'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, MapPin, Users, DollarSign, Plus, X, Upload, Save, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { eventService, CreateEventData } from '@/services/event.service';
import { storageService } from '@/services/storage.service';
import { isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    sport: '',
    date: undefined as Date | undefined,
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    price: '',
    skillLevel: '',
    isRecurring: false,
    recurringPattern: '',
    tags: [] as string[],
    image: null as File | null
  });

  const [currentTag, setCurrentTag] = useState('');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const sports = [
    'Basketball', 'Football', 'Tennis', 'Volleyball', 'Baseball', 'Swimming',
    'Running', 'Cycling', 'Yoga', 'Pilates', 'Boxing', 'Martial Arts',
    'Golf', 'Badminton', 'Table Tennis', 'Cricket', 'Rugby', 'Hockey'
  ];

  const skillLevels = [
    { value: 'beginner', label: 'Beginner - New to the sport' },
    { value: 'intermediate', label: 'Intermediate - Some experience' },
    { value: 'advanced', label: 'Advanced - Experienced players' },
    { value: 'all', label: 'All Levels - Everyone welcome' }
  ];

  const recurringPatterns = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setEventData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !eventData.tags.includes(currentTag.trim())) {
      setEventData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEventData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!isSupabaseConfigured()) {
      toast.error('Image upload not available', {
        description: 'Supabase storage is not configured. Please contact the administrator.',
      });
      return;
    }

    setIsUploading(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const result = await storageService.uploadImage(file, 'events');
      
      if (result.success && result.url) {
        setUploadedImageUrl(result.url);
        handleInputChange('image', file);
        toast.success('Image uploaded successfully!');
      } else {
        setImagePreview(null);
        toast.error('Failed to upload image', {
          description: result.error || 'Please try again.',
        });
      }
    } catch (error: any) {
      setImagePreview(null);
      toast.error('Upload failed', {
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async () => {
    if (uploadedImageUrl) {
      await storageService.deleteImage(uploadedImageUrl);
    }
    setUploadedImageUrl(null);
    setImagePreview(null);
    handleInputChange('image', null);
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!eventData.title.trim()) newErrors.title = 'Event title is required';
      if (!eventData.description.trim()) newErrors.description = 'Event description is required';
      if (!eventData.sport) newErrors.sport = 'Sport selection is required';
      if (!eventData.skillLevel) newErrors.skillLevel = 'Skill level is required';
    }

    if (stepNumber === 2) {
      if (!eventData.date) newErrors.date = 'Event date is required';
      if (!eventData.startTime) newErrors.startTime = 'Start time is required';
      if (!eventData.endTime) newErrors.endTime = 'End time is required';
      if (!eventData.location.trim()) newErrors.location = 'Location is required';
      if (eventData.startTime && eventData.endTime && eventData.startTime >= eventData.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (stepNumber === 3) {
      if (!eventData.maxParticipants || parseInt(eventData.maxParticipants) < 1) {
        newErrors.maxParticipants = 'Valid participant limit is required';
      }
      if (eventData.price && parseFloat(eventData.price) < 0) {
        newErrors.price = 'Price cannot be negative';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for API - mapping frontend fields to backend fields
      const createData: CreateEventData = {
        name: eventData.title,
        description: eventData.description,
        sportType: eventData.sport,
        date: eventData.date!.toISOString(),
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        location: eventData.location,
        maxParticipants: parseInt(eventData.maxParticipants),
        isRecurring: eventData.isRecurring,
        recurringPattern: eventData.isRecurring ? eventData.recurringPattern : undefined,
        price: eventData.price ? parseFloat(eventData.price) : undefined,
        skillLevel: eventData.skillLevel || undefined,
        tags: eventData.tags.length > 0 ? eventData.tags : undefined,
        imageUrl: uploadedImageUrl || undefined,
      };

      const response = await eventService.createEvent(createData);

      if (response.success) {
        toast.success('Event created successfully!', {
          description: 'Your event has been published and is now visible to participants.',
        });
        navigate('/dashboard/my-events');
      } else {
        throw new Error(response.error || 'Failed to create event');
      }
    } catch (error: any) {
      console.error('Create event error:', error);
      toast.error('Failed to create event', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3, 4].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            step >= stepNumber 
              ? "bg-primary text-white" 
              : "bg-gray-200 text-gray-600"
          )}>
            {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
          </div>
          {stepNumber < 4 && (
            <div className={cn(
              "w-12 h-0.5 mx-2",
              step > stepNumber ? "bg-primary" : "bg-gray-200"
            )} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            placeholder="Enter event title"
            value={eventData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Event Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe your event, what participants can expect, any requirements..."
            value={eventData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div>
          <Label htmlFor="sport">Sport *</Label>
          <Select value={eventData.sport} onValueChange={(value) => handleInputChange('sport', value)}>
            <SelectTrigger className={errors.sport ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select sport" />
            </SelectTrigger>
            <SelectContent>
              {sports.map((sport) => (
                <SelectItem key={sport} value={sport}>{sport}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sport && <p className="text-red-500 text-sm mt-1">{errors.sport}</p>}
        </div>

        <div>
          <Label htmlFor="skillLevel">Skill Level *</Label>
          <Select value={eventData.skillLevel} onValueChange={(value) => handleInputChange('skillLevel', value)}>
            <SelectTrigger className={errors.skillLevel ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select skill level" />
            </SelectTrigger>
            <SelectContent>
              {skillLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.skillLevel && <p className="text-red-500 text-sm mt-1">{errors.skillLevel}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Event Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !eventData.date && "text-muted-foreground",
                  errors.date && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {eventData.date ? format(eventData.date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={eventData.date}
                onSelect={(date) => handleInputChange('date', date)}
                disabled={{ before: new Date() }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="location">Location *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="location"
              placeholder="Enter venue address or location"
              value={eventData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={cn("pl-10", errors.location && "border-red-500")}
            />
          </div>
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>

        <div>
          <Label htmlFor="startTime">Start Time *</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="startTime"
              type="time"
              value={eventData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className={cn("pl-10", errors.startTime && "border-red-500")}
            />
          </div>
          {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
        </div>

        <div>
          <Label htmlFor="endTime">End Time *</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="endTime"
              type="time"
              value={eventData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className={cn("pl-10", errors.endTime && "border-red-500")}
            />
          </div>
          {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={eventData.isRecurring}
              onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
            />
            <Label htmlFor="recurring">Make this a recurring event</Label>
          </div>
          
          {eventData.isRecurring && (
            <div className="mt-4">
              <Label htmlFor="recurringPattern">Recurring Pattern</Label>
              <Select value={eventData.recurringPattern} onValueChange={(value) => handleInputChange('recurringPattern', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  {recurringPatterns.map((pattern) => (
                    <SelectItem key={pattern.value} value={pattern.value}>{pattern.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="maxParticipants">Maximum Participants *</Label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="maxParticipants"
              type="number"
              placeholder="e.g., 20"
              value={eventData.maxParticipants}
              onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
              className={cn("pl-10", errors.maxParticipants && "border-red-500")}
              min="1"
            />
          </div>
          {errors.maxParticipants && <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>}
        </div>

        <div>
          <Label htmlFor="price">Price per Person (Optional)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              value={eventData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className={cn("pl-10", errors.price && "border-red-500")}
              min="0"
              step="0.01"
            />
          </div>
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          <p className="text-sm text-gray-500 mt-1">Leave empty for free events</p>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="tags">Event Tags</Label>
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder="Add tags (e.g., competitive, beginner-friendly)"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {eventData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{tag}</span>
                <button onClick={() => removeTag(tag)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="image">Event Image (Optional)</Label>
          {!imagePreview ? (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary/50 transition-colors">
              <div className="space-y-1 text-center">
                {isUploading ? (
                  <>
                    <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                    <p className="text-sm text-gray-600">Uploading image...</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80">
                        <span>Upload a file</span>
                        <input
                          id="image"
                          type="file"
                          className="sr-only"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file);
                            }
                          }}
                          disabled={isUploading}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                    {!isSupabaseConfigured() && (
                      <p className="text-xs text-amber-600 mt-2">
                        <AlertCircle className="inline h-3 w-3 mr-1" />
                        Supabase not configured - image upload disabled
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-1 relative">
              <div className="relative rounded-md overflow-hidden border-2 border-green-500">
                <img 
                  src={imagePreview} 
                  alt="Event preview" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {eventData.image?.name || 'Image'} uploaded successfully
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Your Event</h3>
        <p className="text-gray-600">Please review all details before publishing your event</p>
      </div>

      <Card>
        {imagePreview && (
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img 
              src={imagePreview} 
              alt="Event preview" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>{eventData.title}</span>
            <Badge>{eventData.sport}</Badge>
          </CardTitle>
          <CardDescription>{eventData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
              {eventData.date ? format(eventData.date, "PPP") : 'No date selected'}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-gray-500" />
              {eventData.startTime} - {eventData.endTime}
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-gray-500" />
              {eventData.location}
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-gray-500" />
              Max {eventData.maxParticipants} participants
            </div>
          </div>
          
          {eventData.price && (
            <div className="flex items-center text-sm">
              <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
              ${eventData.price} per person
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <span className="mr-2 text-gray-500">Skill Level:</span>
            <Badge variant="outline">{eventData.skillLevel}</Badge>
          </div>
          
          {eventData.tags.length > 0 && (
            <div>
              <span className="text-sm text-gray-500 mr-2">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {eventData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {eventData.isRecurring && (
            <div className="flex items-center text-sm">
              <AlertCircle className="mr-2 h-4 w-4 text-blue-500" />
              Recurring event: {eventData.recurringPattern}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-1">
            Set up your sports event and start building your community
          </p>
        </div>

        <StepIndicator />

        <Card>
          <CardHeader>
            <CardTitle>
              Step {step}: {
                step === 1 ? 'Event Details' :
                step === 2 ? 'Date & Location' :
                step === 3 ? 'Participants & Pricing' :
                'Review & Publish'
              }
            </CardTitle>
            <CardDescription>
              {
                step === 1 ? 'Tell us about your event and what sport you\'re organizing' :
                step === 2 ? 'When and where will your event take place?' :
                step === 3 ? 'Set participant limits and pricing for your event' :
                'Review all details and publish your event'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Previous
          </Button>
          
          <div className="space-x-2">
  
            
            {step < 4 ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Publish Event
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
import { Event, User, Facility } from './types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.smith@email.com',
    name: 'John Smith',
    type: 'organizer',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    preferences: ['Basketball', 'Soccer', 'Tennis'],
    joinedAt: new Date('2023-06-15')
  },
  {
    id: '2',
    email: 'sarah.johnson@email.com',
    name: 'Sarah Johnson',
    type: 'organizer',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    preferences: ['Yoga', 'Running', 'Swimming'],
    joinedAt: new Date('2023-08-20')
  },
  {
    id: '3',
    email: 'mike.rodriguez@email.com',
    name: 'Mike Rodriguez',
    type: 'user',
    avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+1 (555) 345-6789',
    location: 'Oakland, CA',
    preferences: ['Basketball', 'Baseball', 'Football'],
    joinedAt: new Date('2023-09-10')
  },
  {
    id: '4',
    email: 'emily.chen@email.com',
    name: 'Emily Chen',
    type: 'user',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+1 (555) 456-7890',
    location: 'Berkeley, CA',
    preferences: ['Tennis', 'Badminton', 'Volleyball'],
    joinedAt: new Date('2023-10-05')
  },
  {
    id: '5',
    email: 'david.wilson@email.com',
    name: 'David Wilson',
    type: 'user',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+1 (555) 567-8901',
    location: 'San Jose, CA',
    preferences: ['Soccer', 'Running', 'Cycling'],
    joinedAt: new Date('2023-11-12')
  },
  {
    id: '6',
    email: 'lisa.anderson@email.com',
    name: 'Lisa Anderson',
    type: 'organizer',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    phone: '+1 (555) 678-9012',
    location: 'Palo Alto, CA',
    preferences: ['Pilates', 'Dance', 'Fitness'],
    joinedAt: new Date('2023-07-30')
  }
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Weekly Basketball Tournament',
    description: 'Competitive basketball tournament for intermediate to advanced players. Teams of 5, single elimination format with prizes for winners.',
    sport: 'Basketball',
    organizer: mockUsers[0],
    date: new Date('2024-01-20'),
    startTime: '18:00',
    endTime: '21:00',
    location: 'Golden Gate Sports Complex',
    maxParticipants: 32,
    currentParticipants: 28,
    participants: [mockUsers[2], mockUsers[4], mockUsers[3]],
    price: 25,
    skill_level: 'intermediate',
    status: 'upcoming',
    image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['competitive', 'tournament', 'prizes'],
    created_at: new Date('2024-01-05')
  },
  {
    id: '2',
    title: 'Morning Yoga in the Park',
    description: 'Start your day with peaceful yoga session in beautiful Golden Gate Park. All levels welcome, mats provided.',
    sport: 'Yoga',
    organizer: mockUsers[1],
    date: new Date('2024-01-22'),
    startTime: '07:30',
    endTime: '08:30',
    location: 'Golden Gate Park - Meadow Area',
    maxParticipants: 25,
    currentParticipants: 18,
    participants: [mockUsers[3], mockUsers[5]],
    skill_level: 'all',
    status: 'upcoming',
    image: 'https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['wellness', 'outdoor', 'beginner-friendly'],
    created_at: new Date('2024-01-08')
  },
  {
    id: '3',
    title: 'Soccer Skills Workshop',
    description: 'Improve your soccer techniques with professional coaching. Focus on dribbling, passing, and shooting skills.',
    sport: 'Soccer',
    organizer: mockUsers[0],
    date: new Date('2024-01-25'),
    startTime: '16:00',
    endTime: '18:00',
    location: 'Mission Bay Soccer Fields',
    maxParticipants: 20,
    currentParticipants: 15,
    participants: [mockUsers[4], mockUsers[2]],
    price: 35,
    skill_level: 'beginner',
    status: 'upcoming',
    image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['training', 'skills', 'coaching'],
    created_at: new Date('2024-01-10')
  },
  {
    id: '4',
    title: 'Tennis Doubles Championship',
    description: 'Annual tennis doubles championship. Register with your partner or we\'ll match you with someone of similar skill level.',
    sport: 'Tennis',
    organizer: mockUsers[5],
    date: new Date('2024-01-28'),
    startTime: '09:00',
    endTime: '17:00',
    location: 'Bay Area Tennis Club',
    maxParticipants: 32,
    currentParticipants: 24,
    participants: [mockUsers[3], mockUsers[1], mockUsers[2]],
    price: 45,
    skill_level: 'intermediate',
    status: 'upcoming',
    image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['championship', 'doubles', 'competitive'],
    created_at: new Date('2024-01-02')
  },
  {
    id: '5',
    title: 'Community 5K Fun Run',
    description: 'Join our monthly community run around the beautiful Marina District. All paces welcome, post-run refreshments included.',
    sport: 'Running',
    organizer: mockUsers[1],
    date: new Date('2024-02-03'),
    startTime: '08:00',
    endTime: '10:00',
    location: 'Marina Green',
    maxParticipants: 100,
    currentParticipants: 67,
    participants: [mockUsers[4], mockUsers[0], mockUsers[3], mockUsers[2]],
    price: 15,
    skill_level: 'all',
    status: 'upcoming',
    image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['community', 'fun-run', 'social'],
    created_at: new Date('2024-01-15')
  },
  {
    id: '6',
    title: 'Beach Volleyball Tournament',
    description: 'Sand, sun, and spikes! Join us for an exciting beach volleyball tournament with teams of 4. BBQ lunch included.',
    sport: 'Volleyball',
    organizer: mockUsers[0],
    date: new Date('2024-02-10'),
    startTime: '10:00',
    endTime: '16:00',
    location: 'Ocean Beach Volleyball Courts',
    maxParticipants: 48,
    currentParticipants: 36,
    participants: [mockUsers[3], mockUsers[5], mockUsers[2], mockUsers[4]],
    price: 30,
    skill_level: 'all',
    status: 'upcoming',
    image: 'https://images.pexels.com/photos/1263348/pexels-photo-1263348.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['beach', 'tournament', 'bbq'],
    created_at: new Date('2024-01-18')
  },
  {
    id: '7',
    title: 'Beginner Swimming Lessons',
    description: 'Learn to swim or improve your technique with certified instructors. Small class sizes ensure personalized attention.',
    sport: 'Swimming',
    organizer: mockUsers[1],
    date: new Date('2024-01-15'),
    startTime: '19:00',
    endTime: '20:00',
    location: 'Aquatic Center Pool',
    maxParticipants: 12,
    currentParticipants: 12,
    participants: [mockUsers[2], mockUsers[4]],
    price: 40,
    skill_level: 'beginner',
    status: 'completed',
    image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['lessons', 'beginner', 'certified'],
    created_at: new Date('2023-12-20')
  },
  {
    id: '8',
    title: 'Cycling Group Ride',
    description: 'Scenic 25-mile ride through Marin County. Moderate pace, rest stops included. Bring your own bike and helmet.',
    sport: 'Cycling',
    organizer: mockUsers[0],
    date: new Date('2024-01-10'),
    startTime: '08:00',
    endTime: '12:00',
    location: 'Golden Gate Bridge - Marin Side',
    maxParticipants: 30,
    currentParticipants: 22,
    participants: [mockUsers[4], mockUsers[1], mockUsers[3]],
    price: 20,
    skill_level: 'intermediate',
    status: 'completed',
    image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['scenic', 'group-ride', 'marin'],
    created_at: new Date('2023-12-25')
  },
  {
    id: '9',
    title: 'Pilates Core Strength',
    description: 'Intensive pilates session focusing on core strength and flexibility. Suitable for intermediate practitioners.',
    sport: 'Pilates',
    organizer: mockUsers[5],
    date: new Date('2024-01-08'),
    startTime: '18:30',
    endTime: '19:30',
    location: 'Wellness Studio Downtown',
    maxParticipants: 15,
    currentParticipants: 13,
    participants: [mockUsers[1], mockUsers[3]],
    price: 25,
    skill_level: 'intermediate',
    status: 'completed',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['pilates', 'core', 'strength'],
    created_at: new Date('2023-12-15')
  },
  {
    id: '10',
    title: 'Badminton Social Night',
    description: 'Casual badminton games with rotating partners. Great way to meet new people and improve your game.',
    sport: 'Badminton',
    organizer: mockUsers[0],
    date: new Date('2024-01-05'),
    startTime: '19:00',
    endTime: '21:00',
    location: 'Community Recreation Center',
    maxParticipants: 24,
    currentParticipants: 20,
    participants: [mockUsers[3], mockUsers[2], mockUsers[5]],
    price: 12,
    skill_level: 'all',
    status: 'completed',
    image: 'https://images.pexels.com/photos/8007513/pexels-photo-8007513.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['social', 'casual', 'rotating'],
    created_at: new Date('2023-12-10')
  }
];

// Mock Facilities
export const mockFacilities: Facility[] = [
  {
    id: '1',
    name: 'Golden Gate Sports Complex',
    location: '1234 Sports Ave, San Francisco, CA 94102',
    sports: ['Basketball', 'Volleyball', 'Badminton', 'Tennis'],
    amenities: ['Parking', 'Locker Rooms', 'Equipment Rental', 'Cafe', 'WiFi', 'Air Conditioning'],
    hourlyRate: 75,
    availability: [
      {
        day: 'Monday',
        slots: [
          { start: '06:00', end: '08:00', available: true },
          { start: '08:00', end: '10:00', available: false },
          { start: '10:00', end: '12:00', available: true },
          { start: '12:00', end: '14:00', available: true },
          { start: '14:00', end: '16:00', available: false },
          { start: '16:00', end: '18:00', available: true },
          { start: '18:00', end: '20:00', available: false },
          { start: '20:00', end: '22:00', available: true }
        ]
      },
      {
        day: 'Tuesday',
        slots: [
          { start: '06:00', end: '08:00', available: true },
          { start: '08:00', end: '10:00', available: true },
          { start: '10:00', end: '12:00', available: false },
          { start: '12:00', end: '14:00', available: true },
          { start: '14:00', end: '16:00', available: true },
          { start: '16:00', end: '18:00', available: false },
          { start: '18:00', end: '20:00', available: true },
          { start: '20:00', end: '22:00', available: true }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Marina District Fitness Center',
    location: '567 Marina Blvd, San Francisco, CA 94123',
    sports: ['Yoga', 'Pilates', 'Dance', 'Fitness Classes'],
    amenities: ['Parking', 'Showers', 'Mat Storage', 'Sound System', 'Mirrors', 'Props Available'],
    hourlyRate: 45,
    availability: [
      {
        day: 'Monday',
        slots: [
          { start: '06:00', end: '08:00', available: true },
          { start: '08:00', end: '10:00', available: true },
          { start: '10:00', end: '12:00', available: false },
          { start: '12:00', end: '14:00', available: true },
          { start: '14:00', end: '16:00', available: true },
          { start: '16:00', end: '18:00', available: true },
          { start: '18:00', end: '20:00', available: false },
          { start: '20:00', end: '22:00', available: true }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Mission Bay Soccer Fields',
    location: '890 Mission Bay Dr, San Francisco, CA 94158',
    sports: ['Soccer', 'Football', 'Rugby', 'Field Hockey'],
    amenities: ['Parking', 'Restrooms', 'Bleachers', 'Lighting', 'Goal Posts', 'Field Marking'],
    hourlyRate: 60,
    availability: [
      {
        day: 'Monday',
        slots: [
          { start: '06:00', end: '08:00', available: true },
          { start: '08:00', end: '10:00', available: true },
          { start: '10:00', end: '12:00', available: true },
          { start: '12:00', end: '14:00', available: false },
          { start: '14:00', end: '16:00', available: true },
          { start: '16:00', end: '18:00', available: false },
          { start: '18:00', end: '20:00', available: true },
          { start: '20:00', end: '22:00', available: true }
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Bay Area Tennis Club',
    location: '321 Tennis Court Rd, San Francisco, CA 94115',
    sports: ['Tennis', 'Pickleball'],
    amenities: ['Parking', 'Pro Shop', 'Locker Rooms', 'Racquet Rental', 'Ball Machine', 'Coaching Available'],
    hourlyRate: 85,
    availability: [
      {
        day: 'Monday',
        slots: [
          { start: '06:00', end: '08:00', available: false },
          { start: '08:00', end: '10:00', available: true },
          { start: '10:00', end: '12:00', available: true },
          { start: '12:00', end: '14:00', available: true },
          { start: '14:00', end: '16:00', available: false },
          { start: '16:00', end: '18:00', available: true },
          { start: '18:00', end: '20:00', available: false },
          { start: '20:00', end: '22:00', available: true }
        ]
      }
    ]
  },
  {
    id: '5',
    name: 'Ocean Beach Volleyball Courts',
    location: 'Great Highway & Judah St, San Francisco, CA 94122',
    sports: ['Beach Volleyball', 'Beach Soccer'],
    amenities: ['Free Parking', 'Restrooms', 'Volleyball Nets', 'Sand Courts', 'Ocean View', 'Nearby Cafes'],
    hourlyRate: 25,
    availability: [
      {
        day: 'Monday',
        slots: [
          { start: '08:00', end: '10:00', available: true },
          { start: '10:00', end: '12:00', available: true },
          { start: '12:00', end: '14:00', available: false },
          { start: '14:00', end: '16:00', available: true },
          { start: '16:00', end: '18:00', available: true },
          { start: '18:00', end: '20:00', available: false }
        ]
      }
    ]
  },
  {
    id: '6',
    name: 'Aquatic Center Pool',
    location: '456 Pool Lane, San Francisco, CA 94110',
    sports: ['Swimming', 'Water Polo', 'Aqua Fitness'],
    amenities: ['Parking', 'Locker Rooms', 'Pool Equipment', 'Lifeguard', 'Lane Ropes', 'Timing System'],
    hourlyRate: 55,
    availability: [
      {
        day: 'Monday',
        slots: [
          { start: '06:00', end: '08:00', available: true },
          { start: '08:00', end: '10:00', available: false },
          { start: '10:00', end: '12:00', available: true },
          { start: '12:00', end: '14:00', available: true },
          { start: '14:00', end: '16:00', available: true },
          { start: '16:00', end: '18:00', available: false },
          { start: '18:00', end: '20:00', available: true },
          { start: '20:00', end: '22:00', available: true }
        ]
      }
    ]
  },
  {
    id: '7',
    name: 'Community Recreation Center',
    location: '789 Community St, San Francisco, CA 94107',
    sports: ['Badminton', 'Table Tennis', 'Basketball', 'Volleyball'],
    amenities: ['Free Parking', 'Equipment Storage', 'Sound System', 'First Aid', 'Water Fountains', 'Accessible'],
    hourlyRate: 35,
    availability: [
      {
        day: 'Monday',
        slots: [
          { start: '06:00', end: '08:00', available: true },
          { start: '08:00', end: '10:00', available: true },
          { start: '10:00', end: '12:00', available: true },
          { start: '12:00', end: '14:00', available: false },
          { start: '14:00', end: '16:00', available: true },
          { start: '16:00', end: '18:00', available: true },
          { start: '18:00', end: '20:00', available: false },
          { start: '20:00', end: '22:00', available: true }
        ]
      }
    ]
  },
  {
    id: '8',
    name: 'Wellness Studio Downtown',
    location: '123 Wellness Way, San Francisco, CA 94104',
    sports: ['Pilates', 'Yoga', 'Meditation', 'Barre'],
    amenities: ['Street Parking', 'Changing Rooms', 'Props Included', 'Aromatherapy', 'Heated Floors', 'Tea Bar'],
    hourlyRate: 65,
    availability: [
      {
        day: 'Monday',
        slots: [
          { start: '06:00', end: '08:00', available: false },
          { start: '08:00', end: '10:00', available: true },
          { start: '10:00', end: '12:00', available: true },
          { start: '12:00', end: '14:00', available: true },
          { start: '14:00', end: '16:00', available: false },
          { start: '16:00', end: '18:00', available: true },
          { start: '18:00', end: '20:00', available: true },
          { start: '20:00', end: '22:00', available: false }
        ]
      }
    ]
  }
];

// Mock Community Posts
export interface CommunityPost {
  id: string;
  author: User;
  content: string;
  type: 'discussion' | 'achievement' | 'question' | 'event-share';
  timestamp: Date;
  likes: number;
  comments: CommunityComment[];
  tags: string[];
  image?: string;
}

export interface CommunityComment {
  id: string;
  author: User;
  content: string;
  timestamp: Date;
  likes: number;
}

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    author: mockUsers[2],
    content: 'Just completed my first 5K run! Thanks to everyone who encouraged me during training. The community support here is amazing! 🏃‍♂️',
    type: 'achievement',
    timestamp: new Date('2024-01-18T14:30:00'),
    likes: 24,
    tags: ['running', 'milestone', 'community'],
    image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=400',
    comments: [
      {
        id: '1',
        author: mockUsers[1],
        content: 'Congratulations Mike! Your dedication really paid off. See you at the next community run!',
        timestamp: new Date('2024-01-18T15:00:00'),
        likes: 5
      },
      {
        id: '2',
        author: mockUsers[0],
        content: 'Way to go! That\'s a huge accomplishment. Keep up the great work! 👏',
        timestamp: new Date('2024-01-18T15:15:00'),
        likes: 3
      }
    ]
  },
  {
    id: '2',
    author: mockUsers[3],
    content: 'Looking for a tennis partner for weekend games. I\'m intermediate level and prefer doubles. Anyone interested in regular matches at Bay Area Tennis Club?',
    type: 'question',
    timestamp: new Date('2024-01-17T10:45:00'),
    likes: 12,
    tags: ['tennis', 'partner', 'weekend'],
    comments: [
      {
        id: '3',
        author: mockUsers[4],
        content: 'I\'d be interested! I play at intermediate level too. Let\'s connect and set up a match.',
        timestamp: new Date('2024-01-17T11:30:00'),
        likes: 2
      },
      {
        id: '4',
        author: mockUsers[5],
        content: 'I organize regular tennis events there. You should join our doubles tournament next month!',
        timestamp: new Date('2024-01-17T12:00:00'),
        likes: 4
      }
    ]
  },
  {
    id: '3',
    author: mockUsers[1],
    content: 'Amazing turnout at today\'s yoga session! 18 people joined us for morning practice in Golden Gate Park. The energy was incredible! 🧘‍♀️ Next session is this Thursday.',
    type: 'event-share',
    timestamp: new Date('2024-01-16T09:30:00'),
    likes: 31,
    tags: ['yoga', 'success', 'golden-gate-park'],
    image: 'https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg?auto=compress&cs=tinysrgb&w=400',
    comments: [
      {
        id: '5',
        author: mockUsers[3],
        content: 'It was such a peaceful way to start the day. Thank you for organizing these sessions!',
        timestamp: new Date('2024-01-16T10:00:00'),
        likes: 6
      },
      {
        id: '6',
        author: mockUsers[2],
        content: 'Count me in for Thursday! These outdoor sessions are the best.',
        timestamp: new Date('2024-01-16T10:30:00'),
        likes: 4
      }
    ]
  },
  {
    id: '4',
    author: mockUsers[0],
    content: 'Tips for organizing successful sports events: 1) Clear communication 2) Backup plans for weather 3) Proper equipment check 4) Engage with participants. What would you add to this list?',
    type: 'discussion',
    timestamp: new Date('2024-01-15T16:20:00'),
    likes: 18,
    tags: ['tips', 'organizing', 'events'],
    comments: [
      {
        id: '7',
        author: mockUsers[5],
        content: 'Great list! I\'d add: 5) Follow up with participants after the event for feedback.',
        timestamp: new Date('2024-01-15T17:00:00'),
        likes: 8
      },
      {
        id: '8',
        author: mockUsers[1],
        content: 'Safety briefing is crucial too, especially for outdoor activities.',
        timestamp: new Date('2024-01-15T17:30:00'),
        likes: 6
      }
    ]
  },
  {
    id: '5',
    author: mockUsers[4],
    content: 'Shoutout to the cycling group! Completed our 25-mile ride through Marin County yesterday. The views were spectacular and the company was even better! 🚴‍♂️',
    type: 'achievement',
    timestamp: new Date('2024-01-11T19:45:00'),
    likes: 27,
    tags: ['cycling', 'marin-county', 'group-ride'],
    image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400',
    comments: [
      {
        id: '9',
        author: mockUsers[0],
        content: 'Great job everyone! The weather was perfect for riding. Already planning the next route.',
        timestamp: new Date('2024-01-11T20:00:00'),
        likes: 5
      }
    ]
  },
  {
    id: '6',
    author: mockUsers[5],
    content: 'New to the platform and loving the community vibe! Just signed up for my first pilates class. Any tips for a beginner?',
    type: 'question',
    timestamp: new Date('2024-01-14T13:15:00'),
    likes: 15,
    tags: ['new-member', 'pilates', 'beginner'],
    comments: [
      {
        id: '10',
        author: mockUsers[1],
        content: 'Welcome! Pilates is amazing for core strength. Don\'t worry about keeping up at first, focus on form.',
        timestamp: new Date('2024-01-14T14:00:00'),
        likes: 7
      },
      {
        id: '11',
        author: mockUsers[3],
        content: 'Bring a water bottle and wear comfortable clothes. The instructors here are very supportive!',
        timestamp: new Date('2024-01-14T14:30:00'),
        likes: 4
      }
    ]
  }
];

// Mock Reviews
export interface Review {
  id: string;
  reviewer: User;
  eventId?: string;
  facilityId?: string;
  rating: number;
  title: string;
  content: string;
  timestamp: Date;
  helpful: number;
  response?: {
    author: User;
    content: string;
    timestamp: Date;
  };
}

export const mockReviews: Review[] = [
  {
    id: '1',
    reviewer: mockUsers[2],
    eventId: '7',
    rating: 5,
    title: 'Excellent Swimming Instruction',
    content: 'The swimming lessons were fantastic! The instructor was patient and knowledgeable. I went from barely floating to swimming laps confidently. The small class size meant lots of personal attention. Highly recommend for anyone wanting to learn proper technique.',
    timestamp: new Date('2024-01-16T20:30:00'),
    helpful: 12,
    response: {
      author: mockUsers[1],
      content: 'Thank you Mike! It was wonderful seeing your progress throughout the sessions. Keep practicing and you\'ll be ready for our intermediate class soon!',
      timestamp: new Date('2024-01-17T09:00:00')
    }
  },
  {
    id: '2',
    reviewer: mockUsers[3],
    facilityId: '1',
    rating: 4,
    title: 'Great Facilities, Minor Issues',
    content: 'Golden Gate Sports Complex has excellent courts and equipment. The basketball courts are well-maintained and the lighting is perfect. Only complaint is that parking can be challenging during peak hours. The staff is friendly and helpful.',
    timestamp: new Date('2024-01-15T18:45:00'),
    helpful: 8
  },
  {
    id: '3',
    reviewer: mockUsers[4],
    eventId: '8',
    rating: 5,
    title: 'Amazing Cycling Experience',
    content: 'What a fantastic ride! The route through Marin County was breathtaking. John did an excellent job organizing the group and setting a comfortable pace for everyone. The rest stops were well-planned and the group was very welcoming to newcomers.',
    timestamp: new Date('2024-01-12T15:20:00'),
    helpful: 15,
    response: {
      author: mockUsers[0],
      content: 'Thanks David! It was great having you join us. Looking forward to seeing you on our next ride. The group really enjoyed your company!',
      timestamp: new Date('2024-01-12T16:00:00')
    }
  },
  {
    id: '4',
    reviewer: mockUsers[1],
    facilityId: '4',
    rating: 5,
    title: 'Premium Tennis Experience',
    content: 'Bay Area Tennis Club is top-notch! The courts are immaculate, equipment rental is convenient, and the pro shop has everything you need. Yes, it\'s pricier than other venues, but the quality justifies the cost. Perfect for tournaments and serious play.',
    timestamp: new Date('2024-01-10T14:30:00'),
    helpful: 20
  },
  {
    id: '5',
    reviewer: mockUsers[5],
    eventId: '9',
    rating: 4,
    title: 'Challenging but Rewarding',
    content: 'The pilates core strength class really pushed me to my limits. Lisa is an excellent instructor who provides clear guidance and modifications. The studio atmosphere is calming and the equipment is high-quality. Will definitely be back!',
    timestamp: new Date('2024-01-09T21:00:00'),
    helpful: 9
  },
  {
    id: '6',
    reviewer: mockUsers[0],
    facilityId: '5',
    rating: 4,
    title: 'Perfect Beach Volleyball Spot',
    content: 'Ocean Beach courts are ideal for beach volleyball. The sand is well-maintained and the ocean breeze makes even hot days comfortable. Free parking is a huge plus! Only downside is that it can get windy in the afternoons, but that\'s just nature.',
    timestamp: new Date('2024-01-08T17:15:00'),
    helpful: 11
  },
  {
    id: '7',
    reviewer: mockUsers[3],
    eventId: '10',
    rating: 5,
    title: 'Fun Social Badminton Night',
    content: 'Had such a great time at badminton social night! The rotating partner system was brilliant - got to play with people of different skill levels and made new friends. John organized everything perfectly and the atmosphere was very welcoming.',
    timestamp: new Date('2024-01-06T22:30:00'),
    helpful: 14,
    response: {
      author: mockUsers[0],
      content: 'So glad you enjoyed it Emily! The social nights are all about bringing people together through sports. Hope to see you at the next one!',
      timestamp: new Date('2024-01-07T08:00:00')
    }
  },
  {
    id: '8',
    reviewer: mockUsers[2],
    facilityId: '6',
    rating: 4,
    title: 'Clean Pool, Good Facilities',
    content: 'Aquatic Center has a well-maintained pool with clear water and good lane organization. The locker rooms are clean and the lifeguards are attentive. Pool temperature is perfect for lap swimming. Would like to see longer operating hours on weekends.',
    timestamp: new Date('2024-01-05T19:45:00'),
    helpful: 7
  },
  {
    id: '9',
    reviewer: mockUsers[4],
    facilityId: '2',
    rating: 5,
    title: 'Excellent Yoga Studio',
    content: 'Marina District Fitness Center is my go-to place for yoga classes. The studio is spacious, well-ventilated, and has all the props you need. The instructors are knowledgeable and create a peaceful atmosphere. Great value for money!',
    timestamp: new Date('2024-01-04T20:15:00'),
    helpful: 16
  },
  {
    id: '10',
    reviewer: mockUsers[1],
    facilityId: '7',
    rating: 3,
    title: 'Good Value, Basic Amenities',
    content: 'Community Recreation Center offers good value for casual sports. The facilities are basic but functional. Equipment could use some updating and the sound system has issues sometimes. However, the affordable rates make it accessible for everyone.',
    timestamp: new Date('2024-01-03T16:00:00'),
    helpful: 5
  }
];
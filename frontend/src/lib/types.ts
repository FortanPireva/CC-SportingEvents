export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN' | 'GUEST';
  location?: string;
  preferences?: any;
  createdAt: Date;
  // Legacy support for old type field
  type?: 'user' | 'organizer';
  avatar?: string;
  phone?: string;
  joinedAt?: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  sport: string;
  organizer: User;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  participants: User[];
  price?: number;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image?: string;
  tags: string[];
  created_at: Date;
}

export interface Facility {
  id: string;
  name: string;
  location: string;
  sports: string[];
  amenities: string[];
  hourlyRate: number;
  availability: {
    day: string;
    slots: { start: string; end: string; available: boolean }[];
  }[];
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, type: 'user' | 'organizer') => Promise<void>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<void>;
}
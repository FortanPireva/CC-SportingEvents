'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Calendar, MapPin, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Activity,
      title: 'Discover Events',
      description: 'Find local sports events that match your interests and skill level'
    },
    {
      icon: Users,
      title: 'Build Community',
      description: 'Connect with like-minded individuals and build lasting friendships'
    },
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Create and manage events with our intuitive scheduling tools'
    },
    {
      icon: MapPin,
      title: 'Local Focus',
      description: 'Find activities in your neighborhood and explore new venues'
    },
    {
      icon: Star,
      title: 'Rate & Review',
      description: 'Share your experiences and help others find great events'
    },
    {
      icon: Zap,
      title: 'Instant Updates',
      description: 'Get real-time notifications about events and changes'
    }
  ];

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">CC: Sporting Events</span>
          </div>
          <div className="space-x-4">
            <Link to="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect Through
            <span className="text-primary block">Sports</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join local sports events, meet new people, and stay active in your community. 
            Whether you're organizing or participating, we bring sports enthusiasts together.
          </p>
          <div className="space-x-4">
            <Link to="/auth/signup">
              <Button size="lg" className="px-8">
                Join Community
              </Button>
            </Link>
            <Link to="/auth/signup?type=organizer">
              <Button size="lg" variant="outline" className="px-8">
                Become Organizer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CC: Sporting Events?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform makes it easy to find, organize, and participate in local sports activities
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Active?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of community members who are already connecting through sports
          </p>
          <Link to="/auth/signup">
            <Button size="lg" variant="secondary" className="px-8">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Activity className="h-6 w-6" />
            <span className="text-xl font-semibold">CC: Sporting Events</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Community Connect: Sporting Events. Bringing communities together through sports.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
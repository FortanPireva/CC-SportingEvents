'use client';

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Users,
  Calendar,
  MapPin,
  Star,
  Zap,
  Search,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Shield,
  ChevronRight,
} from 'lucide-react';

interface PublicStats {
  totalUsers: number;
  totalEvents: number;
  sportTypesAvailable: number;
  uniqueLocations: number;
}

function usePublicStats() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    fetch(`${apiUrl}/analytics/public-stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch(() => {});
  }, []);

  return stats;
}

function formatStat(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k+`;
  return String(value);
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const stats = usePublicStats();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white font-body overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-blue-100/60">
        <nav className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-gray-900">
              CC: Sporting Events
            </span>
          </Link>
          <div className="flex items-center gap-2.5">
            <Link to="/auth/signin">
              <Button
                variant="ghost"
                className="font-semibold text-gray-700 hover:text-primary hover:bg-primary/5"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button className="font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 landing-grain">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-primary/[0.04] anim-drift" />
          <div className="absolute top-1/3 -left-32 w-[300px] h-[300px] rounded-full bg-blue-200/30 anim-float" />
          <div className="absolute bottom-10 right-1/4 w-48 h-48 rounded-3xl rotate-12 bg-primary/[0.03] anim-float" style={{ animationDelay: '2s' }} />
          {/* Geometric accent lines */}
          <div className="hidden lg:block absolute top-28 right-40 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="hidden lg:block absolute bottom-40 left-20 w-24 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-5 relative">
          <div className="max-w-3xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 bg-primary/[0.08] text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-7 anim-slide-up"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              20 sport types &middot; Always free to join
            </div>

            {/* Headline */}
            <h1
              className="font-display text-5xl sm:text-6xl md:text-[5.2rem] font-extrabold leading-[1.05] tracking-tight text-gray-950 mb-6 anim-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              Find Your Next{' '}
              <span className="text-primary relative">
                Sport Event
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 8 C50 2, 100 2, 150 7 S250 2, 298 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Subtext */}
            <p
              className="text-lg md:text-xl text-gray-500 mb-9 max-w-lg leading-relaxed anim-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              Never play alone again. Browse local events, join a team, and get on the field in minutes.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3 anim-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <Link to="/auth/signup">
                <Button
                  size="lg"
                  className="px-7 h-12 text-[15px] font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all group"
                >
                  Browse Events Near You
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth/signup?type=organizer">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-7 h-12 text-[15px] font-semibold border-gray-200 hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
                >
                  Create Your First Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ─── */}
      <section className="relative bg-primary text-white">
        <div className="max-w-7xl mx-auto px-5 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: stats ? formatStat(stats.totalUsers) : '\u2014', label: 'Registered Users', icon: Users },
              { value: stats ? formatStat(stats.totalEvents) : '\u2014', label: 'Events Created', icon: Calendar },
              { value: stats ? String(stats.sportTypesAvailable) : '\u2014', label: 'Sport Types', icon: Trophy },
              { value: stats ? formatStat(stats.uniqueLocations) : '\u2014', label: 'Unique Venues', icon: MapPin },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 anim-scale-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <stat.icon className="h-5 w-5 text-white/80" />
                </div>
                <div>
                  <div className="font-display text-2xl md:text-3xl font-extrabold leading-none">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60 mt-0.5">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="max-w-xl mb-14">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">How it works</p>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight">
              Playing in 3 simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-[3.25rem] left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />

            {[
              {
                step: '01',
                icon: Search,
                title: 'Browse Events',
                desc: 'Filter by sport, location, skill level, and date to find the perfect match for you.',
              },
              {
                step: '02',
                icon: CheckCircle2,
                title: 'Join with One Tap',
                desc: 'Reserve your spot instantly. No back-and-forth messaging, no waiting for approval.',
              },
              {
                step: '03',
                icon: Trophy,
                title: 'Show Up & Play',
                desc: 'Get directions, meet your team, enjoy the game. Leave a rating when you\u2019re done!',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative bg-gray-50/80 rounded-2xl p-7 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                    <item.icon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-display text-xs font-bold text-primary/40 tracking-widest">
                    STEP {item.step}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-gray-950 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES: BENTO GRID ─── */}
      <section className="py-20 md:py-24 bg-gray-50/60 landing-grain">
        <div className="max-w-7xl mx-auto px-5">
          <div className="max-w-xl mb-14">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Features</p>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight">
              Built for sports communities
            </h2>
          </div>

          {/* Bento layout: 2 large + 4 small */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {/* Primary: Discover Events */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/[0.04] transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                <Activity className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-950 mb-3">Discover Events</h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                Browse basketball, football, tennis, hiking, and 16+ other sports. Filter by distance, skill level, and time &mdash; your perfect event is one search away.
              </p>
              <div className="space-y-2.5">
                {['Filter by 20 sport types', 'See skill level & spots left', 'Real-time availability updates'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Primary: Build Community */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/[0.04] transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                <Users className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-950 mb-3">Build Your Community</h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                Discussion boards, achievements, event sharing &mdash; connect with athletes who share your passion. Your next teammate might be around the corner.
              </p>
              <div className="space-y-2.5">
                {['Community posts & discussions', 'Share achievements & milestones', 'Like, comment, and follow'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary features row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Calendar, title: 'Easy Scheduling', desc: 'Create events in seconds with smart defaults and recurring options.' },
              { icon: MapPin, title: 'Local Focus', desc: 'Hyper-local results so you spend less time driving, more time playing.' },
              { icon: Star, title: 'Ratings & Reviews', desc: 'Honest feedback helps great organizers stand out from the crowd.' },
              { icon: Zap, title: 'Instant Updates', desc: 'Real-time notifications when spots open, events change, or friends join.' },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.04] transition-all duration-300 group"
              >
                <f.icon className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-display font-bold text-gray-950 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTICIPANTS vs ORGANIZERS ─── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="max-w-xl mb-14">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">For everyone</p>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight">
              Whether you play or organize
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Participants */}
            <div className="rounded-2xl border border-gray-200 p-8 hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-gray-950">For Participants</h3>
              </div>
              <ul className="space-y-3.5 mb-8">
                {[
                  'Browse and join events with one click',
                  'Track your participation history',
                  'Rate events and leave feedback',
                  'Join community discussions',
                  'Get notified about new nearby events',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth/signup">
                <Button className="w-full h-11 font-semibold group/btn" size="lg">
                  Join as a Participant
                  <ChevronRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Organizers */}
            <div className="rounded-2xl border-2 border-primary/20 bg-primary/[0.02] p-8 relative hover:border-primary/40 transition-all">
              <div className="absolute -top-3 right-6 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md shadow-primary/25">
                Popular
              </div>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-gray-950">For Organizers</h3>
              </div>
              <ul className="space-y-3.5 mb-8">
                {[
                  'Create and manage unlimited events',
                  'Track RSVPs and attendance in real-time',
                  'Access a detailed analytics dashboard',
                  'Manage participant lists & communications',
                  'Build your reputation with ratings',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth/signup?type=organizer">
                <Button className="w-full h-11 font-semibold group/btn" size="lg">
                  Start Organizing
                  <ChevronRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SPORT TYPES ─── */}
      <section className="py-20 md:py-24 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight mb-3">
              20 sports, one platform
            </h2>
            <p className="text-gray-500">Whatever your game, we&rsquo;ve got you covered</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
            {[
              'Football', 'Basketball', 'American Football', 'Tennis', 'Volleyball',
              'Running', 'Cycling', 'Swimming', 'Hiking', 'Yoga',
              'Pilates', 'Boxing', 'Martial Arts', 'Golf', 'Badminton',
              'Table Tennis', 'Cricket', 'Rugby', 'Hockey', 'Baseball',
            ].map((sport) => (
              <span
                key={sport}
                className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-primary hover:text-white transition-colors duration-200 cursor-default select-none"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-20 md:py-24 overflow-hidden landing-grain">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-800 to-blue-950" />
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/[0.04] anim-drift" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/[0.03] anim-float" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02]" />
        </div>

        <div className="max-w-3xl mx-auto px-5 text-center relative">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
            Your next sport event is waiting
          </h2>
          <p className="text-lg text-blue-200/80 mb-9 max-w-md mx-auto leading-relaxed">
            Join a growing community of athletes who stopped playing alone. Sign up free &mdash; no credit card needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth/signup">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-7 h-12 text-[15px] font-semibold shadow-xl group"
              >
                Browse Events Near You
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth/signup?type=organizer">
              <Button
                size="lg"
                className="bg-transparent px-7 h-12 text-[15px] font-semibold border border-white/25 text-white hover:bg-white/10 transition-all"
              >
                Create Your First Event
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-950 text-white pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="font-display text-base font-bold tracking-tight">CC: Sporting Events</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Bringing communities together through sports. Find events, build teams, stay active.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-display font-bold text-sm mb-4 text-gray-300">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Browse Events', href: '/auth/signup' },
                  { label: 'Create Event', href: '/auth/signup?type=organizer' },
                  { label: 'Community', href: '/auth/signup' },
                  { label: 'Analytics', href: '/auth/signup' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-display font-bold text-sm mb-4 text-gray-300">Resources</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'How It Works', href: '#' },
                  { label: 'Sport Types', href: '#' },
                  { label: 'For Organizers', href: '/auth/signup?type=organizer' },
                  { label: 'For Participants', href: '/auth/signup' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-display font-bold text-sm mb-4 text-gray-300">Company</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'About Us', href: '#' },
                  { label: 'Contact', href: '#' },
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Terms of Service', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Community Connect: Sporting Events. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <Link to="#" className="text-sm text-gray-600 hover:text-white transition-colors">Privacy</Link>
              <Link to="#" className="text-sm text-gray-600 hover:text-white transition-colors">Terms</Link>
              <Link to="#" className="text-sm text-gray-600 hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

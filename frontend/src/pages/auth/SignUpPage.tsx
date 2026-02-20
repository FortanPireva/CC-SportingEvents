'use client';

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Activity, Eye, EyeOff, Loader as Loader2, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AuthCarouselPanel from '@/components/auth/AuthCarouselPanel';

export default function SignUpPage() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as 'user' | 'organizer' || 'user';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    type: initialType
  });
  const [showPasswords, setShowPasswords] = useState({ password: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.name, formData.type);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Carousel (desktop only, fixed) */}
      <div className="hidden lg:block lg:w-1/2 lg:fixed lg:inset-y-0 lg:left-0">
        <AuthCarouselPanel />
      </div>

      {/* Right — Scrollable form */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] flex flex-col bg-white">
        {/* Mobile-only logo header */}
        <div className="lg:hidden px-6 pt-6 pb-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/25">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-gray-900">
              CC: Sporting Events
            </span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md anim-slide-up">
            <div className="mb-8">
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-950 mb-2">
                Join the Community
              </h1>
              <p className="text-gray-500">
                Create your account and start connecting through sports
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPasswords.password ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="h-11"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, password: !prev.password }))}
                  >
                    {showPasswords.password ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="h-11"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Account Type</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                  className="grid grid-cols-2 gap-3"
                >
                  <label
                    htmlFor="user"
                    className={cn(
                      'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all',
                      formData.type === 'user'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <RadioGroupItem value="user" id="user" className="sr-only" />
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                      formData.type === 'user' ? 'bg-primary/10' : 'bg-gray-100'
                    )}>
                      <Users className={cn(
                        'h-5 w-5 transition-colors',
                        formData.type === 'user' ? 'text-primary' : 'text-gray-500'
                      )} />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm text-gray-900">Participant</div>
                      <div className="text-xs text-gray-500 mt-0.5">Join events & activities</div>
                    </div>
                  </label>

                  <label
                    htmlFor="organizer"
                    className={cn(
                      'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all',
                      formData.type === 'organizer'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <RadioGroupItem value="organizer" id="organizer" className="sr-only" />
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                      formData.type === 'organizer' ? 'bg-primary/10' : 'bg-gray-100'
                    )}>
                      <Shield className={cn(
                        'h-5 w-5 transition-colors',
                        formData.type === 'organizer' ? 'text-primary' : 'text-gray-500'
                      )} />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm text-gray-900">Organizer</div>
                      <div className="text-xs text-gray-500 mt-0.5">Create & manage events</div>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold shadow-md shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/auth/signin" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

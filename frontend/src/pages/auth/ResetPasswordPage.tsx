'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Activity,
  Loader as Loader2,
  CircleCheck as CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Left panel — question-mark themed (desktop only)                  */
/* ------------------------------------------------------------------ */
const BADGE_SIZE = 72; // px – matches w-[72px] h-[72px]
const SPEED = 1.2;     // px per frame

function QuestionMarkPanel({ step }: { step: string }) {
  const stepMessages: Record<string, { title: string; subtitle: string }> = {
    email: {
      title: 'Forgot your password?',
      subtitle: "No worries — we'll help you get back in the game.",
    },
    otp: {
      title: 'Check your inbox',
      subtitle: "We've sent a verification code to your email.",
    },
    password: {
      title: 'Almost there',
      subtitle: 'Choose a new password and you\'re all set.',
    },
    success: {
      title: 'You\'re back!',
      subtitle: 'Your password has been reset successfully.',
    },
  };

  const msg = stepMessages[step] ?? stepMessages.email;

  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 60, y: 80 });
  // Slightly off 45° so it doesn't loop the same diagonal
  const vel = useRef({ dx: SPEED * 0.87, dy: SPEED * 0.5 });
  const raf = useRef<number>(0);

  const tick = useCallback(() => {
    const container = containerRef.current;
    const badge = badgeRef.current;
    if (!container || !badge) {
      raf.current = requestAnimationFrame(tick);
      return;
    }

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const p = pos.current;
    const v = vel.current;

    p.x += v.dx;
    p.y += v.dy;

    // Bounce off edges
    if (p.x <= 0) { p.x = 0; v.dx = Math.abs(v.dx); }
    if (p.y <= 0) { p.y = 0; v.dy = Math.abs(v.dy); }
    if (p.x + BADGE_SIZE >= cw) { p.x = cw - BADGE_SIZE; v.dx = -Math.abs(v.dx); }
    if (p.y + BADGE_SIZE >= ch) { p.y = ch - BADGE_SIZE; v.dy = -Math.abs(v.dy); }

    badge.style.transform = `translate(${p.x}px, ${p.y}px)`;
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [tick]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-gray-900"
    >
      {/* Grain texture */}
      <div className="landing-grain absolute inset-0 z-[2] pointer-events-none" />

      {/* Brand logo */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2.5 group"
      >
        <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/20 group-hover:bg-white/25 transition-colors">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <span className="font-display text-lg font-bold tracking-tight text-white drop-shadow-md">
          CC: Sporting Events
        </span>
      </Link>

      {/* DVD-bounce question mark */}
      <div
        ref={badgeRef}
        className="absolute top-0 left-0 z-10 w-[72px] h-[72px] rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10 will-change-transform"
      >
        <span className="font-display text-4xl font-black text-white select-none">?</span>
      </div>

      {/* Messaging + step indicator – anchored at bottom */}
      <div className="absolute top-1/2 left-0 right-0 z-10 flex flex-col items-center text-center px-10">
        <h3 className="font-display text-3xl font-extrabold text-white mb-2 drop-shadow-lg transition-all duration-300">
          {msg.title}
        </h3>
        <p className="text-white/60 text-sm font-medium max-w-[260px] transition-all duration-300">
          {msg.subtitle}
        </p>

        {/* Step indicator dots */}
        <div className="flex items-center gap-2 mt-6">
          {(['email', 'otp', 'password', 'success'] as const).map((s, i) => {
            const stepOrder = ['email', 'otp', 'password', 'success'];
            const currentIndex = stepOrder.indexOf(step);
            const isActive = i === currentIndex;
            const isPast = i < currentIndex;
            return (
              <div
                key={s}
                className={`rounded-full transition-all duration-300 ${isActive
                  ? 'w-6 h-2 bg-white'
                  : isPast
                    ? 'w-2 h-2 bg-white/60'
                    : 'w-2 h-2 bg-white/20'
                  }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
  const { resetPassword, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email);
      setStep('otp');
      toast.success('OTP code sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const verifiedUserId = await verifyOTP(email, otpCode);
      setUserId(verifiedUserId);
      setStep('password');
      toast.success('OTP verified successfully');
    } catch (error: any) {
      toast.error(error.message || 'Invalid or expired OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!userId) {
      toast.error('Please verify OTP first');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.resetPassword(userId, newPassword);
      if (!response.success) {
        throw new Error(response.error || 'Failed to reset password');
      }
      setStep('success');
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/auth/signin');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---- Form content per step ---- */
  const renderForm = () => {
    if (step === 'success') {
      return (
        <div className="w-full max-w-md anim-slide-up" key="success">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-950 mb-2">
              Password Reset!
            </h1>
            <p className="text-gray-500 mb-8">
              Your password has been successfully reset. Redirecting you to sign in...
            </p>
            <Link to="/auth/signin">
              <Button className="h-11 px-8 font-semibold shadow-md shadow-primary/20">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    if (step === 'password') {
      return (
        <div className="w-full max-w-md anim-slide-up" key="password">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-950 mb-2">
              Set New Password
            </h1>
            <p className="text-gray-500">
              Choose a strong password for your account
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400">Must be at least 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-md shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          <button
            onClick={() => setStep('otp')}
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to OTP
          </button>
        </div>
      );
    }

    if (step === 'otp') {
      return (
        <div className="w-full max-w-md anim-slide-up" key="otp">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-950 mb-2">
              Enter Verification Code
            </h1>
            <p className="text-gray-500">
              We've sent a 6-digit code to <strong className="text-gray-700">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="otpCode">OTP Code</Label>
              <Input
                id="otpCode"
                type="text"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(value);
                }}
                maxLength={6}
                required
                className="h-14 text-center text-2xl font-mono tracking-[0.4em]"
              />
              <p className="text-xs text-gray-400">Enter the 6-digit code from your email</p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-md shadow-primary/20"
              disabled={isLoading || otpCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setStep('email')}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Use different email
            </button>
            <button
              className="text-sm text-primary hover:underline font-medium"
              onClick={async () => {
                setIsLoading(true);
                try {
                  await resetPassword(email);
                  toast.success('New OTP code sent');
                } catch {
                  toast.error('Failed to resend OTP');
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              Resend code
            </button>
          </div>
        </div>
      );
    }

    // Default: email step
    return (
      <div className="w-full max-w-md anim-slide-up" key="email">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-950 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-500">
            Enter your email address and we'll send you a verification code
          </p>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold shadow-md shadow-primary/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Verification Code'
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Remember your password?{' '}
          <Link to="/auth/signin" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Question mark panel (desktop only) */}
      <div className="hidden lg:block lg:w-1/2">
        <QuestionMarkPanel step={step} />
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white">
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
          {renderForm()}
        </div>
      </div>
    </div>
  );
}

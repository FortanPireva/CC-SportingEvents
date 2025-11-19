import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import SignInPage from '@/pages/auth/SignInPage';
import SignUpPage from '@/pages/auth/SignUpPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import EventsPage from '@/pages/dashboard/EventsPage';
import VenuesPage from '@/pages/dashboard/VenuesPage';
import CommunityPage from '@/pages/dashboard/CommunityPage';
import ReviewsPage from '@/pages/dashboard/ReviewsPage';
import HomePage from './pages/HomePage';
import VigiPage from './pages/VigiPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/vigi" element={<VigiPage />} />
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/events" element={<EventsPage />} />
        <Route path="/dashboard/venues" element={<VenuesPage />} />
        <Route path="/dashboard/community" element={<CommunityPage />} />
        <Route path="/dashboard/reviews" element={<ReviewsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;


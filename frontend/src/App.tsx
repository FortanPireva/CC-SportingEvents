import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import SignInPage from '@/pages/auth/SignInPage';
import SignUpPage from '@/pages/auth/SignUpPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import SetNewPasswordPage from '@/pages/auth/SetNewPasswordPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import EventsPage from '@/pages/dashboard/EventsPage';
import CommunityPage from '@/pages/dashboard/CommunityPage';
import ReviewsPage from '@/pages/dashboard/ReviewsPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import MyEventsPage from './pages/dashboard/MyEventsPage';
import CreateEventPage from './pages/dashboard/CreateEventPage';
import ParticipantsPage from './pages/dashboard/ParticipantsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/set-new-password" element={<SetNewPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/events" element={<EventsPage />} />
        <Route path="/dashboard/community" element={<CommunityPage />} />
        <Route path="/dashboard/reviews" element={<ReviewsPage />} />
        <Route path="/dashboard/my-events" element={<MyEventsPage />} />
        <Route path="/dashboard/create-event" element={<CreateEventPage />} />
        <Route path="/dashboard/participants" element={<ParticipantsPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;


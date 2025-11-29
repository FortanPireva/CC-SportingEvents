import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Activity, 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  Plus,
  MapPin,
  Star,
  Bell
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Events', href: '/dashboard/events', icon: Calendar },
    { name: 'Venues', href: '/dashboard/venues', icon: MapPin },
    { name: 'Community', href: '/dashboard/community', icon: Users },
    { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
  ];

  const organizerNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Events', href: '/dashboard/my-events', icon: Calendar },
    { name: 'Create Event', href: '/dashboard/create-event', icon: Plus },
    { name: 'Participants', href: '/dashboard/participants', icon: Users },
    // { name: 'Venues', href: '/dashboard/venues', icon: MapPin },
  ];

  const currentNavigation = user?.type === 'organizer' ? organizerNavigation : navigation;

  const NavLink = ({ item, mobile = false }: { item: typeof navigation[0], mobile?: boolean }) => (
    <Link
      to={item.href}
      className={cn(
        'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        pathname === item.href
          ? 'bg-primary text-primary-foreground'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        mobile && 'w-full'
      )}
      onClick={() => mobile && setIsMobileMenuOpen(false)}
    >
      <item.icon className="h-5 w-5" />
      <span>{item.name}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 py-6">
            <Activity className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-gray-900">CC Sports</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {currentNavigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>

          {/* User Info */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.type}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center px-4 py-6">
                    <Activity className="h-8 w-8 text-primary" />
                    <span className="ml-2 text-xl font-bold">CC Sports</span>
                  </div>
                  <nav className="flex-1 px-4 space-y-1">
                    {currentNavigation.map((item) => (
                      <NavLink key={item.name} item={item} mobile />
                    ))}
                  </nav>
                  <div className="p-4 border-t">
                    <Button 
                      onClick={handleSignOut}
                      variant="ghost" 
                      className="w-full justify-start"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold">CC Sports</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <div className="flex flex-col">
          {/* Desktop Header */}
          <div className="hidden lg:flex lg:items-center lg:justify-end lg:px-6 lg:py-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
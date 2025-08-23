import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// NEW: Import Avatar components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Film, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

// NEW: Helper function to get initials from a name
const getInitials = (name: string = ''): string => {
  if (!name) return '?';
  const nameParts = name.split(' ').filter(Boolean);
  if (nameParts.length === 0) return '?';

  const firstInitial = nameParts[0][0];
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';

  return `${firstInitial}${lastInitial}`.toUpperCase();
};


const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand Name */}
            <Link to="/" className="flex items-center space-x-2">
              <Film className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                CineMax
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <ThemeToggle />
              {user && (
                <>
                  <Link to="/bookings">
                    <Button variant="ghost">
                      <User className="h-4 w-4 mr-2" />
                      My Bookings
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-destructive dark:text-red-500 hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                  {/* NEW: User Avatar for Desktop */}
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </>
              )}
            </div>

            {/* Mobile Menu Button (Hamburger Icon) */}
            <div className="lg:hidden flex items-center">
              <Button onClick={() => setIsMenuOpen(true)} variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Drawer Content */}
          <div className="fixed top-0 right-0 z-50 h-full w-72 bg-background p-4 shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden"
            style={{ transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)' }}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold">Menu</span>
              <Button onClick={() => setIsMenuOpen(false)} variant="ghost" size="icon">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex flex-col space-y-2">
              {user && (
                <>

                  <Link to="/bookings" onClick={handleNavClick} className="border-b-[1px]">
                    <Button variant="ghost" className="w-full justify-start border-[1px] mb-6">
                      My Bookings
                    </Button>
                  </Link>
                  <div className="flex flex-col items-start justify-center">
                    <div className="flex items-center space-x-3 p-2">
                      <Avatar>
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{user.name}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-destructive dark:text-red-500 hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </>
      )}

      <main className="min-h-[calc(100vh-4rem)] w-full">
        {children}
      </main>
    </div >
  );
};

export default Layout;

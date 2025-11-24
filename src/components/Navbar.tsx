import { Link, useLocation } from 'wouter';
import { LogOut, Home, LayoutDashboard, Shield, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';

interface NavbarProps {
  user: any;
  isAdmin: boolean;
  onLogout: () => void;
}

export function Navbar({ user, isAdmin, onLogout }: NavbarProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/">
              <a className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Nomad
                </span>
              </a>
            </Link>
            
            {user && (
              <div className="flex gap-1">
                <Link href="/">
                  <a>
                    <Button
                      variant={location === '/' ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-2"
                    >
                      <Home className="size-4" />
                      Home
                    </Button>
                  </a>
                </Link>
                <Link href="/dashboard">
                  <a>
                    <Button
                      variant={location === '/dashboard' ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-2"
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Button>
                  </a>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <a>
                      <Button
                        variant={location === '/admin' ? 'default' : 'ghost'}
                        size="sm"
                        className="gap-2"
                      >
                        <Shield className="size-4" />
                        Admin Panel
                      </Button>
                    </a>
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </Button>
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm">{user.username}</span>
                  {isAdmin && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="gap-2"
                >
                  <LogOut className="size-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <a>
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </a>
                </Link>
                <Link href="/signup">
                  <a>
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
import { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { createClient } from '@supabase/supabase-js';
import { ThemeProvider } from './components/ThemeProvider';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    checkUser();
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae8fa403/initialize`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
    } catch (err) {
      console.error('Error initializing system:', err);
    }
  };

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ae8fa403/user`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAdmin(data.user.isAdmin || false);
        }
      }
    } catch (err) {
      console.error('Error checking user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      setLocation('/');
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Error logging out:', err);
      toast.error('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">N</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="nomad-ui-theme">
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/login">
              <LoginPage onLoginSuccess={checkUser} />
            </Route>
            <Route path="/signup" component={SignupPage} />
            <Route path="/dashboard">
              {user ? <Dashboard /> : <LoginPage onLoginSuccess={checkUser} />}
            </Route>
            <Route path="/admin">
              {user && isAdmin ? (
                <AdminPanel />
              ) : (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl mb-2">Access Denied</h1>
                    <p className="text-muted-foreground mb-4">
                      You need admin privileges to access this page
                    </p>
                  </div>
                </div>
              )}
            </Route>
          </Switch>
        </main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
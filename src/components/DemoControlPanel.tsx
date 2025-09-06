import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mockUser, mockAdminUser, mockHRUser, mockPrestadorUser } from '@/data/mockData';
import { 
  User, 
  Shield, 
  Building2, 
  UserCheck,
  LogOut,
  Settings,
  ChevronUp,
  ChevronDown,
  Play
} from 'lucide-react';

const DemoControlPanel = () => {
  const { profile, login, logout } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const demoUsers = [
    { ...mockUser, title: 'Utilizador', icon: User, role: 'user' as const, color: 'bg-blue-500' },
    { ...mockPrestadorUser, title: 'Prestador', icon: UserCheck, role: 'prestador' as const, color: 'bg-green-500' },
    { ...mockHRUser, title: 'RH', icon: Building2, role: 'hr' as const, color: 'bg-purple-500' },
    { ...mockAdminUser, title: 'Admin', icon: Shield, role: 'admin' as const, color: 'bg-red-500' }
  ];

  const handleRoleSwitch = async (demoUser: typeof demoUsers[0]) => {
    setIsTransitioning(true);
    try {
      const result = await login(demoUser.email, 'demo-password');
      if (!result.error) {
        // Navigate to appropriate dashboard based on role
        const dashboardPaths = {
          user: '/user/sessions',
          prestador: '/prestador/dashboard',
          hr: '/company/dashboard',
          admin: '/admin/users'
        };
        navigate(dashboardPaths[demoUser.role]);
      }
    } catch (error) {
      console.error('Role switch failed:', error);
    } finally {
      setIsTransitioning(false);
      setIsExpanded(false);
    }
  };

  const handleLogout = async () => {
    setIsTransitioning(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsTransitioning(false);
      setIsExpanded(false);
    }
  };

  // Don't show on demo page itself
  if (window.location.pathname === '/demo') return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="bg-card/95 backdrop-blur-sm border shadow-lg">
        <CardContent className="p-3">
          {/* Header with current user info */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/20 rounded-full">
                <Play className="h-3 w-3 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary">Demo</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
          </div>

          {profile && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {demoUsers.find(u => u.role === profile.role)?.title}
              </Badge>
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {profile.name}
              </span>
            </div>
          )}

          {isExpanded && (
            <div className="space-y-2 pt-2 border-t">
              {/* Quick actions */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/demo')}
                  className="flex items-center gap-1 text-xs h-7"
                >
                  <Settings className="h-3 w-3" />
                  Demo Completo
                </Button>
                {profile && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLogout}
                    disabled={isTransitioning}
                    className="text-xs h-7"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Role switcher */}
              <div className="grid grid-cols-2 gap-1">
                {demoUsers.map((demoUser) => {
                  const IconComponent = demoUser.icon;
                  const isCurrentUser = profile?.role === demoUser.role;
                  
                  return (
                    <Button
                      key={demoUser.role}
                      variant={isCurrentUser ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => handleRoleSwitch(demoUser)}
                      disabled={isCurrentUser || isTransitioning}
                      className="flex items-center gap-1 text-xs h-8 justify-start"
                    >
                      <div className={`p-1 rounded-full ${demoUser.color} text-white`}>
                        <IconComponent className="h-2.5 w-2.5" />
                      </div>
                      {demoUser.title}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {isTransitioning && (
            <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center rounded">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoControlPanel;
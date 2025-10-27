import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Building2, 
  UserCheck,
  Users,
  LogOut,
  Settings,
  ChevronUp,
  ChevronDown,
  Play,
  Minimize2,
  Maximize2,
  GripVertical
} from 'lucide-react';

// Demo users for testing
const demoUsers = [
  { 
    email: 'ana.silva@prestador.com', 
    title: 'Affiliate', 
    icon: UserCheck, 
    role: 'prestador' as const, 
    color: 'bg-green-500',
    name: 'Dra. Ana Silva',
    password: 'demo123'
  },
  { 
    email: 'rh@empresademo.com', 
    title: 'RH', 
    icon: Building2, 
    role: 'hr' as const, 
    color: 'bg-purple-500',
    name: 'Maria Silva',
    password: 'demo123'
  },
  { 
    email: 'admin@onhigh.com', 
    title: 'Admin', 
    icon: Shield, 
    role: 'admin' as const, 
    color: 'bg-red-500',
    name: 'Admin OnHigh',
    password: 'demo123'
  },
  { 
    email: 'specialist@onhigh.com', 
    title: 'Profissional de Permanencia', 
    icon: Users, 
    role: 'especialista_geral' as const, 
    color: 'bg-orange-500',
    name: 'Especialista Geral',
    password: 'demo123'
  }
];

const mockUser = demoUsers[0];
const mockAdminUser = demoUsers[2];
const mockHRUser = demoUsers[1];
const mockPrestadorUser = demoUsers[0];
const mockEspecialistaGeralUser = demoUsers[3];

const DemoControlPanel = () => {
  const { profile, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [position, setPosition] = useState(() => {
    // Use window.location.pathname for initial render since location might not be ready
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    if (currentPath === '/terms') {
      return { x: window.innerWidth - 300, y: 16 }; // Top right corner
    }
    return { x: 16, y: window.innerHeight - 200 }; // Default bottom left
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const demoUsers = [
    { ...mockPrestadorUser, title: 'Affiliate', icon: UserCheck, role: 'prestador' as const, color: 'bg-green-500' },
    { ...mockHRUser, title: 'RH', icon: Building2, role: 'hr' as const, color: 'bg-purple-500' },
    { ...mockAdminUser, title: 'Admin', icon: Shield, role: 'admin' as const, color: 'bg-red-500' },
    { ...mockEspecialistaGeralUser, title: 'Profissional de Permanencia', icon: Users, role: 'especialista_geral' as const, color: 'bg-orange-500' }
  ];

  const handleRoleSwitch = async (demoUser: typeof demoUsers[0]) => {
    setIsTransitioning(true);
    try {
      const result = await login(demoUser.email, 'demo-password');
      if (!result.error) {
        // Navigate to appropriate dashboard based on role
        const dashboardPaths = {
          prestador: '/prestador/dashboard',
          hr: '/company/dashboard',
          admin: '/admin/dashboard',
          especialista_geral: '/especialista/dashboard'
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

  // Reset position on page change
  useEffect(() => {
    if (location.pathname === '/terms') {
      setPosition({ x: window.innerWidth - 300, y: 16 }); // Top right corner
    } else {
      setPosition({ x: 16, y: window.innerHeight - 200 }); // Default bottom left
    }
    setIsExpanded(false);
  }, [location.pathname]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 200);
      const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 100);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Handle window resize to maintain position for terms page
  useEffect(() => {
    const handleResize = () => {
      if (location.pathname === '/terms') {
        setPosition(prevPosition => ({
          ...prevPosition,
          x: window.innerWidth - 300, // Maintain top right positioning
          y: Math.min(prevPosition.y, 16) // Keep at top if it was already there
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  // Don't show on demo page itself
  if (window.location.pathname === '/demo') return null;

  return (
    <div 
      ref={panelRef}
      className="fixed z-50 transition-opacity"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <Card className="bg-card/95 backdrop-blur-sm border shadow-lg">
        <CardContent className="p-3" onMouseDown={handleMouseDown}>
          {/* Header with current user info */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab" />
              {!isMinimized && (
                <>
                  <div className="p-1.5 bg-primary/20 rounded-full">
                    <Play className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-primary">Demo</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
                title={isMinimized ? "Maximizar" : "Minimizar"}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              {!isMinimized && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0"
                  title={isExpanded ? "Recolher" : "Expandir"}
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </Button>
              )}
            </div>
          </div>

          {!isMinimized && profile && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {demoUsers.find(u => u.role === profile.role)?.title}
              </Badge>
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {profile.name}
              </span>
            </div>
          )}

          {!isMinimized && isExpanded && (
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
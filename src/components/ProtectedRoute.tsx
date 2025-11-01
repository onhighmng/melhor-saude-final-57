import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_REDIRECT_MAP } from '@/utils/authRedirects';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'hr' | 'prestador' | 'user' | 'especialista_geral';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
}) => {
  const { isAuthenticated, profile, isLoading } = useAuth();
  const location = useLocation();

  // 1. Show a full-page loading spinner while the auth state is being determined.
  // This is the key fix that prevents all race conditions.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 2. If not authenticated after loading, redirect to login.
  if (!isAuthenticated || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If a specific role is required and the user doesn't have it, BLOCK ACCESS
  if (requiredRole && profile.role !== requiredRole) {
    console.warn(`%c[ProtectedRoute] ❌ ACCESS DENIED`, 'color: red; font-weight: bold;');
    console.warn(`%c  Required role: ${requiredRole}`, 'color: red;');
    console.warn(`%c  User has role: ${profile.role}`, 'color: red;');
    console.warn(`%c  Redirecting to correct dashboard...`, 'color: orange;');
    
    // Redirect to the user's correct dashboard based on their actual role
    const correctDashboard = ROLE_REDIRECT_MAP[profile.role as keyof typeof ROLE_REDIRECT_MAP] || '/user/dashboard';
    
    console.warn(`%c  Redirecting to: ${correctDashboard}`, 'color: orange; font-weight: bold;');
    return <Navigate to={correctDashboard} replace />;
  }

  // 4. If all checks pass, render the requested page.
  return <>{children}</>;
};

export default ProtectedRoute;

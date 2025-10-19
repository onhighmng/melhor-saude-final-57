import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'hr' | 'prestador' | 'user' | 'especialista_geral')[];
  requiredRole?: 'admin' | 'hr' | 'prestador' | 'user' | 'especialista_geral';
  strictDashboardOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [],
  requiredRole,
  strictDashboardOnly = false
}) => {
  const { isAuthenticated, profile, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Navigate to login if not authenticated
  if (!isAuthenticated || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRole && profile.role !== requiredRole) {
    // Navigate based on actual user role
    switch (profile.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'hr':
        return <Navigate to="/company/dashboard" replace />;
      case 'prestador':
        return <Navigate to="/prestador/dashboard" replace />;
      case 'especialista_geral':
        return <Navigate to="/especialista/dashboard" replace />;
      default:
        return <Navigate to="/user/dashboard" replace />;
    }
  }

  // Check if user role is in allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    // Navigate based on actual user role
    switch (profile.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'hr':
        return <Navigate to="/company/dashboard" replace />;
      case 'prestador':
        return <Navigate to="/prestador/dashboard" replace />;
      case 'especialista_geral':
        return <Navigate to="/especialista/dashboard" replace />;
      default:
        return <Navigate to="/user/dashboard" replace />;
    }
  }

  // Strict dashboard enforcement for admin, HR, and prestador users
  if (strictDashboardOnly) {
    if (profile.role === 'admin' && location.pathname !== '/admin/dashboard') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (profile.role === 'hr' && location.pathname !== '/company/dashboard') {
      return <Navigate to="/company/dashboard" replace />;
    }
    if (profile.role === 'prestador' && !location.pathname.startsWith('/prestador/')) {
      return <Navigate to="/prestador/dashboard" replace />;
    }
  }

  // Global restriction - no user routes accessible in demo
  if (location.pathname.startsWith('/user/')) {
    // Redirect based on actual user role
    switch (profile.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'hr':
        return <Navigate to="/company/dashboard" replace />;
      case 'prestador':
        return <Navigate to="/prestador/dashboard" replace />;
      case 'especialista_geral':
        return <Navigate to="/especialista/dashboard" replace />;
      default:
        return <Navigate to="/demo" replace />;
    }
  }

  // Global prestador access restriction - dynamic route matrix
  const allowedPublicRoutes = ['/', '/login', '/register/company', '/register/employee', '/reset-password'];
  const isPrestadorOnPublicRoute = profile.role === 'prestador' && allowedPublicRoutes.includes(location.pathname);
  const isPrestadorOnAllowedRoute = profile.role === 'prestador' && location.pathname.startsWith('/prestador/');
  
  if (profile.role === 'prestador' && !isPrestadorOnPublicRoute && !isPrestadorOnAllowedRoute) {
    return <Navigate to="/prestador/dashboard" replace />;
  }

  // Global especialista_geral access restriction - dynamic route matrix
  const isEspecialistaOnPublicRoute = profile.role === 'especialista_geral' && allowedPublicRoutes.includes(location.pathname);
  const isEspecialistaOnAllowedRoute = profile.role === 'especialista_geral' && location.pathname.startsWith('/especialista/');
  
  if (profile.role === 'especialista_geral' && !isEspecialistaOnPublicRoute && !isEspecialistaOnAllowedRoute) {
    return <Navigate to="/especialista/dashboard" replace />;
  }

  return <>{children}</>;
};

// Higher-order component for strict dashboard enforcement
export const StrictDashboardRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute strictDashboardOnly={true}>
      {children}
    </ProtectedRoute>
  );
};

// Component specifically for admin-only access
export const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin" strictDashboardOnly={true}>
      {children}
    </ProtectedRoute>
  );
};

// Component specifically for HR-only access
export const HROnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="hr" strictDashboardOnly={true}>
      {children}
    </ProtectedRoute>
  );
};

// Component specifically for prestador-only access
export const PrestadorOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="prestador" strictDashboardOnly={true}>
      {children}
    </ProtectedRoute>
  );
};
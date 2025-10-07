import React, { createContext, useContext, useState } from 'react';
import { mockUser, mockAdminUser, mockHRUser, mockPrestadorUser } from '@/data/mockData';
import { generateUUID } from '@/utils/uuid';

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'hr' | 'prestador';
  company?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  session: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isPrestador: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Mock authentication state - defaulting to authenticated user
  const mockUserWithUserId = { ...mockUser, user_id: mockUser.id };
  const mockAdminUserWithUserId = { ...mockAdminUser, user_id: mockAdminUser.id };
  const mockHRUserWithUserId = { ...mockHRUser, user_id: mockHRUser.id };
  const mockPrestadorUserWithUserId = { ...mockPrestadorUser, user_id: mockPrestadorUser.id };

  const [user, setUser] = useState<any>({
    id: mockUserWithUserId.id,
    email: mockUserWithUserId.email
  });
  const [session, setSession] = useState<any>({
    access_token: 'mock-token'
  });
  const [profile, setProfile] = useState<UserProfile | null>(mockUserWithUserId);
  const [isLoading, setIsLoading] = useState(false);

  // Mock authentication methods
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Mock login logic based on email
      let mockUserData: UserProfile = mockUserWithUserId;
      if (email.includes('admin')) {
        mockUserData = mockAdminUserWithUserId;
      } else if (email.includes('rh')) {
        mockUserData = mockHRUserWithUserId;
      } else if (email.includes('prestador')) {
        mockUserData = mockPrestadorUserWithUserId;
      }
      
      setUser({ id: mockUserData.id, email: mockUserData.email });
      setSession({ access_token: 'mock-token' });
      setProfile(mockUserData);
      
      return {};
    } catch (error) {
      return { error: 'Credenciais inválidas' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      const newUserId = generateUUID();
      const newUser = {
        ...mockUserWithUserId,
        email,
        name,
        id: newUserId,
        user_id: newUserId
      };
      
      setUser({ id: newUser.id, email: newUser.email });
      setSession({ access_token: 'mock-token' });
      setProfile(newUser);
      
      return {};
    } catch (error) {
      return { error: 'Erro ao criar conta' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Mock password reset - just return success
      return {};
    } catch (error) {
      return { error: 'Erro ao redefinir palavra-passe' };
    }
  };

  const logout = async () => {
    try {
      // Clear all state first
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Clear any stored redirect intentions
      localStorage.removeItem('auth_redirect_intent');
      localStorage.removeItem('navigation_history');
      
      // Small delay to ensure state is cleared before navigation
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Don't navigate here - let the component handle navigation
      // window.location.href = '/';
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Computed values
  const isAuthenticated = !!user && !!profile;
  const isAdmin = profile?.role === 'admin';
  const isHR = profile?.role === 'hr';
  const isPrestador = profile?.role === 'prestador';

  const value: AuthContextType = {
    user,
    profile,
    session,
    isAuthenticated,
    isAdmin,
    isHR,
    isPrestador,
    login,
    signup,
    resetPassword,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
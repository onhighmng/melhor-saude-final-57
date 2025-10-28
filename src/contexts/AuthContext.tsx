import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'hr' | 'prestador' | 'especialista_geral';
  company?: string;
  company_id?: string | null;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  metadata?: Record<string, unknown>;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isPrestador: boolean;
  isEspecialistaGeral: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to load profile with roles from user_roles table
  const loadProfileWithRoles = async (userId: string): Promise<UserProfile> => {
    const [profileResult, rolesResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('user_roles').select('role').eq('user_id', userId)
    ]);

    if (profileResult.error) throw profileResult.error;
    
    const roles = rolesResult.data?.map(r => r.role) || [];
    const primaryRole = roles.includes('admin') ? 'admin' 
      : roles.includes('hr') ? 'hr'
      : roles.includes('prestador') ? 'prestador'
      : roles.includes('specialist') ? 'specialist'
      : 'user';

    return {
      ...profileResult.data,
      user_id: profileResult.data.id,
      is_active: profileResult.data.is_active ?? true,
      role: primaryRole as 'admin' | 'user' | 'hr' | 'prestador' | 'especialista_geral'
    };
  };

  // Real authentication methods
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Query user_roles table for secure role checking
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id);
      
      if (rolesError) throw rolesError;
      
      // Determine primary role (admin takes precedence)
      const roles = userRoles?.map(r => r.role) || [];
      const primaryRole = roles.includes('admin') ? 'admin' 
        : roles.includes('hr') ? 'hr'
        : roles.includes('prestador') ? 'prestador'
        : roles.includes('specialist') ? 'specialist'
        : 'user';
      
      setUser(data.user);
      setSession(data.session);
      setProfile({
        ...profileData,
        user_id: profileData.id,
        is_active: profileData.is_active ?? true,
        role: primaryRole as 'admin' | 'user' | 'hr' | 'prestador' | 'especialista_geral'
      });
      
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Credenciais inválidas';
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { name } }
      });
      
      if (error) throw error;
      
      // Create profile WITHOUT role
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user!.id,
          email,
          name
        });
      
      if (profileError && profileError.code !== '23505') throw profileError;

      // Create role in user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user!.id,
          role: 'user'
        });

      if (roleError && roleError.code !== '23505') throw roleError;
      
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta';
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`
      });
      if (error) throw error;
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao redefinir palavra-passe';
      return { error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setProfile(null);
      localStorage.removeItem('auth_redirect_intent');
      localStorage.removeItem('navigation_history');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const profileData = await loadProfileWithRoles(session.user.id);
          setProfile(profileData);
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const profileData = await loadProfileWithRoles(session.user.id);
          setProfile(profileData);
        } catch (error) {
          console.error('Error loading profile:', error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Computed values
  const isAuthenticated = !!user && !!profile;
  const isAdmin = profile?.role === 'admin';
  const isHR = profile?.role === 'hr';
  const isPrestador = profile?.role === 'prestador';
  const isEspecialistaGeral = profile?.role === 'especialista_geral';

  const value: AuthContextType = {
    user,
    profile,
    session,
    isAuthenticated,
    isAdmin,
    isHR,
    isPrestador,
    isEspecialistaGeral,
    login,
    signup,
    resetPassword,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
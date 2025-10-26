import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  metadata?: any;
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
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        : roles.includes('especialista_geral') ? 'especialista_geral'
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
    } catch (error: any) {
      return { error: error.message || 'Credenciais inválidas' };
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
      
      // Create profile if not exists
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user!.id,
          email,
          name,
          role: 'user'
        });
      
      if (profileError && profileError.code !== '23505') throw profileError;
      
      return {};
    } catch (error: any) {
      return { error: error.message || 'Erro ao criar conta' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      return {};
    } catch (error: any) {
      return { error: error.message || 'Erro ao redefinir palavra-passe' };
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Load profile
        supabase.from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setProfile({
                ...data,
                user_id: data.id,
                is_active: data.is_active ?? true,
                role: (data.role || 'user') as 'admin' | 'user' | 'hr' | 'prestador' | 'especialista_geral'
              });
            }
          });
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setProfile({
                ...data,
                user_id: data.id,
                is_active: data.is_active ?? true,
                role: (data.role || 'user') as 'admin' | 'user' | 'hr' | 'prestador' | 'especialista_geral'
              });
            }
          });
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
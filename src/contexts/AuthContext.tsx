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
  login: (email: string, password: string) => Promise<{ error?: string; profile?: UserProfile }>;
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
  const loadingProfileRef = React.useRef(false);

  // Helper function to load profile with roles from user_roles table
  const loadProfileWithRoles = async (userId: string): Promise<UserProfile | null> => {
    // Deduplication: If already loading, skip
    if (loadingProfileRef.current) {
      console.log('[Auth] Profile load already in progress, skipping');
      return null;
    }

    loadingProfileRef.current = true;
    const startTime = performance.now();

    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const [profileResult, rolesResult] = await Promise.allSettled([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_roles').select('role').eq('user_id', userId)
      ]);

      // Handle profile result
      let profileData: any = null;
      if (profileResult.status === 'fulfilled') {
        if (profileResult.value.error) {
          console.error('Profile load error:', profileResult.value.error);
          // Don't throw - return minimal profile instead
        } else {
          profileData = profileResult.value.data;
        }
      } else {
        console.error('Profile load promise rejected:', profileResult.reason);
      }

      // If no profile found, return minimal profile to prevent complete failure
      if (!profileData) {
        console.warn(`[Auth] No profile found for user ${userId}, returning minimal profile`);
        return {
          id: userId,
          user_id: userId,
          name: 'User',
          email: '',
          role: 'user',
          is_active: false,
          metadata: {},
        };
      }

      // Handle roles result
      let roles: string[] = [];
      if (rolesResult.status === 'fulfilled') {
        if (rolesResult.value.error) {
          console.error('Roles load error:', rolesResult.value.error);
        } else {
          roles = rolesResult.value.data?.map(r => r.role) || [];
        }
      } else {
        console.error('Roles load promise rejected:', rolesResult.reason);
      }
      
      const primaryRole = roles.includes('admin') ? 'admin' 
        : roles.includes('hr') ? 'hr'
        : roles.includes('prestador') ? 'prestador'
        : roles.includes('specialist') ? 'specialist'
        : 'user';

      const loadTime = performance.now() - startTime;
      console.log(`[Auth] Profile loaded in ${loadTime.toFixed(0)}ms`);

      return {
        ...profileData,
        user_id: profileData.id,
        is_active: profileData.is_active ?? true,
        role: primaryRole as 'admin' | 'user' | 'hr' | 'prestador' | 'especialista_geral',
        metadata: (profileData.metadata as Record<string, unknown>) || {}
      };
    } catch (error) {
      console.error('[Auth] Unexpected error loading profile:', error);
      // Return minimal profile instead of null to prevent auth failures
      return {
        id: userId,
        user_id: userId,
        name: 'User',
        email: '',
        role: 'user',
        is_active: false,
        metadata: {},
      };
    } finally {
      loadingProfileRef.current = false;
    }
  };

  // Real authentication methods
  const login = async (email: string, password: string) => {
    const startTime = performance.now();
    
    // Validate inputs before attempting login
    if (!email || !password) {
      return { error: 'Por favor, preencha todos os campos' };
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: 'Por favor, insira um email válido' };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid password')) {
          return { error: 'Email ou senha incorretos' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.' };
        }
        if (error.message.includes('Too many requests')) {
          return { error: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.' };
        }
        
        throw error;
      }
      
      // Ensure session is properly set
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }
      
      // Wait a moment for profile to be available
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const authTime = performance.now() - startTime;
      console.log(`[Auth] Login completed in ${authTime.toFixed(0)}ms`);
      
      // Let onAuthStateChange handle profile loading for consistency
      // This eliminates race conditions and duplicate loads
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Credenciais inválidas';
      return { error: errorMessage };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!email || !password || !name) {
        return { error: 'Por favor, preencha todos os campos' };
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: 'Por favor, insira um email válido' };
      }
      
      if (password.length < 8) {
        return { error: 'A senha deve ter pelo menos 8 caracteres' };
      }
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          return { error: 'Este email já está registado. Tente fazer login ou recuperar sua senha.' };
        }
        if (error.message.includes('Password') && error.message.includes('weak')) {
          return { error: 'A senha é muito fraca. Use pelo menos 8 caracteres com letras e números.' };
        }
        throw error;
      }
      
      if (!data.user) {
        return { error: 'Falha ao criar utilizador' };
      }
      
      const userId = data.user.id;
      
      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Ensure session is set
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }
      
      // Create profile with error handling
      const profilePromise = supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          name,
          role: 'user'
        });
      
      // Create role with error handling
      const rolePromise = supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'user',
          created_by: userId
        });
      
      // Use allSettled to handle partial failures
      const [profileResult, roleResult] = await Promise.allSettled([
        profilePromise,
        rolePromise
      ]);
      
      // Log errors but don't fail completely
      if (profileResult.status === 'rejected') {
        console.error('Profile creation failed:', profileResult.reason);
      } else if (profileResult.value.error && profileResult.value.error.code !== '23505') {
        console.error('Profile creation error:', profileResult.value.error);
      }
      
      if (roleResult.status === 'rejected') {
        console.error('Role creation failed:', roleResult.reason);
      } else if (roleResult.value.error && roleResult.value.error.code !== '23505') {
        console.error('Role creation error:', roleResult.value.error);
      }
      
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
      // Silent fail for logout errors
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    let mounted = true;
    
    // Check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const profileData = await loadProfileWithRoles(session.user.id);
          if (mounted) setProfile(profileData);
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      }
      
      if (mounted) setIsLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Always load profile when there's a session for consistency
      if (session?.user) {
        try {
          const profileData = await loadProfileWithRoles(session.user.id);
          if (mounted && profileData) setProfile(profileData);
        } catch (error) {
          console.error('Failed to load profile:', error);
          if (mounted) setProfile(null);
        }
      } else if (!session) {
        if (mounted) setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty deps - only run once on mount

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
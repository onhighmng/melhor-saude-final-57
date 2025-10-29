import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Helper function to load profile with roles - FIXED VERSION
  const loadProfileWithRoles = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log(`%c[AuthContext] 🔍 userId passed to loadProfileWithRoles:`, 'color: blue; font-weight: bold;', userId);
    console.log(`%c[AuthContext] Loading profile for user: ${userId}`, 'color: blue;');
    
    try {
      console.log('%c[AuthContext] Starting profile and roles queries...', 'color: blue;');
      const startQueryTime = performance.now();

      // DIAGNOSTIC: First try direct queries without timeout to see actual errors
      console.log('%c[AuthContext] 🔍 Attempting direct profile query (no timeout)...', 'color: yellow;');
      
      let profileData: any = null;
      let roles: string[] = [];

      // Try profile query with a 5-second manual timeout - CRITICAL: Queries hang, so short timeout
      const profileQueryStart = performance.now();
      let profileTimeout = false;
      try {
        const profileQuery = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        // Add progress checker (will be cleared on timeout)
        const progressInterval = setInterval(() => {
          const elapsed = performance.now() - profileQueryStart;
          console.log(`%c[AuthContext] ⏳ Profile query still running... ${(elapsed / 1000).toFixed(1)}s`, 'color: orange;');
        }, 2000);

        const profileResponse = await Promise.race([
          profileQuery,
          new Promise((_, reject) => {
            setTimeout(() => {
              profileTimeout = true;
              clearInterval(progressInterval);
              reject(new Error('Profile query timeout after 5s'));
            }, 5000); // Reduced to 5 seconds - queries hang indefinitely
          })
        ]) as any;

        clearInterval(progressInterval);

        if (profileResponse && !profileResponse.error && profileResponse.data) {
          profileData = profileResponse.data;
          console.log(`%c[AuthContext] ✅ Profile found in ${(performance.now() - profileQueryStart).toFixed(0)}ms`, 'color: green; font-weight: bold;', profileData);
        } else {
          console.error('%c[AuthContext] ❌ Profile query error:', 'color: red;', profileResponse?.error);
        }
      } catch (profileError: any) {
        if (profileTimeout) {
          console.error('%c[AuthContext] ❌ Profile query TIMED OUT after 5s - database queries are hanging. Using fallback.', 'color: red; font-weight: bold;');
          // Return immediately with minimal profile - don't wait for roles query
          const queryTime = performance.now() - startQueryTime;
          console.log(`%c[AuthContext] Queries aborted after ${queryTime.toFixed(0)}ms - returning minimal profile`, 'color: cyan;');
          
          return {
            id: userId,
            user_id: userId,
            name: user?.user_metadata?.name || 'User',
            email: user?.email || '',
            role: 'user',
            is_active: false,
            metadata: {},
          };
        } else {
          console.error('%c[AuthContext] ❌ Profile query failed:', 'color: red; font-weight: bold;', profileError);
        }
      }

      // Only try roles query if profile query succeeded (no point waiting if profile already failed)
      if (!profileData) {
        console.warn('%c[AuthContext] Skipping roles query - profile query failed', 'color: orange;');
      } else {
        const rolesQueryStart = performance.now();
        let rolesTimeout = false;
        try {
          const rolesQuery = supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId);
          
          // Add progress checker
          const progressInterval = setInterval(() => {
            const elapsed = performance.now() - rolesQueryStart;
            console.log(`%c[AuthContext] ⏳ Roles query still running... ${(elapsed / 1000).toFixed(1)}s`, 'color: orange;');
          }, 2000);

          const rolesResponse = await Promise.race([
            rolesQuery,
            new Promise((_, reject) => {
              setTimeout(() => {
                rolesTimeout = true;
                clearInterval(progressInterval);
                reject(new Error('Roles query timeout after 5s'));
              }, 5000);
            })
          ]) as any;

          clearInterval(progressInterval);

          if (rolesResponse && !rolesResponse.error && rolesResponse.data) {
            roles = rolesResponse.data.map((r: any) => r.role) || [];
            console.log(`%c[AuthContext] ✅ Roles found in ${(performance.now() - rolesQueryStart).toFixed(0)}ms`, 'color: green; font-weight: bold;', roles);
          } else {
            console.error('%c[AuthContext] ❌ Roles query error:', 'color: red;', rolesResponse?.error);
          }
        } catch (rolesError: any) {
          if (rolesTimeout) {
            console.error('%c[AuthContext] ❌ Roles query TIMED OUT after 5s - but we have profile, continuing...', 'color: orange;');
            // Continue with profile data, just use default 'user' role
          } else {
            console.error('%c[AuthContext] ❌ Roles query failed:', 'color: red; font-weight: bold;', rolesError);
          }
        }
      }

      const queryTime = performance.now() - startQueryTime;
      console.log(`%c[AuthContext] All queries completed in ${queryTime.toFixed(0)}ms`, 'color: cyan;');

      // If no profile found, return minimal profile to prevent complete failure
      if (!profileData) {
        console.warn(`%c[AuthContext] No profile found for user ${userId}, returning minimal profile`, 'color: orange;');
        return {
          id: userId,
          user_id: userId,
          name: 'User',
          email: user?.email || '',
          role: 'user',
          is_active: false,
          metadata: {},
        };
      }

      const primaryRole = roles.includes('admin') ? 'admin' 
        : roles.includes('hr') ? 'hr'
        : roles.includes('prestador') ? 'prestador'
        : roles.includes('especialista_geral') ? 'especialista_geral'
        : 'user';

      const finalProfile = {
        ...profileData,
        user_id: profileData.id,
        is_active: profileData.is_active ?? true,
        role: primaryRole as 'admin' | 'user' | 'hr' | 'prestador' | 'especialista_geral',
        metadata: (profileData.metadata as Record<string, unknown>) || {},
      };

      console.log('%c[AuthContext] Final profile:', 'color: green; font-weight: bold;', finalProfile);
      return finalProfile;
    } catch (error) {
      console.error('%c[AuthContext] Unexpected error loading profile:', 'color: red; font-weight: bold;', error);
      // Return minimal profile instead of null to prevent auth failures
      return {
        id: userId,
        user_id: userId,
        name: 'User',
        email: user?.email || '',
        role: 'user',
        is_active: false,
        metadata: {},
      };
    }
  }, [user]);

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
      
      const authTime = performance.now() - startTime;
      console.log(`%c[AuthContext] Login completed in ${authTime.toFixed(0)}ms`, 'color: green;');
      
      // Let onAuthStateChange handle profile loading for consistency
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

  // Listen for auth state changes - FIXED VERSION
  useEffect(() => {
    let mounted = true;
    
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('%c[AuthContext] Initial session check:', 'color: yellow;', session?.user?.id || 'No session');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // FIX: Set fallback profile immediately from session (demo-ready)
        const immediateFallbackProfile: UserProfile = {
          id: session.user.id,
          user_id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: 'user',
          is_active: true,
          metadata: {},
        };
        setProfile(immediateFallbackProfile);
        setIsLoading(false); // Set loading false immediately
        console.log('%c[AuthContext] ✅ Initial fallback profile set from session (demo-ready):', 'color: green; font-weight: bold;', immediateFallbackProfile);
        
        // Try to load full profile in background (non-blocking)
        queueMicrotask(async () => {
          try {
            console.log('%c[AuthContext] 🔄 Attempting background profile load on mount...', 'color: cyan;');
          const profileData = await loadProfileWithRoles(session.user.id);
            // FIX: Always update if we got profile data (remove role check)
            if (mounted && profileData) {
              setProfile(profileData);
              console.log('%c[AuthContext] ✅ Background profile loaded and updated:', 'color: green;', profileData);
            }
        } catch (error) {
            console.warn('%c[AuthContext] ⚠️ Background profile load failed (using fallback):', 'color: orange;', error);
          }
        });
      } else {
        if (mounted) {
          setProfile(null);
          setIsLoading(false);
        }
      }
    });

    // Listen for auth changes (login, logout, token refresh, etc) - FIXED VERSION
    // CRITICAL FIX: Make handler synchronous - don't await inside onAuthStateChange
    // This prevents Supabase client deadlock issues
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log(`%c[AuthContext] Auth event: ${event}`, 'color: yellow; font-weight: bold;');
      
      // Set state synchronously - CRITICAL: No async calls in this handler
      setSession(session);
      setUser(session?.user ?? null);
      
      // FIX: Create profile immediately from session data (demo-ready, no DB wait)
      if (session?.user) {
        // Create fallback profile immediately from session data (demo-ready)
        const immediateFallbackProfile: UserProfile = {
          id: session.user.id,
          user_id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: 'user', // Will be updated if profile loads successfully in background
          is_active: true,
          metadata: {},
        };
        setProfile(immediateFallbackProfile);
        setIsLoading(false); // Set loading false immediately - don't wait for DB
        console.log('%c[AuthContext] ✅ Immediate fallback profile set from session (demo-ready):', 'color: green; font-weight: bold;', immediateFallbackProfile);
        
        // Try to load full profile in background (non-blocking)
        // Use queueMicrotask to defer execution outside the handler
        queueMicrotask(async () => {
          try {
            console.log('%c[AuthContext] 🔄 Attempting background profile load...', 'color: cyan;');
          const profileData = await loadProfileWithRoles(session.user.id);
            // FIX: Always update if we got profile data (remove role check)
            if (mounted && profileData) {
              setProfile(profileData);
              console.log('%c[AuthContext] ✅ Background profile loaded and updated:', 'color: green;', profileData);
            }
        } catch (error) {
            console.warn('%c[AuthContext] ⚠️ Background profile load failed (using fallback):', 'color: orange;', error);
            // Keep the fallback profile - don't overwrite it
        }
        });
      } else if (!session) {
        if (mounted) {
          setProfile(null);
          setIsLoading(false);
          console.log('%c[AuthContext] No session, profile cleared.', 'color: orange;');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfileWithRoles]); // Include loadProfileWithRoles in deps

  // Computed values
  // FIX: More resilient isAuthenticated check - allow authenticated if user exists (even if profile still loading)
  const isAuthenticated = !!user && (!!profile || !isLoading);
  const isAdmin = profile?.role === 'admin';
  const isHR = profile?.role === 'hr';
  const isPrestador = profile?.role === 'prestador';
  const isEspecialistaGeral = profile?.role === 'especialista_geral';

  // Diagnostic logging
  useEffect(() => {
    console.log('%c[AuthContext] State update:', 'color: magenta;', {
      user: !!user,
      profile: !!profile,
      isLoading,
      isAuthenticated,
      profileRole: profile?.role,
      userId: user?.id
    });
  }, [user, profile, isLoading, isAuthenticated]);

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
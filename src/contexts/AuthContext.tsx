import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'user' | 'hr' | 'prestador' | 'specialist' | 'especialista_geral';
  company?: string;
  company_id?: string | null;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  metadata?: Record<string, unknown>;
  is_active: boolean;
  has_completed_onboarding?: boolean;
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
  refreshProfile: () => Promise<void>; // Add refresh function
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
  
  // Guard to prevent duplicate background profile loads
  const backgroundLoadAttemptedRef = useRef<Set<string>>(new Set());

  // Helper function to load profile with roles - ONLY USES RPC (NO DATABASE QUERIES)
  const loadProfileWithRoles = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log(`%c[AuthContext] 🔍 Loading profile for user: ${userId}`, 'color: blue; font-weight: bold;');
    
    try {
      // Get user data from Supabase auth FIRST (instant, no database query)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        console.error('%c[AuthContext] ❌ No auth user found', 'color: red;');
      return null;
    }

      // Fetch role using RPC (bypasses RLS, always works)
      console.log('%c[AuthContext] 🔄 Fetching role via RPC...', 'color: cyan;');
      const rpcStart = performance.now();
      let { data: role, error: rpcError } = await (supabase.rpc as any)('get_user_primary_role', { user_id: userId });
      const rpcTime = performance.now() - rpcStart;
      
      if (rpcError) {
        console.error(`%c[AuthContext] ❌ RPC error in ${rpcTime.toFixed(0)}ms:`, 'color: red;', rpcError);
        return null;
      }
      
      if (!role) {
        console.warn(`%c[AuthContext] ⚠️ RPC returned no role - using "user" as fallback`, 'color: orange;');
        role = 'user';
      }
      
      console.log(`%c[AuthContext] ✅ RPC succeeded in ${rpcTime.toFixed(0)}ms - role: ${role}`, 'color: green; font-weight: bold;');
      
      // Query profiles table to get company_id and other data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name, phone, avatar_url, bio, metadata, company_id, is_active, has_completed_onboarding')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('%c[AuthContext] ⚠️ Could not fetch profile data, using fallback', 'color: orange;', profileError);
      }
      
      // Build profile from auth user + role + database profile
      // Note: Allow both 'specialist' and 'especialista_geral' for backward compatibility
      const profile: UserProfile = {
        id: userId,
        user_id: userId,
        full_name: profileData?.name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: (role || 'user') as 'admin' | 'user' | 'hr' | 'prestador' | 'specialist' | 'especialista_geral',
        is_active: profileData?.is_active ?? true,
        company_id: profileData?.company_id || undefined,
        has_completed_onboarding: profileData?.has_completed_onboarding ?? false,
        phone: profileData?.phone || undefined,
        avatar_url: profileData?.avatar_url || undefined,
        bio: profileData?.bio || undefined,
        metadata: (profileData?.metadata as Record<string, unknown>) || {},
      };
      
      // Auto-complete onboarding milestone for regular users on first login
      if (role === 'user') {
        try {
          await (supabase
            .from('user_milestones')
            .update({ 
              completed: true, 
              completed_at: new Date().toISOString() 
            })
            .eq('user_id', userId)
            .eq('milestone_type', 'onboarding') // FIX: Use correct milestone type from database
            .eq('completed', false) as any);
          console.log('%c[AuthContext] ✅ onboarding milestone auto-completed', 'color: green;');
        } catch (err) {
          console.error('Error completing onboarding milestone:', err);
        }
      }
      
      console.log('%c[AuthContext] ✅ Profile built with company_id:', 'color: green; font-weight: bold;', profile);
      return profile;
    } catch (error) {
      console.error('%c[AuthContext] ❌ Error loading profile:', 'color: red; font-weight: bold;', error);
      return null;
    }
  }, []);

  // Real authentication methods
  const login = async (email: string, password: string) => {
    // CRITICAL: Clear the background load guard to allow fresh profile load after login
    backgroundLoadAttemptedRef.current.clear();
    console.log('%c[AuthContext] 🔄 Cleared background load guard for fresh login', 'color: cyan;');
    
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
        // CRITICAL FIX: Load profile BEFORE setting session
        // This ensures profile is ready when onAuthStateChange fires
        console.log('%c[AuthContext] 🔄 Loading profile immediately after login...', 'color: cyan;');
        const profileData = await loadProfileWithRoles(data.session.user.id);
        
        if (profileData) {
          // Mark as loaded BEFORE setting session (so onAuthStateChange doesn't reload)
          backgroundLoadAttemptedRef.current.add(data.session.user.id);
          
          // Set profile FIRST
          setProfile(profileData);
          setUser(data.session.user);
          setSession(data.session);
          console.log(`%c[AuthContext] ✅ Profile set during login:`, 'color: green; font-weight: bold;', profileData);
          
          // NOW set the session (this will trigger onAuthStateChange, but it will skip loading)
          await supabase.auth.setSession(data.session);
          
          const authTime = performance.now() - startTime;
          console.log(`%c[AuthContext] Login completed in ${authTime.toFixed(0)}ms`, 'color: green;');
          
          return { profile: profileData };
        } else {
          await supabase.auth.setSession(data.session);
        }
      }
      
      const authTime = performance.now() - startTime;
      console.log(`%c[AuthContext] Login completed in ${authTime.toFixed(0)}ms (no profile loaded)`, 'color: orange;');
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

  // Refresh profile from database (useful after onboarding completion or profile updates)
  const refreshProfile = async () => {
    if (!user?.id) {
      console.warn('[AuthContext] Cannot refresh profile: No user logged in');
      return;
    }
    
    console.log('[AuthContext] Refreshing profile...');
    const profileData = await loadProfileWithRoles(user.id);
    if (profileData) {
      setProfile(profileData);
      console.log('[AuthContext] Profile refreshed successfully:', profileData);
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
        // FIX: Don't set fallback profile with 'user' role - wait for actual role from DB
        // This prevents race condition where specialists initially see 'user' role
        // setProfile is now only called after actual role is fetched
        console.log('%c[AuthContext] Session found, fetching actual role...', 'color: cyan;');
      
        // Load profile in background (non-blocking)
        // CRITICAL: Use setTimeout(0) to defer outside the callback stack - prevents Supabase deadlock
        // GUARD: Only attempt once per user ID to prevent resource exhaustion
        // BUT: Only mark as attempted if it SUCCEEDS (so we retry on failure)
        const hasAlreadySucceeded = backgroundLoadAttemptedRef.current.has(session.user.id);
        
        if (!hasAlreadySucceeded) {
          setTimeout(async () => {
            try {
              console.log('%c[AuthContext] 🔄 Attempting background profile load on mount...', 'color: cyan;');
              const profileData = await loadProfileWithRoles(session.user.id);
              // FIX: Always update if we got profile data (remove role check)
              if (mounted && profileData) {
                setProfile(profileData);
                console.log('%c[AuthContext] ✅ Background profile loaded and updated:', 'color: green;', profileData);
                // ONLY mark as attempted if successful
                backgroundLoadAttemptedRef.current.add(session.user.id);
              } else {
                console.warn('%c[AuthContext] ⚠️ Background profile load returned null (will retry on next mount)', 'color: orange;');
              }
            } catch (error) {
              console.warn('%c[AuthContext] ⚠️ Background profile load failed (will retry on next mount):', 'color: orange;', error);
              // Don't mark as attempted so it can retry
            }
          }, 0);
        } else {
          console.log('%c[AuthContext] ⏭️ Background profile load already SUCCEEDED for this user, skipping...', 'color: gray;');
        }
      } else {
        if (mounted) {
          setProfile(null);
          setIsLoading(false);
          // Clear the background load guard when user logs out
          backgroundLoadAttemptedRef.current.clear();
        }
      }
    }).catch((error) => {
        // CRITICAL: Always set loading to false, even on error
        console.error('%c[AuthContext] ❌ Error getting initial session:', 'color: red;', error);
        if (mounted) {
          setProfile(null);
          setUser(null);
          setSession(null);
          setIsLoading(false);
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
      
      // FIX: Don't set fallback profile - wait for login to set correct profile
      if (session?.user) {
        // CRITICAL: Don't await here - use setTimeout to defer (prevents Supabase deadlock)
        // Check if profile already loaded by login function
        const hasLoadedProfile = backgroundLoadAttemptedRef.current.has(session.user.id);
        
        if (hasLoadedProfile) {
          // Profile already loaded by login function - just set loading to false
          console.log('%c[AuthContext] ⏭️ Profile already loaded by login, skipping background load', 'color: gray;');
          setIsLoading(false);
        } else {
          // Load profile in background (non-blocking)
          console.log('%c[AuthContext] 🔄 No profile yet, loading in background...', 'color: cyan;');
          setTimeout(async () => {
            const profileData = await loadProfileWithRoles(session.user.id);
            if (mounted && profileData) {
              setProfile(profileData);
              setIsLoading(false);
              backgroundLoadAttemptedRef.current.add(session.user.id);
              console.log('%c[AuthContext] ✅ Background profile loaded:', 'color: green;', profileData);
            } else {
              // Only set fallback if RPC also fails
              if (mounted) {
                const fallbackProfile: UserProfile = {
                  id: session.user.id,
                  user_id: session.user.id,
                  full_name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  role: 'user',
                  is_active: true,
                  metadata: {},
                };
                setProfile(fallbackProfile);
                setIsLoading(false);
                console.warn('%c[AuthContext] ⚠️ Using fallback profile', 'color: orange;');
              }
            }
          }, 0);
        }
      } else if (!session) {
        if (mounted) {
          setProfile(null);
          setIsLoading(false);
          // Clear the background load guard when user logs out
          backgroundLoadAttemptedRef.current.clear();
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
  
  console.log(`%c[AuthContext] Auth State: isAuthenticated=${isAuthenticated}, hasProfile=${!!profile}`, 'color: gray;');

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
    refreshProfile,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
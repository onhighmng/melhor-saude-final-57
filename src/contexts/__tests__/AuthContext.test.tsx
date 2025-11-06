import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { mockUsers } from '@/test/fixtures/users';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should provide initial authentication context', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true);
    });

    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: mockUsers.user.id,
        email: mockUsers.user.email,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: mockUser as any,
          session: { access_token: 'token' } as any,
        },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUsers.user, error: null }),
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('user@example.com', 'password123');
      });

      await waitFor(() => {
        expect(loginResult).toBeDefined();
        expect((loginResult as any).error).toBeUndefined();
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    it('should handle login error with invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials', name: 'AuthError', status: 400 } as any,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('wrong@example.com', 'wrongpassword');
      });

      expect((loginResult as any).error).toBe('Invalid credentials');
    });

    it('should handle login with missing profile', async () => {
      const mockUser = {
        id: mockUsers.user.id,
        email: mockUsers.user.email,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: mockUser as any,
          session: { access_token: 'token' } as any,
        },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Profile not found' } }),
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('user@example.com', 'password123');
      });

      expect((loginResult as any).error).toContain('perfil');
    });
  });

  describe('Signup', () => {
    it('should signup successfully with valid data', async () => {
      const newUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: {
          user: newUser as any,
          session: null,
        },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      let signupResult;
      await act(async () => {
        signupResult = await result.current.signup('newuser@example.com', 'password123', 'New User');
      });

      expect((signupResult as any).error).toBeUndefined();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'New User',
          },
        },
      });
    });

    it('should handle signup error with existing email', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already exists', name: 'AuthError', status: 400 } as any,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      let signupResult;
      await act(async () => {
        signupResult = await result.current.signup('existing@example.com', 'password123', 'Existing User');
      });

      expect((signupResult as any).error).toBe('User already exists');
    });
  });

  describe('Password Reset', () => {
    it('should request password reset successfully', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {} as any,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      let resetResult;
      await act(async () => {
        resetResult = await result.current.resetPassword('user@example.com');
      });

      expect((resetResult as any).error).toBeUndefined();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
        redirectTo: expect.stringContaining('/auth/reset'),
      });
    });

    it('should handle password reset error', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: null as any,
        error: { message: 'User not found', name: 'AuthError', status: 404 } as any,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      let resetResult;
      await act(async () => {
        resetResult = await result.current.resetPassword('nonexistent@example.com');
      });

      expect((resetResult as any).error).toBe('User not found');
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('Role Detection', () => {
    it('should detect admin role correctly', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token', user: { id: mockUsers.admin.id } } as any },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUsers.admin, error: null }),
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true);
        expect(result.current.isHR).toBe(false);
        expect(result.current.isPrestador).toBe(false);
      });
    });

    it('should detect HR role correctly', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token', user: { id: mockUsers.hr.id } } as any },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUsers.hr, error: null }),
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isHR).toBe(true);
        expect(result.current.isAdmin).toBe(false);
      });
    });

    it('should detect prestador role correctly', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token', user: { id: mockUsers.prestador.id } } as any },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUsers.prestador, error: null }),
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isPrestador).toBe(true);
        expect(result.current.isAdmin).toBe(false);
      });
    });

    it('should detect especialista role correctly', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token', user: { id: mockUsers.especialista.id } } as any },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUsers.especialista, error: null }),
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isEspecialistaGeral).toBe(true);
      });
    });
  });

  describe('Profile Refresh', () => {
    it('should refresh profile successfully', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token', user: { id: mockUsers.user.id } } as any },
        error: null,
      });

      const updatedProfile = { ...mockUsers.user, full_name: 'Updated Name' };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({ data: mockUsers.user, error: null })
          .mockResolvedValueOnce({ data: updatedProfile, error: null }),
      } as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.profile?.full_name).toBe('Test User');
      });

      await act(async () => {
        await result.current.refreshProfile();
      });

      await waitFor(() => {
        expect(result.current.profile?.full_name).toBe('Updated Name');
      });
    });
  });
});


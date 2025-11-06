import { vi } from 'vitest';
import type { User, Session } from '@supabase/supabase-js';

export const mockUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser,
};

export const mockAdminProfile = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  full_name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin' as const,
  is_active: true,
  has_completed_onboarding: true,
};

export const mockUserProfile = {
  id: '223e4567-e89b-12d3-a456-426614174001',
  user_id: '223e4567-e89b-12d3-a456-426614174001',
  full_name: 'Test User',
  email: 'user@example.com',
  role: 'user' as const,
  company_id: 'company-123',
  is_active: true,
  has_completed_onboarding: true,
};

export const mockHRProfile = {
  id: '323e4567-e89b-12d3-a456-426614174002',
  user_id: '323e4567-e89b-12d3-a456-426614174002',
  full_name: 'HR Manager',
  email: 'hr@company.com',
  role: 'hr' as const,
  company_id: 'company-123',
  is_active: true,
  has_completed_onboarding: true,
};

export const mockPrestadorProfile = {
  id: '423e4567-e89b-12d3-a456-426614174003',
  user_id: '423e4567-e89b-12d3-a456-426614174003',
  full_name: 'Provider Name',
  email: 'provider@example.com',
  role: 'prestador' as const,
  is_active: true,
  has_completed_onboarding: true,
};

export const mockEspecialistaProfile = {
  id: '523e4567-e89b-12d3-a456-426614174004',
  user_id: '523e4567-e89b-12d3-a456-426614174004',
  full_name: 'Specialist Name',
  email: 'specialist@example.com',
  role: 'especialista_geral' as const,
  is_active: true,
  has_completed_onboarding: true,
};

// Mock Supabase responses
export const createMockSupabaseClient = () => ({
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  })),
  rpc: vi.fn(),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
      getPublicUrl: vi.fn(),
    })),
  },
});

export const setupAuthMocks = (profile = mockUserProfile) => {
  const { supabase } = require('@/integrations/supabase/client');
  
  vi.mocked(supabase.auth.getSession).mockResolvedValue({
    data: { session: mockSession },
    error: null,
  });

  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: mockUser },
    error: null,
  });

  const fromMock = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: profile, error: null }),
  }));

  vi.mocked(supabase.from).mockImplementation(fromMock as any);
};

export const setupAuthMocksForRole = (role: 'admin' | 'user' | 'hr' | 'prestador' | 'especialista_geral') => {
  const profiles = {
    admin: mockAdminProfile,
    user: mockUserProfile,
    hr: mockHRProfile,
    prestador: mockPrestadorProfile,
    especialista_geral: mockEspecialistaProfile,
  };

  setupAuthMocks(profiles[role]);
};


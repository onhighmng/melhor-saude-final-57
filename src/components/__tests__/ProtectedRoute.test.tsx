import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/test/fixtures/users';

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate-to">{to}</div>,
    useLocation: () => ({ pathname: '/test', state: null }),
  };
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner while auth is loading', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        profile: null,
        isLoading: true,
        user: null,
        session: null,
        isAdmin: false,
        isHR: false,
        isPrestador: false,
        isEspecialistaGeral: false,
        login: vi.fn(),
        signup: vi.fn(),
        resetPassword: vi.fn(),
        logout: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Unauthenticated Access', () => {
    it('should redirect to login when user is not authenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        profile: null,
        isLoading: false,
        user: null,
        session: null,
        isAdmin: false,
        isHR: false,
        isPrestador: false,
        isEspecialistaGeral: false,
        login: vi.fn(),
        signup: vi.fn(),
        resetPassword: vi.fn(),
        logout: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/login');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow access when user has correct role', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        profile: mockUsers.admin,
        isLoading: false,
        user: { id: mockUsers.admin.id } as any,
        session: {} as any,
        isAdmin: true,
        isHR: false,
        isPrestador: false,
        isEspecialistaGeral: false,
        login: vi.fn(),
        signup: vi.fn(),
        resetPassword: vi.fn(),
        logout: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <ProtectedRoute requiredRole="admin">
          <div>Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should redirect when user role does not match required role', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        profile: mockUsers.user,
        isLoading: false,
        user: { id: mockUsers.user.id } as any,
        session: {} as any,
        isAdmin: false,
        isHR: false,
        isPrestador: false,
        isEspecialistaGeral: false,
        login: vi.fn(),
        signup: vi.fn(),
        resetPassword: vi.fn(),
        logout: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <ProtectedRoute requiredRole="admin">
          <div>Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/user/dashboard');
    });

    it('should allow HR to access HR routes', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        profile: mockUsers.hr,
        isLoading: false,
        user: { id: mockUsers.hr.id } as any,
        session: {} as any,
        isAdmin: false,
        isHR: true,
        isPrestador: false,
        isEspecialistaGeral: false,
        login: vi.fn(),
        signup: vi.fn(),
        resetPassword: vi.fn(),
        logout: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <ProtectedRoute requiredRole="hr">
          <div>HR Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('HR Content')).toBeInTheDocument();
    });

    it('should allow prestador to access prestador routes', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        profile: mockUsers.prestador,
        isLoading: false,
        user: { id: mockUsers.prestador.id } as any,
        session: {} as any,
        isAdmin: false,
        isHR: false,
        isPrestador: true,
        isEspecialistaGeral: false,
        login: vi.fn(),
        signup: vi.fn(),
        resetPassword: vi.fn(),
        logout: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <ProtectedRoute requiredRole="prestador">
          <div>Prestador Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Prestador Content')).toBeInTheDocument();
    });

    it('should handle especialista_geral role', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        profile: mockUsers.especialista,
        isLoading: false,
        user: { id: mockUsers.especialista.id } as any,
        session: {} as any,
        isAdmin: false,
        isHR: false,
        isPrestador: false,
        isEspecialistaGeral: true,
        login: vi.fn(),
        signup: vi.fn(),
        resetPassword: vi.fn(),
        logout: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <ProtectedRoute requiredRole="especialista_geral">
          <div>Especialista Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Especialista Content')).toBeInTheDocument();
    });
  });

  describe('No Required Role', () => {
    it('should allow any authenticated user when no role is required', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        profile: mockUsers.user,
        isLoading: false,
        user: { id: mockUsers.user.id } as any,
        session: {} as any,
        isAdmin: false,
        isHR: false,
        isPrestador: false,
        isEspecialistaGeral: false,
        login: vi.fn(),
        signup: vi.fn(),
        resetPassword: vi.fn(),
        logout: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <ProtectedRoute>
          <div>General Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('General Protected Content')).toBeInTheDocument();
    });
  });
});


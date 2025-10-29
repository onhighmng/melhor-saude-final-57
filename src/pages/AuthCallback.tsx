import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ROLE_REDIRECT_MAP, type UserRole } from '@/utils/authRedirects';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, profile, isLoading } = useAuth();

  useEffect(() => {
    // Wait for AuthContext to finish loading
    if (isLoading) {
      console.log('[AuthCallback] Waiting for AuthContext to finish loading...');
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated || !profile) {
      console.log('[AuthCallback] Not authenticated, redirecting to login');
      toast({
        title: 'Erro de autenticação',
        description: 'Por favor, faça login novamente',
        variant: 'destructive'
      });
      navigate('/login', { replace: true });
      return;
    }

    // Use profile from AuthContext (already loaded, no DB query needed)
    const primaryRole: UserRole = profile.role as UserRole;
    const redirectPath = ROLE_REDIRECT_MAP[primaryRole] || '/user/dashboard';
    
    console.log('[AuthCallback] Primary role from AuthContext:', primaryRole, '-> Redirecting to:', redirectPath);

    toast({
      title: 'Login bem-sucedido',
      description: `Bem-vindo, ${profile.name || 'Utilizador'}!`
    });

    navigate(redirectPath, { replace: true });
  }, [isLoading, isAuthenticated, profile, navigate, toast]);

  // Show loading while AuthContext is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">
            A processar autenticação...
          </p>
        </div>
      </div>
    );
  }

  // If we get here, we should have redirected already, but show a message just in case
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">
          A redirecionar...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;

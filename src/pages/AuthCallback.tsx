import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ROLE_REDIRECT_MAP, type UserRole } from '@/utils/authRedirects';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('[AuthCallback] Processing auth redirect...');

        // Get the session from URL params (handles OAuth and magic links)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthCallback] Session error:', error);
          toast({
            title: 'Erro de autenticação',
            description: error.message,
            variant: 'destructive'
          });
          navigate('/login');
          return;
        }

        if (!session) {
          console.log('[AuthCallback] No session found, redirecting to login');
          toast({
            title: 'Sessão expirada',
            description: 'Por favor, faça login novamente',
            variant: 'destructive'
          });
          navigate('/login');
          return;
        }

        console.log('[AuthCallback] Session found, fetching profile...');

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('[AuthCallback] Profile fetch error:', profileError);
          // User might not have profile yet, redirect to login
          navigate('/login');
          return;
        }

        // Get user roles
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        const roles = rolesData?.map(r => r.role) || [];
        console.log('[AuthCallback] User roles:', roles);

        // Determine primary role (priority order: admin > hr > prestador > specialist > user)
        const primaryRole: UserRole = roles.includes('admin') ? 'admin'
          : roles.includes('hr') ? 'hr'
          : roles.includes('prestador') ? 'prestador'
          : roles.includes('specialist') ? 'specialist'
          : 'user';

        const redirectPath = ROLE_REDIRECT_MAP[primaryRole];
        console.log('[AuthCallback] Redirecting to:', redirectPath);

        toast({
          title: 'Login bem-sucedido',
          description: `Bem-vindo, ${profileData.name || 'Utilizador'}!`
        });

        navigate(redirectPath);
      } catch (error) {
        console.error('[AuthCallback] Unexpected error:', error);
        toast({
          title: 'Erro inesperado',
          description: 'Ocorreu um erro ao processar autenticação',
          variant: 'destructive'
        });
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">
          {isProcessing ? 'A processar autenticação...' : 'A redirecionar...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;

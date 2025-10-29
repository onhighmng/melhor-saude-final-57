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
        console.log('[AuthCallback] Starting authentication processing...');

        // Get the session from URL params (handles OAuth and magic links)
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('[AuthCallback] Session fetch result:', { hasSession: !!session, error });

        if (error) {
          console.error('[AuthCallback] Session error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          toast({
            title: 'Erro de autenticação',
            description: errorMessage,
            variant: 'destructive'
          });
          navigate('/login');
          return;
        }

        if (!session) {
          console.warn('[AuthCallback] No session found');
          toast({
            title: 'Sessão expirada',
            description: 'Por favor, faça login novamente',
            variant: 'destructive'
          });
          navigate('/login');
          return;
        }

        // Get user profile
        console.log('[AuthCallback] Fetching profile for user:', session.user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log('[AuthCallback] Profile fetch result:', { hasProfile: !!profileData, error: profileError });

        if (profileError) {
          console.error('[AuthCallback] Profile error:', profileError);
          toast({
            title: 'Erro de perfil',
            description: 'Não foi possível carregar o perfil',
            variant: 'destructive'
          });
          navigate('/login');
          return;
        }

        // Get user roles
        console.log('[AuthCallback] Fetching roles for user:', session.user.id);
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        console.log('[AuthCallback] Roles fetch result:', { 
          roles: rolesData, 
          error: rolesError,
          rolesCount: rolesData?.length 
        });

        if (rolesError) {
          console.error('[AuthCallback] Error fetching roles:', rolesError);
        }

        const roles = rolesData?.map(r => r.role) || [];
        console.log('[AuthCallback] Mapped user roles:', roles, 'Length:', roles.length);

        // Determine primary role (priority order: admin > hr > prestador > specialist > user)
        const primaryRole: UserRole = roles.includes('admin') ? 'admin'
          : roles.includes('hr') ? 'hr'
          : roles.includes('prestador') ? 'prestador'
          : roles.includes('specialist') ? 'specialist'
          : 'user';

        const redirectPath = ROLE_REDIRECT_MAP[primaryRole];
        console.log('[AuthCallback] Primary role:', primaryRole, '-> Redirecting to:', redirectPath);

        toast({
          title: 'Login bem-sucedido',
          description: `Bem-vindo, ${profileData.name || 'Utilizador'}!`
        });

        navigate(redirectPath);
      } catch (error) {
        console.error('[AuthCallback] Unexpected error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro ao processar autenticação';
        toast({
          title: 'Erro inesperado',
          description: errorMessage,
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

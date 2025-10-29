import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ROLE_REDIRECT_MAP, UserRole } from '@/utils/authRedirects';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleRedirect = async () => {
      // First, get the session from Supabase.
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('[AuthCallback] Session error or no session found. Redirecting to login.');
        toast({ title: 'Erro de Sessão', description: 'Por favor, tente fazer login novamente.', variant: 'destructive' });
        navigate('/login', { replace: true });
        return;
      }

      // Now, perform a fresh, direct query to get the user's role.
      // This is the key fix: it bypasses any potential state lag from AuthContext.
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (rolesError) {
        console.error('[AuthCallback] Could not fetch user role:', rolesError.message);
        toast({ title: 'Erro de Permissões', description: 'Não foi possível verificar as suas permissões. A redirecionar para o dashboard padrão.', variant: 'destructive' });
        // Fallback to user dashboard on error
        navigate('/user/dashboard', { replace: true });
        return;
      }

      const roles = rolesData?.map(r => r.role) || [];
      
      console.log(`%c[AuthCallback] Fetched roles from database:`, 'color: cyan; font-weight: bold;', roles);
      console.log(`%c[AuthCallback] Raw roles data:`, 'color: cyan;', rolesData);
      
      // Determine the highest-priority role (admin > hr > prestador > specialist > user)
      // Note: Database stores 'specialist', not 'especialista_geral'
      let primaryRole: UserRole = 'user';
      
      // Check roles in priority order (admin > hr > prestador > specialist > user)
      // The database enum uses: 'admin', 'user', 'hr', 'prestador', 'specialist'
      if (roles.includes('admin')) {
        primaryRole = 'admin';
      } else if (roles.includes('hr')) {
        primaryRole = 'hr';
      } else if (roles.includes('prestador')) {
        primaryRole = 'prestador';
      } else if (roles.includes('specialist')) {
        primaryRole = 'specialist';
      } else {
        primaryRole = 'user';
      }
        
      const redirectPath = ROLE_REDIRECT_MAP[primaryRole] || '/user/dashboard';

      console.log(`%c[AuthCallback] Fresh role check complete.`, 'color: green; font-weight: bold;');
      console.log(`%c  - Roles found: [${roles.join(', ')}]`, 'color: green;');
      console.log(`%c  - Primary role selected: ${primaryRole}`, 'color: green; font-weight: bold;');
      console.log(`%c  - Redirecting to: ${redirectPath}`, 'color: green;');
      
      toast({ title: 'Login bem-sucedido!', description: 'Bem-vindo de volta.' });
      navigate(redirectPath, { replace: true });
    };

    handleRedirect();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">
          Finalizando autenticação...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;

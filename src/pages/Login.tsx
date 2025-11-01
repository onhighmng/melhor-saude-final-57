import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroNeural from '@/assets/hero-neural.jpg';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ROLE_REDIRECT_MAP } from '@/utils/authRedirects';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  // Get the path the user was trying to access
  const from = location.state?.from?.pathname;

  // Redirect if already authenticated (but NOT during active login)
  useEffect(() => {
    const redirectIfAuthenticated = async () => {
      // Don't redirect if actively logging in or auth is still loading
      if (!isAuthenticated || isAuthLoading || isLoading) {
        return;
      }

      console.log('%c[Login] User already authenticated, fetching role for redirect...', 'color: cyan;');

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        const { data: role, error: roleError } = await (supabase.rpc as any)('get_user_primary_role', { p_user_id: authUser.id });

        if (roleError || !role) {
          console.error('[Login] Error fetching role for redirect:', roleError);
          navigate('/user/dashboard', { replace: true });
          return;
        }

        const roleForRedirect = role === 'especialista_geral' ? 'specialist' : role;
        const redirectPath = from || ROLE_REDIRECT_MAP[roleForRedirect as keyof typeof ROLE_REDIRECT_MAP] || '/user/dashboard';
        
        console.log(`%c[Login] Already authenticated with role: ${role}, redirecting to: ${redirectPath}`, 'color: green; font-weight: bold;');
        navigate(redirectPath, { replace: true });
      } catch (error) {
        console.error('[Login] Error during authenticated redirect:', error);
      }
    };

    redirectIfAuthenticated();
  }, [isAuthenticated, isAuthLoading, isLoading, navigate, from]);

  const getErrorMessage = (error: string) => {
    if (error.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos';
    }
    if (error.includes('Email not confirmed')) {
      return 'Por favor, confirme seu email primeiro';
    }
    return 'Erro ao fazer login. Tente novamente.';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await login(email, password);
      
      if (error) {
        toast({
          title: "Erro ao entrar",
          description: getErrorMessage(error),
          variant: "destructive"
        });
        setIsLoading(false);
      } else {
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo de volta!`
        });
        
        // CRITICAL FIX: Fetch role directly using RPC (bypasses RLS, returns in ~400ms)
        // This ensures we redirect to the correct dashboard immediately
        console.log('%c[Login] Fetching user role directly via RPC...', 'color: cyan; font-weight: bold;');
        
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          console.error('[Login] No user found after login');
          setIsLoading(false);
          return;
        }
        
        const { data: role, error: roleError } = await (supabase.rpc as any)('get_user_primary_role', { p_user_id: authUser.id });
        
        if (roleError || !role) {
          console.error('[Login] Error fetching role:', roleError);
          // Fallback to user dashboard
          navigate('/user/dashboard', { replace: true });
          return;
        }
        
        console.log(`%c[Login] Role fetched: ${role}`, 'color: green; font-weight: bold;');
        
        // Map role to redirect path
        const roleForRedirect = role === 'especialista_geral' ? 'specialist' : role;
        const redirectPath = from || ROLE_REDIRECT_MAP[roleForRedirect as keyof typeof ROLE_REDIRECT_MAP] || '/user/dashboard';
        
        console.log(`%c[Login] Redirecting to: ${redirectPath}`, 'color: green; font-weight: bold;');
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      toast({
        title: "Erro ao entrar",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Show a loading spinner if a user lands on this page while the app is still figuring out if they're logged in.
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={heroNeural}
          alt="Saúde Mental"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Bem-vinda ao futuro do bem-estar</h1>
          <p className="text-lg text-white/90">
            Conecte-se com especialistas em saúde mental, bem-estar físico, assistência financeira e jurídica
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à página inicial
            </Link>
          </div>
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Entrar na sua conta</h2>
            <p className="text-muted-foreground mt-2">
              Insira as suas credenciais para aceder à sua área pessoal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm"
                  onClick={() => navigate('/reset-password')}
                >
                  Esqueceu a senha?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A entrar...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <Button
                type="button"
                variant="link"
                className="px-1"
                onClick={() => navigate('/register/employee')}
              >
                Registe-se aqui
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

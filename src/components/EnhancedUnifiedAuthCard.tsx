import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { SecurePasswordInput, usePasswordValidation } from '@/components/ui/secure-password-input';
import { getErrorMessage } from '@/utils/errorMessages';
import { useState } from 'react';
import { Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const UnifiedAuthCard = () => {
  const { toast } = useToast();
  const { login, signup, resetPassword } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const { validateAndShowErrors } = usePasswordValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate password strength for signup
      if (authMode === 'signup') {
        const isValid = await validateAndShowErrors(formData.password);
        if (!isValid) {
          return;
        }
      }

      if (authMode === 'login') {
        const result = await login(formData.email, formData.password);
        if (result.error) {
          setError(getErrorMessage(result.error));
        }
      } else if (authMode === 'signup') {
        const result = await signup(formData.email, formData.password, formData.name);
        if (result.error) {
          setError(getErrorMessage(result.error));
        } else {
          setSuccess('Conta criada com sucesso!');
          setFormData({ email: '', password: '', name: '' });
        }
      } else if (authMode === 'reset') {
        const result = await resetPassword(formData.email);
        if (result.error) {
          setError(getErrorMessage(result.error));
        } else {
          setSuccess('Email de recuperação enviado!');
          setFormData({ email: '', password: '', name: '' });
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordValidation = (isValid: boolean, issues: string[]) => {
    setIsPasswordValid(isValid);
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '' });
    setError(null);
    setSuccess(null);
  };

  const switchMode = (mode: 'login' | 'signup' | 'reset') => {
    setAuthMode(mode);
    resetForm();
  };

  return (
    <ErrorBoundary>
      <Card className="w-full max-w-md mx-auto glass-effect border-accent-sage/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-navy-blue">
            {authMode === 'login' && 'Entrar'}
            {authMode === 'signup' && 'Registar'}
            {authMode === 'reset' && 'Recuperar Senha'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={authMode} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger 
                value="login" 
                onClick={() => switchMode('login')}
                className="data-[state=active]:bg-accent-sage data-[state=active]:text-white"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                onClick={() => switchMode('signup')}
                className="data-[state=active]:bg-accent-sage data-[state=active]:text-white"
              >
                Registar
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login" className="space-y-0 mt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Senha
                  </Label>
                  <SecurePasswordInput
                    value={formData.password}
                    onChange={(value) => setFormData({...formData, password: value})}
                    placeholder="••••••••"
                    required
                    showStrength={false}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent-sage hover:bg-accent-sage/90" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      A processar...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>

                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-grey/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">ou</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4 border-slate-grey/20 hover:bg-slate-grey/10"
                    onClick={() => {
                      toast({
                        title: 'OAuth',
                        description: 'Login com Google em desenvolvimento',
                      });
                    }}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Entrar com Google
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => switchMode('reset')}
                    className="text-sm text-navy-blue/70 hover:text-navy-blue"
                  >
                    Esqueceu a senha?
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-0 mt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Senha
                  </Label>
                  <SecurePasswordInput
                    value={formData.password}
                    onChange={(value) => setFormData({...formData, password: value})}
                    placeholder="Mínimo 6 caracteres"
                    required
                    showStrength={true}
                    onValidationChange={handlePasswordValidation}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent-sage hover:bg-accent-sage/90" 
                  disabled={isSubmitting || !isPasswordValid}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      A criar conta...
                    </>
                  ) : (
                    'Registar'
                  )}
                </Button>

                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-grey/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">ou</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4 border-slate-grey/20 hover:bg-slate-grey/10"
                    onClick={() => {
                      toast({
                        title: 'OAuth',
                        description: 'Login com Google em desenvolvimento',
                      });
                    }}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Registar com Google
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          {authMode === 'reset' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t('auth.labels.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder={t('auth.placeholders.email')}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-accent-sage hover:bg-accent-sage/90" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      A enviar...
                    </>
                  ) : (
                    'Enviar Email de Recuperação'
                  )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => switchMode('login')}
                  className="text-sm text-navy-blue/70 hover:text-navy-blue"
                >
                  Voltar ao Login
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default UnifiedAuthCard;
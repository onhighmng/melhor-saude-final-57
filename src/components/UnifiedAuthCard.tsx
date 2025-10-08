import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UnifiedAuthCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [searchParams] = useSearchParams();
  const [isInvitation, setIsInvitation] = useState(false);
  const { login, signup, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  // Password visibility state
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check for invitation token on component mount
  useEffect(() => {
    const invitationToken = searchParams.get('invitation');
    if (invitationToken) {
      setIsInvitation(true);
      console.log('🔑 Admin invitation detected:', invitationToken);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) return;
    
    // Basic validation
    if (!loginData.email || !loginData.password) {
      toast({
        title: t('auth.messages.requiredFields'),
        description: t('auth.messages.fillAllFields'),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔍 AUTH FORM: Starting login for:', loginData.email);
      const result = await login(loginData.email, loginData.password);
      console.log('🔍 AUTH FORM: Login result:', result);
      
      if (result.error) {
        console.error('🚨 AUTH FORM: Login error:', result.error);
        toast({
          title: t('auth.messages.loginError'),
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ AUTH FORM: Login successful');
      toast({
        title: t('auth.messages.loginSuccess'),
        description: t('auth.messages.redirecting')
      });
      
      // Clear form on success
      setLoginData({ email: '', password: '' });
      
      // Navigation will be handled by the individual page components based on auth state
      
    } catch (error: any) {
      console.error('🚨 AUTH FORM: Login exception:', error);
      toast({
        title: t('auth.messages.loginError'),
        description: error.message || t('auth.messages.unexpectedError'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) return;
    
    // Basic validation
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      toast({
        title: t('auth.messages.requiredFields'),
        description: t('auth.messages.fillAllFields'),
        variant: "destructive"
      });
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: t('auth.messages.registerError'),
        description: t('auth.messages.passwordMismatch'),
        variant: "destructive"
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: t('auth.messages.passwordTooShort'),
        description: t('auth.messages.passwordMinLength'),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(registerData.email, registerData.password, registerData.name);
      
      if (result.error) {
        toast({
          title: t('auth.messages.registerError'),
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      // Check if this was an admin invitation
      if (isInvitation) {
        toast({
          title: t('auth.messages.adminAccountCreated'),
          description: t('auth.messages.adminWelcome', { name: registerData.name })
        });
      } else {
        toast({
          title: t('auth.messages.accountCreated'),
          description: t('auth.messages.userWelcome', { name: registerData.name })
        });
      }
      
      // Clear form on success
      setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
      
      // Navigation will be handled by the individual page components based on auth state
      
    } catch (error: any) {
      toast({
        title: t('auth.messages.registerError'),
        description: error.message || t('auth.messages.tryAgainLater'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!forgotPasswordEmail) {
      toast({
        title: t('auth.messages.requiredField'),
        description: t('auth.messages.enterYourEmail'),
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      toast({
        title: t('auth.messages.invalidEmail'),
        description: t('auth.messages.enterValidEmail'),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(forgotPasswordEmail);
      
      if (result.error) {
        toast({
          title: t('auth.messages.recoveryError'),
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: t('auth.messages.emailSentSuccess'),
        description: t('auth.messages.emailSentInstructions'),
        duration: 7000
      });
      
      setForgotPasswordEmail('');
      setForgotPasswordMode(false);
      
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        title: t('auth.messages.recoveryError'),
        description: error.message || t('auth.messages.tryAgainLater'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md glass-effect shadow-custom-lg animate-scale-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-navy-blue">
          {t('auth.platformAccess')}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue={isInvitation ? "register" : "login"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">{t('auth.tabs.login')}</TabsTrigger>
            <TabsTrigger value="register">{t('auth.tabs.register')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            {forgotPasswordMode ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <Label htmlFor="forgot-email">{t('auth.labels.email')}</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    className="input-enhanced"
                    placeholder={t('auth.placeholders.enterEmail')}
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading || !forgotPasswordEmail}
                  className="w-full bg-gradient-to-r from-accent-sky to-vibrant-blue hover:from-vibrant-blue hover:to-accent-sky text-white hover-lift press-effect disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('auth.buttons.sending')}
                    </div>
                  ) : t('auth.buttons.sendRecoveryEmail')}
                </Button>
                
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(false)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('auth.buttons.backToLogin')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">{t('auth.labels.email')}</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="input-enhanced"
                  placeholder={t('auth.placeholders.email')}
                />
              </div>
              
              <div>
                <Label htmlFor="login-password">{t('auth.labels.password')}</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="input-enhanced pr-10"
                    placeholder={t('auth.placeholders.password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !loginData.email || !loginData.password}
                className="w-full bg-gradient-to-r from-accent-sky to-vibrant-blue hover:from-vibrant-blue hover:to-accent-sky text-white hover-lift press-effect disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('auth.buttons.loggingIn')}
                  </div>
                ) : t('auth.buttons.login')}
              </Button>

              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-grey/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">{t('auth.divider')}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-slate-grey/20 hover:bg-slate-grey/10 mt-4"
                  onClick={() => {
                    toast({
                      title: t('auth.oauth.title'),
                      description: t('auth.oauth.inDevelopment'),
                    });
                  }}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('auth.buttons.loginWithGoogle')}
                </Button>
              </div>
              
              <button
                type="button"
                onClick={() => setForgotPasswordMode(true)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
              >
                {t('auth.messages.forgotPassword')}
              </button>
            </form>
            )}
          </TabsContent>
          
          <TabsContent value="register">
            {isInvitation && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">
                    🔐 {t('auth.adminInvite')}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {t('auth.adminInviteDesc')}
                </p>
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="register-name">{t('auth.labels.name')}</Label>
                <Input
                  id="register-name"
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                  className="input-enhanced"
                  placeholder={t('auth.placeholders.fullName')}
                />
              </div>
              
              <div>
                <Label htmlFor="register-email">{t('auth.labels.email')}</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  className="input-enhanced"
                  placeholder={t('auth.placeholders.email')}
                />
              </div>
              
              <div>
                <Label htmlFor="register-password">{t('auth.labels.password')}</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    className="input-enhanced pr-10"
                    placeholder={t('auth.placeholders.password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="register-confirm-password">{t('auth.labels.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                    className="input-enhanced pr-10"
                    placeholder={t('auth.placeholders.confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword}
                className="w-full bg-gradient-to-r from-accent-sky to-vibrant-blue hover:from-vibrant-blue hover:to-accent-sky text-white hover-lift press-effect disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('common.loading')}
                  </div>
                ) : t('auth.tabs.register')}
              </Button>

              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-grey/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">{t('auth.divider')}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-slate-grey/20 hover:bg-slate-grey/10 mt-4"
                  onClick={() => {
                    toast({
                      title: t('auth.oauth.title'),
                      description: t('auth.oauth.inDevelopment'),
                    });
                  }}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('auth.buttons.loginWithGoogle')}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UnifiedAuthCard;

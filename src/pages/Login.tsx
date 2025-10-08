import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroNeural from '@/assets/hero-neural.jpg';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Mock login for demo
    console.log('Login attempt:', { email, password });
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={heroNeural}
          alt={t('helpCenter.categories.mental')}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">{t('auth.login.tagline')}</h1>
          <p className="text-lg text-white/90">
            {t('auth.login.description')}
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">{t('auth.login.title')}</h2>
            <p className="text-muted-foreground mt-2">
              {t('auth.login.subtitle')}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('auth.login.password')}</Label>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm"
                  onClick={() => navigate('/reset-password')}
                >
                  {t('auth.login.forgotPassword')}
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11">
              {t('auth.login.loginButton')}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t('auth.login.noAccount')}{' '}
              <Button
                type="button"
                variant="link"
                className="px-1"
                onClick={() => navigate('/register/employee')}
              >
                {t('auth.login.register')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
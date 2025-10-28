import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroBrain from '@/assets/hero-brain.jpg';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const resetPasswordSchema = z.object({
  email: z.string().trim().email('Email inválido').min(1, 'Email é obrigatório')
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        toast({
          title: t('auth.resetPassword.errorTitle', 'Erro'),
          description: error,
          variant: 'destructive'
        });
      } else {
        setEmailSent(true);
        toast({
          title: t('auth.resetPassword.emailSentTitle', 'Email Enviado'),
          description: t('auth.resetPassword.emailSentDescription', 'Verifique o seu email para instruções de recuperação'),
        });
      }
    } catch (error: any) {
      toast({
        title: t('auth.resetPassword.errorTitle', 'Erro'),
        description: error.message || t('auth.resetPassword.genericError', 'Ocorreu um erro inesperado'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen w-full flex">
        {/* Left side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img
            src={heroBrain}
            alt="Saúde Mental"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
          <div className="relative z-10 flex flex-col justify-end p-12 text-white">
            <h1 className="text-4xl font-bold mb-4">Melhor Saúde</h1>
            <p className="text-lg text-white/90">
              {t('auth.resetPassword.heroSuccess', 'Email de recuperação enviado com sucesso.')}
            </p>
          </div>
        </div>

        {/* Right side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-8 text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {t('auth.resetPassword.emailSentTitle', 'Email Enviado')}
              </h2>
              <p className="text-muted-foreground mt-4">
                {t('auth.resetPassword.checkInbox', 'Verifique a sua caixa de entrada e siga as instruções para recuperar a sua conta.')}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={() => navigate('/login')}
            >
              {t('auth.resetPassword.backToLogin', 'Voltar ao login')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={heroBrain}
          alt="Saúde Mental"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Melhor Saúde</h1>
          <p className="text-lg text-white/90">
            {t('auth.resetPassword.hero', 'Recupere o acesso à sua conta de forma segura.')}
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Back to Home Button */}
          <div className="text-center lg:text-left">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('auth.resetPassword.backToHome', 'Voltar à página inicial')}
            </Link>
          </div>
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">
              {t('auth.resetPassword.title', 'Recuperar Palavra-passe')}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t('auth.resetPassword.description', 'Insira o seu email para receber instruções de recuperação')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">
                {t('auth.resetPassword.emailLabel', 'Email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.resetPassword.emailPlaceholder', 'seu@email.com')}
                {...register('email')}
                className="h-11"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? t('common.loading', 'A carregar...') : t('auth.resetPassword.submitButton', 'Enviar Instruções')}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t('auth.resetPassword.rememberedPassword', 'Lembrou-se da palavra-passe?')}{' '}
              <Button
                type="button"
                variant="link"
                className="px-1"
                onClick={() => navigate('/login')}
              >
                {t('auth.resetPassword.backToLogin', 'Voltar ao login')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

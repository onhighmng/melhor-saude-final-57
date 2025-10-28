import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroBrain from '@/assets/hero-brain.jpg';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const updatePasswordSchema = z.object({
  password: z.string()
    .min(8, 'Palavra-passe deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As palavras-passe não coincidem",
  path: ["confirmPassword"]
});

type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>;

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema)
  });

  useEffect(() => {
    // Check if user has a valid reset session
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        toast({
          title: t('auth.updatePassword.invalidLink', 'Link Inválido'),
          description: t('auth.updatePassword.invalidLinkDescription', 'Este link de recuperação expirou ou é inválido'),
          variant: 'destructive'
        });
        // Redirect after showing toast
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setIsValidSession(true);
      }
    });
  }, [navigate, toast, t]);

  const onSubmit = async (data: UpdatePasswordForm) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: data.password 
      });
      
      if (error) {
        toast({
          title: t('auth.updatePassword.errorTitle', 'Erro'),
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: t('auth.updatePassword.success', 'Sucesso'),
          description: t('auth.updatePassword.successDescription', 'Palavra-passe atualizada com sucesso. A redirecionar...'),
        });
        
        // Wait for toast to show, then redirect to login
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error: any) {
      toast({
        title: t('auth.updatePassword.errorTitle', 'Erro'),
        description: error.message || t('auth.updatePassword.genericError', 'Ocorreu um erro inesperado'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render form until we verify the session is valid
  if (!isValidSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            {t('auth.updatePassword.verifying', 'A verificar link de recuperação...')}
          </p>
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
            {t('auth.updatePassword.hero', 'Defina uma nova palavra-passe segura para a sua conta.')}
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">
              {t('auth.updatePassword.title', 'Definir Nova Palavra-passe')}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t('auth.updatePassword.description', 'Escolha uma palavra-passe forte e segura')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">
                {t('auth.updatePassword.passwordLabel', 'Nova Palavra-passe')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.updatePassword.passwordPlaceholder', 'Mínimo 8 caracteres')}
                  {...register('password')}
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('auth.updatePassword.confirmPasswordLabel', 'Confirmar Palavra-passe')}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('auth.updatePassword.confirmPasswordPlaceholder', 'Digite novamente')}
                  {...register('confirmPassword')}
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Password requirements */}
            <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-md">
              <p className="font-medium mb-1">
                {t('auth.updatePassword.requirements', 'A palavra-passe deve conter:')}
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>{t('auth.updatePassword.minLength', 'Mínimo 8 caracteres')}</li>
                <li>{t('auth.updatePassword.uppercase', 'Pelo menos uma letra maiúscula')}</li>
                <li>{t('auth.updatePassword.number', 'Pelo menos um número')}</li>
              </ul>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? t('common.loading', 'A atualizar...') : t('auth.updatePassword.submitButton', 'Atualizar Palavra-passe')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;

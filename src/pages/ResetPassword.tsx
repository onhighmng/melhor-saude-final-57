import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Email enviado",
        description: "Verifique a sua caixa de email para instruções de recuperação.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o email de recuperação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex flex-1 relative">
        <div className="absolute inset-0">
          <img 
            src="/lovable-uploads/6f3eb5fe-a35b-4f90-afff-d0cc84a6cf3c.png"
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </div>

      {/* Right side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à página inicial
            </Link>
            <img 
              src="/lovable-uploads/c207c3c2-eab3-483e-93b6-a55cf5e5fdf2.png" 
              alt="Melhor Saúde Logo" 
              className="w-20 h-20 mx-auto object-contain lg:hidden"
            />
            <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
              {isSuccess ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Mail className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isSuccess ? 'Email Enviado!' : 'Recuperar Password'}
            </h1>
            <p className="text-gray-600">
              {isSuccess 
                ? 'Enviámos instruções de recuperação para o seu email.'
                : 'Introduza o seu email para receber instruções de recuperação.'
              }
            </p>
          </div>

          {/* Reset Password Form */}
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              {isSuccess ? (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Verifique a sua caixa de entrada e siga as instruções no email.
                      Se não receber o email em alguns minutos, verifique a pasta de spam.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        setIsSuccess(false);
                        setEmail('');
                      }}
                      variant="outline"
                      className="w-full h-12"
                    >
                      Enviar novo email
                    </Button>
                    
                    <Button asChild className="w-full h-12 bg-bright-royal hover:bg-bright-royal/90">
                      <Link to="/login">
                        Voltar ao login
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Endereço de Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-bright-royal"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-bright-royal hover:bg-bright-royal/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enviando...
                      </div>
                    ) : (
                      'Enviar Instruções'
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Lembrou-se da password?{' '}
                      <Link to="/login" className="text-bright-royal hover:text-bright-royal/80 font-medium">
                        Fazer login
                      </Link>
                    </p>
                  </div>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
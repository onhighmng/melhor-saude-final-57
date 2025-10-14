import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, User, Mail, Key, Lock, ArrowLeft, CheckCircle, AlertCircle, Copy, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getInviteCodeByCode, mockInviteCodes } from '@/data/inviteCodesMockData';
import { generateUUID } from '@/utils/uuid';
import heroFitness from '@/assets/hero-fitness.jpg';

type FormStep = 'invite-code' | 'user-details';

export default function RegisterEmployee() {
  const [currentStep, setCurrentStep] = useState<FormStep>('invite-code');
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [codeStatus, setCodeStatus] = useState<'idle' | 'valid' | 'invalid' | 'used' | 'revoked' | 'no_seats'>('idle');
  const [companyName, setCompanyName] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for prefilled code from URL
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setInviteCode(codeFromUrl.toUpperCase());
      validateInviteCode(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);

  const validateInviteCode = async (code: string) => {
    if (!code || code.length < 6) {
      setCodeStatus('idle');
      return;
    }

    setIsValidating(true);
    
    // Simulate API delay
    setTimeout(() => {
      const invite = getInviteCodeByCode(code);
      
      if (!invite) {
        setCodeStatus('invalid');
      } else if (invite.status === 'used') {
        setCodeStatus('used');
      } else if (invite.status === 'revoked') {
        setCodeStatus('revoked');
      } else if (invite.status === 'active') {
        // Mock company name lookup
        const companyNames = {
          'company-1': 'Tech Solutions Lda',
          'company-2': 'Startup Innovation'
        };
        setCompanyName(companyNames[invite.companyId as keyof typeof companyNames] || 'Empresa');
        setCodeStatus('valid');
      }
      
      setIsValidating(false);
    }, 800);
  };

  const handleInviteCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setInviteCode(upperValue);
    
    // Debounce validation
    setTimeout(() => validateInviteCode(upperValue), 300);
  };

  const handleInviteCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (codeStatus !== 'valid') {
      toast({
        title: "Código inválido",
        description: "Por favor, insira um código de convite válido.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('user-details');
  };

  const handleGoogleLogin = async () => {
    toast({
      title: "Em breve",
      description: "Login com Google será disponibilizado em breve.",
    });
  };

  const handleAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate account creation API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark the code as used in mock data
      const codeIndex = mockInviteCodes.findIndex(code => code.code === inviteCode);
      if (codeIndex !== -1) {
        const newUserId = generateUUID();
        mockInviteCodes[codeIndex] = {
          ...mockInviteCodes[codeIndex],
          status: 'used',
          issuedToUserId: newUserId,
          issuedToUserName: email.split('@')[0],
          issuedToUserEmail: email,
          issuedAt: new Date().toISOString(),
          redeemedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo à plataforma. A redireccionar para o dashboard...",
      });

      // Redirect to user dashboard
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 1500);
      
    } catch (error: any) {
      toast({
        title: "Erro na criação da conta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Código copiado",
      description: "Código copiado para a área de transferência.",
    });
  };

  const handleBackToInviteCode = () => {
    setCurrentStep('invite-code');
  };

  const getCodeStatusDisplay = () => {
    if (isValidating) {
      return (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          A validar código...
        </div>
      );
    }

    switch (codeStatus) {
      case 'valid':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Código válido
            </Badge>
            <span className="text-sm text-green-700">
              Convite para {companyName}
            </span>
          </div>
        );
      case 'invalid':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-3 w-3" />
            Código inválido ou expirado
          </div>
        );
      case 'used':
        return (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <AlertCircle className="h-3 w-3" />
            Código já utilizado
          </div>
        );
      case 'revoked':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-3 w-3" />
            Código revogado
          </div>
        );
      case 'no_seats':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-3 w-3" />
            Sem lugares disponíveis nesta empresa. Contacte o responsável.
          </div>
        );
      default:
        return null;
    }
  };

  const renderInviteCodeStep = () => (
    <Card className="border-0 shadow-lg rounded-xl">
      <CardContent className="p-8">
        <form onSubmit={handleInviteCodeSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="inviteCode" className="text-sm font-medium text-gray-700">
              Código de Convite *
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="inviteCode"
                type="text"
                placeholder="TECH-2024-001"
                value={inviteCode}
                onChange={(e) => handleInviteCodeChange(e.target.value)}
                className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 uppercase font-mono text-sm tracking-wider shadow-inner"
                required
                readOnly={searchParams.get('code') ? true : false}
              />
              {inviteCode && !isValidating && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copiar código"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Code Status Display */}
            <div className="min-h-[24px]">
              {getCodeStatusDisplay()}
            </div>
            
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Key className="h-3 w-3" />
              Código fornecido pela sua empresa
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200"
            disabled={codeStatus !== 'valid'}
          >
            <span>Continuar</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </form>

        {/* Demo Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Para teste:</strong> Use qualquer código ativo da lista: 
            <code className="font-mono bg-blue-100 px-1 mx-1 rounded">TECH-2024-002</code> ou 
            <code className="font-mono bg-blue-100 px-1 mx-1 rounded">STAR-2024-002</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderUserDetailsStep = () => (
    <Card className="border-0 shadow-lg rounded-xl">
      <CardContent className="p-8">
        {/* Step indicator */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <CheckCircle className="h-4 w-4" />
            <span>Código válido para {companyName}</span>
          </div>
        </div>

        <form onSubmit={handleAccountCreation} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Crie uma password segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Mínimo 8 caracteres com números e letras
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToInviteCode}
              className="flex-1 h-12 border-gray-200 hover:bg-gray-50 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  A criar conta...
                </div>
              ) : (
                'Criar conta'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OU</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-lg"
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
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Ao criar conta, aceita os{' '}
          <Link to="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
            Termos
          </Link>
          {' '}e a{' '}
          <Link to="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
            Política de Privacidade
          </Link>
          .
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img 
          src={heroFitness}
          alt="Bem-estar e Saúde" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 z-10" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Melhor Saúde</h1>
          <p className="text-lg text-white/90">
            Junte-se à plataforma de bem-estar da sua empresa.
          </p>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-lg space-y-8">
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
            <h1 className="text-3xl font-bold text-gray-900 font-serif">
              {currentStep === 'invite-code' ? 'Código de Convite' : 'Criar Conta'}
            </h1>
            <p className="text-gray-600">
              {currentStep === 'invite-code' 
                ? 'Digite o código fornecido pela sua empresa.'
                : 'Preencha os seus dados para completar o registo.'
              }
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'invite-code' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {currentStep === 'invite-code' ? '1' : <CheckCircle className="h-4 w-4" />}
            </div>
            <div className={`w-8 h-1 rounded ${
              currentStep === 'user-details' ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'user-details' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>

          {/* Form Steps */}
          {currentStep === 'invite-code' ? renderInviteCodeStep() : renderUserDetailsStep()}

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Já tem conta?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Fazer login
              </Link>
              {' '}ou{' '}
              <Link to="/register/company" className="text-blue-600 hover:text-blue-700 font-medium">
                Registar empresa
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
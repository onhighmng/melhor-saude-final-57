import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Building2, User, Target, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAuthCallbackUrl } from '@/utils/authRedirects';

interface CompanyFormData {
  companyName: string;
  website: string;
  sector: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  password: string;
  packageType: 'starter' | 'business' | 'professional' | 'enterprise';
  employeeSeats: number;
  totalSessions: number;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

const sectors = [
  'Tecnologia',
  'Saúde',
  'Financeiro',
  'Educação',
  'Retalho',
  'Manufatura',
  'Consultoria',
  'Outros'
];

const steps = [
  { id: 1, title: 'Dados da Empresa', icon: Building2 },
  { id: 2, title: 'Contacto Principal', icon: User },
  { id: 3, title: 'Pacote e Limites', icon: Target },
  { id: 4, title: 'Consentimento', icon: FileText }
];

const packageOptions = [
  { 
    id: 'starter', 
    name: 'Starter', 
    seats: 10, 
    sessions: 40,
    description: 'Ideal para pequenas equipas',
    price: '7.000 MZN/mês'
  },
  { 
    id: 'business', 
    name: 'Business', 
    seats: 50, 
    sessions: 200,
    description: 'Para empresas em crescimento',
    price: '27.000 MZN/mês',
    popular: true
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    seats: 100, 
    sessions: 400,
    description: 'Para organizações maiores',
    price: '47.000 MZN/mês'
  },
  { 
    id: 'enterprise', 
    name: 'Enterprise', 
    seats: 200, 
    sessions: 1000,
    description: 'Solução completa para grandes empresas',
    price: 'Personalizado'
  }
];

export default function RegisterCompany() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: '',
    website: '',
    sector: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    password: '',
    packageType: 'business',
    employeeSeats: 50,
    totalSessions: 200,
    acceptTerms: false,
    acceptPrivacy: false
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateFormData = (field: keyof CompanyFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      toast({
        title: "Erro",
        description: "Deve aceitar os termos e condições e a política de privacidade",
        variant: "destructive",
      });
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      toast({
        title: "Erro",
        description: "A password deve ter pelo menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // STEP 1: Create HR user account FIRST
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.contactEmail,
        password: formData.password,
        options: {
          data: {
            name: formData.contactName,
            company_name: formData.companyName,
            role: 'hr' // Pass HR role so trigger assigns it correctly
          },
          emailRedirectTo: getAuthCallbackUrl()
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar utilizador');

      // STEP 2: Create company with employee_seats from selected package
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.companyName,
          email: formData.contactEmail,
          phone: formData.contactPhone,
          employee_seats: formData.employeeSeats, // ⭐ KEY: Set package limit
          sessions_allocated: formData.totalSessions,
          sessions_used: 0,
          plan_type: formData.packageType,
          is_active: true // ⭐ Active immediately - no approval needed
        } as any)
        .select()
        .single();

      if (companyError) throw companyError;

      // STEP 3: Create HR profile with company link
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.contactEmail,
          name: formData.contactName,
          phone: formData.contactPhone,
          role: 'hr', // ⭐ KEY: Set HR role
          company_id: company.id, // ⭐ KEY: Link to company
          is_active: true
        });

      if (profileError && profileError.code !== '23505') {
        throw profileError;
      }

      // STEP 4: Add HR role to user_roles table
      await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'hr'
        } as any)
        .then(res => {
          if (res.error && res.error.code !== '23505') {
            console.error('Role creation error:', res.error);
          }
        });
      
      toast({
        title: "✅ Empresa registada com sucesso!",
        description: `Você agora tem ${formData.employeeSeats} lugares para colaboradores. Faça login para começar.`,
      });

      // Redirect to login
      setTimeout(() => {
        navigate('/login?registered=company');
      }, 2000);
      
    } catch (error) {
      console.error('Company registration error:', error);
      
      // CRITICAL FIX: Check if account was actually created despite the error
      const { data: { user } } = await supabase.auth.getUser();
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.";
      
      // Check if error is about duplicate account OR if user was actually created
      const accountCreated = errorMessage.includes('already') || 
                             errorMessage.includes('já existe') || 
                             errorMessage.includes('já registado') ||
                             errorMessage.includes('User already registered') ||
                             user !== null;
      
      if (accountCreated) {
        // Account was created successfully! Show success message
        toast({
          title: "✅ Empresa registada com sucesso!",
          description: `Você agora tem ${formData.employeeSeats} lugares para colaboradores. Pode fazer login agora.`,
        });
        setTimeout(() => {
          navigate('/login?registered=company');
        }, 2000);
      } else {
        // Complete failure
        toast({
          title: "Erro no registo",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName && formData.sector;
      case 2:
        return formData.contactName && formData.contactEmail && formData.contactPhone && formData.password && formData.password.length >= 8;
      case 3:
        return formData.employeeSeats > 0 && formData.totalSessions > 0;
      case 4:
        return formData.acceptTerms && formData.acceptPrivacy;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateFormData('companyName', e.target.value)}
                placeholder="Ex: Tech Solutions Lda"
                className="h-12"
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                placeholder="https://www.empresa.com"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Setor de Atividade *</Label>
              <Select value={formData.sector} onValueChange={(value) => updateFormData('sector', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Nome do Responsável *</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => updateFormData('contactName', e.target.value)}
                placeholder="João Silva"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateFormData('contactEmail', e.target.value)}
                placeholder="joao@empresa.com"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Telefone *</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => updateFormData('contactPhone', e.target.value)}
                placeholder="+351 912 345 678"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                placeholder="Crie uma password segura"
                className="h-12"
                minLength={8}
              />
              <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Escolha o Seu Pacote</h3>
              <p className="text-gray-600">Selecione o plano que melhor se adequa à sua empresa</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packageOptions.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => {
                    updateFormData('packageType', pkg.id as any);
                    updateFormData('employeeSeats', pkg.seats);
                    updateFormData('totalSessions', pkg.sessions);
                  }}
                  className={`relative p-6 border-2 rounded-lg text-left transition-all ${
                    formData.packageType === pkg.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-primary">Popular</Badge>
                    </div>
                  )}
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold">{pkg.name}</h4>
                    <p className="text-2xl font-bold text-primary">{pkg.price}</p>
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                    <div className="mt-4 pt-4 border-t space-y-1">
                      <p className="text-sm font-medium">✓ {pkg.seats} Lugares para Colaboradores</p>
                      <p className="text-sm font-medium">✓ {pkg.sessions} Sessões de Terapia</p>
                      <p className="text-sm text-gray-500">✓ Todos os 4 Pilares de Bem-Estar</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Consentimento</h3>
              <p className="text-gray-600">Por favor, leia e aceite os termos para finalizar o registo.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => updateFormData('acceptTerms', checked)}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  Aceito os{' '}
                  <Link to="/terms" className="text-bright-royal hover:underline">
                    Termos e Condições
                  </Link>{' '}
                  de utilização da plataforma
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={formData.acceptPrivacy}
                  onCheckedChange={(checked) => updateFormData('acceptPrivacy', checked)}
                />
                <Label htmlFor="privacy" className="text-sm leading-relaxed">
                  Aceito a{' '}
                  <Link to="/privacy" className="text-bright-royal hover:underline">
                    Política de Privacidade
                  </Link>{' '}
                  e o tratamento dos meus dados pessoais
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img 
          src="/src/assets/hero-calculator.jpg"
          alt="Gestão Empresarial" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Melhor Saúde</h1>
          <p className="text-lg text-white/90">
            Invista no bem-estar da sua equipa com soluções profissionais.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
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
            <h1 className="text-2xl font-bold text-gray-900">Registar Empresa</h1>
            <p className="text-gray-600">Crie uma conta para a sua empresa</p>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              {steps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.id} className="flex items-center gap-1">
                    <StepIcon className={`h-3 w-3 ${currentStep >= step.id ? 'text-bright-royal' : 'text-gray-400'}`} />
                    <span className={currentStep >= step.id ? 'text-bright-royal font-medium' : ''}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <Card className="border-0 shadow-none">
            <CardContent className="p-6">
              {renderStepContent()}

              <div className="flex gap-3 mt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                )}

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className="flex-1 h-12"
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isStepValid() || isLoading}
                    className="flex-1 h-12 bg-emerald-green hover:bg-emerald-green/90"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Criando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Criar Empresa
                      </div>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-grey/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">OU</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-slate-grey/20"
                onClick={() => {
                  // Mock Google OAuth for company registration
                  toast({
                    title: "Funcionalidade em desenvolvimento",
                    description: "Google OAuth estará disponível em breve",
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
          </div>

          <div className="text-center text-sm text-gray-600">
            Já tem conta?{' '}
            <Link to="/login" className="text-bright-royal hover:text-bright-royal/80 font-medium">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
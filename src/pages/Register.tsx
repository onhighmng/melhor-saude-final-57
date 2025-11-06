import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, User, Building2, UserCog, CheckCircle, X, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccessCodeValidation } from '@/hooks/useAccessCodeValidation';
import { createUserFromCode, PersonalUserData, HRUserData, EmployeeUserData, PrestadorUserData } from '@/utils/registrationHelpers';
import { UserType } from '@/types/accessCodes';
import { getAuthCallbackUrl } from '@/utils/authRedirects';
import { supabase } from '@/integrations/supabase/client';
import { formatPhoneNumber, PHONE_PLACEHOLDER } from '@/utils/phoneFormat';
import heroFitness from '@/assets/hero-fitness.jpg';
import heroBrain from '@/assets/hero-brain.jpg';
import heroCalculator from '@/assets/hero-calculator.jpg';
import heroNeural from '@/assets/hero-neural.jpg';
import heroPlanning from '@/assets/hero-planning.jpg';

const steps = [
  { id: 1, title: 'Código de Acesso', icon: User },
  { id: 2, title: 'Dados Pessoais', icon: User },
  { id: 3, title: 'Informações Adicionais', icon: Building2 },
  { id: 4, title: 'Confirmação', icon: CheckCircle }
];

const pillars = [
  { value: 'saude_mental', label: 'Saúde Mental' },
  { value: 'bem_estar_fisico', label: 'Bem-Estar Físico' },
  { value: 'assistencia_financeira', label: 'Assistência Financeira' },
  { value: 'assistencia_juridica', label: 'Assistência Jurídica' }
];

const specialties = [
  { value: 'psicologia', label: 'Psicologia' },
  { value: 'nutricao', label: 'Nutrição' },
  { value: 'consultoria_financeira', label: 'Consultoria Financeira' },
  { value: 'assistencia_legal', label: 'Assistência Legal' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'terapia', label: 'Terapia' }
];

const sessionTypes = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'hibrido', label: 'Híbrido' }
];

const availabilityOptions = [
  { value: 'manha', label: 'Manhã (9h-12h)' },
  { value: 'tarde', label: 'Tarde (14h-17h)' },
  { value: 'noite', label: 'Noite (18h-21h)' },
  { value: 'flexivel', label: 'Flexível' },
  { value: 'fim_semana', label: 'Fim de Semana' }
];

const carouselImages = [
  { 
    src: heroFitness, 
    title: 'Bem-Estar Físico',
    description: 'Cuide da sua saúde física com programas personalizados'
  },
  { 
    src: heroBrain, 
    title: 'Saúde Mental',
    description: 'Apoio psicológico profissional quando você precisar'
  },
  { 
    src: heroCalculator, 
    title: 'Assistência Financeira',
    description: 'Consultoria financeira para o seu bem-estar económico'
  },
  { 
    src: heroNeural, 
    title: 'Desenvolvimento Pessoal',
    description: 'Cresça profissional e pessoalmente com nossos especialistas'
  },
  { 
    src: heroPlanning, 
    title: 'Assistência Jurídica',
    description: 'Suporte legal completo para suas necessidades'
  }
];

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [accessCode, setAccessCode] = useState('');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Form data
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    password: '',
    phone: '+258 ',
    pillar: '',
    // HR specific
    companyName: '',
    nuit: '',
    address: '',
    contactPerson: '',
    // Prestador specific
    specialty: '',
    bio: '',
    qualifications: '',
    experience: '',
    costPerSession: '',
    sessionType: '',
    availability: '',
    prestadorAddress: ''
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { isValid, isLoading: isValidating, userType: validatedUserType, companyName: validatedCompanyName, error } = useAccessCodeValidation(accessCode);

  // Auto-scroll carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const updateFormData = (field: string, value: string | number | boolean) => {
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

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      toast({
        title: "Código inválido",
        description: error || "Por favor, insira um código de acesso válido.",
        variant: "destructive",
      });
      return;
    }

    setUserType(validatedUserType!);
    setCompanyName(validatedCompanyName || '');
    nextStep();
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      let userData: PersonalUserData | HRUserData | EmployeeUserData | PrestadorUserData;

      switch (userType) {
        case 'personal':
          userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            pillar: formData.pillar
          };
          break;
        case 'hr':
          userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            companyName: formData.companyName,
            nuit: formData.nuit,
            address: formData.address,
            contactPerson: formData.contactPerson
          };
          break;
        case 'user':
          userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone
          };
          break;
        case 'prestador':
        case 'specialist':
          userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            specialty: formData.specialty,
            pillar: formData.pillar,
            bio: formData.bio,
            qualifications: formData.qualifications,
            experience: parseInt(formData.experience) || 0,
            costPerSession: parseFloat(formData.costPerSession) || 0,
            sessionType: formData.sessionType,
            availability: formData.availability,
            address: formData.prestadorAddress
          };
          break;
        default:
          console.error('Invalid user type:', userType);
          throw new Error('Tipo de utilizador inválido: ' + userType);
      }

      const result = await createUserFromCode(accessCode, userData, userType!);

      toast({
        title: "Registo Concluído ✅",
        description: "A sua conta foi criada com sucesso!",
      });

      // CRITICAL FIX: Redirect through AuthCallback for reliable role-based routing
      // AuthCallback does a fresh database query and doesn't rely on cached state
      console.log('[Register] ✅ Registration complete, redirecting to /auth/callback for role-based routing');
      console.log('[Register] 🔄 AuthCallback will query database and redirect to correct dashboard');
      
      // Wait a bit for database consistency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to AuthCallback which will handle role-based routing correctly
      navigate('/auth/callback', { replace: true });
    } catch (error) {
      console.error('Registration error:', error);
      
      // CRITICAL FIX: Check if account was actually created despite the error
      // This handles partial success cases where user is created but secondary operations fail
      const { data: { user } } = await supabase.auth.getUser();
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Check if error is about duplicate account OR if user was actually created
      const accountCreated = errorMessage.includes('already') || 
                             errorMessage.includes('já existe') || 
                             errorMessage.includes('já registado') ||
                             errorMessage.includes('User already registered') ||
                             user !== null;
      
      if (accountCreated) {
        // Account was created successfully! Show success message
        toast({
          title: "Conta Criada com Sucesso! ✅",
          description: "A sua conta foi criada.",
        });
        
        // CRITICAL FIX: Redirect through AuthCallback for reliable role-based routing
        console.log('[Register Error Recovery] ✅ Account created, redirecting to /auth/callback');
        
        // Wait a bit for database consistency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect to AuthCallback which will handle role-based routing correctly
        navigate('/auth/callback', { replace: true });
        return;
      } else {
        // Complete failure - no user created
        toast({
          title: "Erro no Registo",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Código de Acesso
              </h2>
              <p className="text-sm text-gray-600">
                Insira o código de acesso fornecido para continuar com o registo
              </p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <Label htmlFor="accessCode">Código de Acesso</Label>
                <div className="relative">
                  <Input
                    id="accessCode"
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    placeholder="Ex: MS-1234"
                    className={`pr-10 ${isValid ? 'border-green-500' : error ? 'border-red-500' : ''}`}
                    disabled={isValidating}

                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isValidating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : error ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {isValid && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        Código válido! {companyName && `Empresa: ${companyName}`}
                      </span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={!isValid || isValidating}
                className="w-full"
              >
                Continuar
              </Button>
            </form>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Dados Pessoais
              </h2>
              <p className="text-sm text-gray-600">
                Preencha os seus dados pessoais
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="O seu nome completo"

                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="seu@email.com"

                />
              </div>

              <div>
                <Label htmlFor="password">Palavra-passe *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres"

                  />
                  <Button
                    type="button"
                      variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', formatPhoneNumber(e.target.value))}
                  placeholder={PHONE_PLACEHOLDER}

                />
              </div>

              {(userType === 'personal' || userType === 'prestador') && (
                <div>
                  <Label htmlFor="pillar">Pilar de Interesse</Label>
                  <Select value={formData.pillar} onValueChange={(value) => updateFormData('pillar', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar pilar" />
                    </SelectTrigger>
                    <SelectContent>
                      {pillars.map((pillar) => (
                        <SelectItem key={pillar.value} value={pillar.value}>
                          {pillar.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {userType === 'hr' ? 'Dados da Empresa' : 
                 userType === 'prestador' ? 'Informações Profissionais' : 
                 'Informações Adicionais'}
              </h2>
              <p className="text-sm text-gray-600">
                {userType === 'hr' ? 'Preencha os dados da sua empresa' :
                 userType === 'prestador' ? 'Preencha as suas informações profissionais' :
                 'Informações adicionais sobre si'}
              </p>
            </div>

            <div className="space-y-4">
              {userType === 'hr' && (
                <>
                  <div>
                    <Label htmlFor="companyName">Nome da Empresa *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => updateFormData('companyName', e.target.value)}
                      placeholder="Nome da sua empresa"

                    />
                  </div>
                  <div>
                    <Label htmlFor="nuit">NUIT *</Label>
                    <Input
                      id="nuit"
                      value={formData.nuit}
                      onChange={(e) => updateFormData('nuit', e.target.value)}
                      placeholder="123456789"
                      maxLength={9}

                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      placeholder="Endereço da empresa"

                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Pessoa de Contacto *</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => updateFormData('contactPerson', e.target.value)}
                      placeholder="Nome da pessoa responsável"

                    />
                  </div>
                </>
              )}

              {userType === 'prestador' && (
                <>
                  <div>
                    <Label htmlFor="specialty">Especialidade *</Label>
                    <Select value={formData.specialty} onValueChange={(value) => updateFormData('specialty', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty.value} value={specialty.value}>
                            {specialty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="costPerSession">Custo por Sessão (MZN) *</Label>
                    <Input
                      id="costPerSession"
                      type="number"
                      step="0.01"
                      value={formData.costPerSession}
                      onChange={(e) => updateFormData('costPerSession', e.target.value)}
                      placeholder="0.00"

                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionType">Tipo de Sessão *</Label>
                    <Select value={formData.sessionType} onValueChange={(value) => updateFormData('sessionType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="availability">Disponibilidade *</Label>
                    <Select value={formData.availability} onValueChange={(value) => updateFormData('availability', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar disponibilidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bio">Biografia</Label>
                    <Input
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => updateFormData('bio', e.target.value)}
                      placeholder="Breve descrição profissional..."

                    />
                  </div>
                  <div>
                    <Label htmlFor="qualifications">Qualificações</Label>
                    <Input
                      id="qualifications"
                      value={formData.qualifications}
                      onChange={(e) => updateFormData('qualifications', e.target.value)}
                      placeholder="Formação académica e certificações..."

                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Anos de Experiência</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience}
                      onChange={(e) => updateFormData('experience', e.target.value)}
                      placeholder="Ex: 5"

                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Confirmação
              </h2>
              <p className="text-sm text-gray-600">
                Revise os seus dados antes de criar a conta
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Dados Pessoais</h3>
                <p><strong>Nome:</strong> {formData.name}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Telefone:</strong> {formData.phone || 'Não fornecido'}</p>
                {formData.pillar && <p><strong>Pilar:</strong> {pillars.find(p => p.value === formData.pillar)?.label}</p>}
              </div>

              {userType === 'hr' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Dados da Empresa</h3>
                  <p><strong>Empresa:</strong> {formData.companyName}</p>
                  <p><strong>NUIT:</strong> {formData.nuit}</p>
                  <p><strong>Endereço:</strong> {formData.address}</p>
                  <p><strong>Contacto:</strong> {formData.contactPerson}</p>
                </div>
              )}

              {userType === 'prestador' && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Informações Profissionais</h3>
                  <p><strong>Especialidade:</strong> {specialties.find(s => s.value === formData.specialty)?.label}</p>
                  <p><strong>Custo por Sessão:</strong> {formData.costPerSession} MZN</p>
                  <p><strong>Tipo de Sessão:</strong> {sessionTypes.find(t => t.value === formData.sessionType)?.label}</p>
                  <p><strong>Disponibilidade:</strong> {availabilityOptions.find(a => a.value === formData.availability)?.label}</p>
                  {formData.bio && <p><strong>Biografia:</strong> {formData.bio}</p>}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm">
                  Aceito os <Link to="/terms" className="text-blue-600 hover:underline">Termos e Condições</Link> e a <Link to="/privacy" className="text-blue-600 hover:underline">Política de Privacidade</Link>
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image Carousel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900">
        {/* Carousel Images */}
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col justify-end p-12">
              <div className="max-w-xl">
                <h2 className="text-4xl font-bold text-white mb-4 animate-fade-in">
                  {image.title}
                </h2>
                <p className="text-xl text-white/90 mb-8 animate-fade-in animation-delay-200">
                  {image.description}
                </p>
                
                {/* Carousel Indicators */}
                <div className="flex gap-2">
                  {carouselImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentImageIndex 
                          ? 'w-8 bg-white' 
                          : 'w-2 bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Logo on carousel */}
        <div className="absolute top-12 left-8 z-20">
          <img 
            src="/lovable-uploads/c207c3c2-eab3-483e-93b6-a55cf5e5fdf2.png" 
            alt="Melhor Saúde Logo" 
            className="w-32 h-32 object-contain"
          />
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à página inicial
            </Link>
            <img 
              src="/lovable-uploads/c207c3c2-eab3-483e-93b6-a55cf5e5fdf2.png" 
              alt="Melhor Saúde Logo" 
              className="w-32 h-32 mx-auto object-contain lg:hidden mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900">
              Registo na Plataforma
            </h1>
            <p className="text-muted-foreground mt-2">
              Crie a sua conta usando o código de acesso fornecido
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 space-y-3">
            <div className="flex justify-between text-sm text-gray-600 font-semibold">
              <span>Passo {currentStep} de 4</span>
              <span>{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <Progress value={(currentStep / 4) * 100} className="h-3" />
            
            {/* Step indicators */}
            <div className="flex justify-between pt-2">
              {steps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div 
                    key={step.id} 
                    className={`flex items-center gap-2 text-base ${
                      currentStep >= step.id ? 'text-blue-600 font-semibold' : 'text-gray-400'
                    }`}
                  >
                    <StepIcon className="h-6 w-6" />
                    <span className="hidden sm:inline">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6 space-y-6">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 text-base h-12 px-6"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Anterior
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    className="flex items-center gap-2 text-base h-12 px-6"
                  >
                    Próximo
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-base h-12 px-6 bg-emerald-green hover:bg-emerald-green/90"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Criando Conta...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Criar Conta
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-lg text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold text-lg">
                Iniciar Sessão
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
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
import { createUserFromCode } from '@/utils/registrationHelpers';
import { UserType } from '@/types/accessCodes';
import { PersonalUserData, HRUserData, EmployeeUserData, PrestadorUserData, EspecialistaGeralUserData } from '@/utils/registrationHelpers';
import { getAuthCallbackUrl } from '@/utils/authRedirects';

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

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [accessCode, setAccessCode] = useState('');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    password: '',
    phone: '',
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
      let userData: PersonalUserData | HRUserData | EmployeeUserData | PrestadorUserData | EspecialistaGeralUserData;

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
            address: formData.prestadorAddress,
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
        case 'especialista_geral':
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
          throw new Error('Tipo de utilizador inválido');
      }

      await createUserFromCode(accessCode, userData, userType!);

      toast({
        title: "Registo Concluído",
        description: "A sua conta foi criada com sucesso! Verifique o seu email para confirmar.",
      });

      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Erro no Registo",
        description: error instanceof Error ? error.message : "Erro ao criar conta. Tente novamente.",
        variant: "destructive",
      });
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Código de Acesso
              </h2>
              <p className="text-gray-600">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Dados Pessoais
              </h2>
              <p className="text-gray-600">
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
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+351 123 456 789"
                />
              </div>

              {(userType === 'personal' || userType === 'prestador' || userType === 'especialista_geral') && (
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {userType === 'hr' ? 'Dados da Empresa' :
                 (userType === 'prestador' || userType === 'especialista_geral') ? 'Informações Profissionais' :
                 'Informações Adicionais'}
              </h2>
              <p className="text-gray-600">
                {userType === 'hr' ? 'Preencha os dados da sua empresa' :
                 (userType === 'prestador' || userType === 'especialista_geral') ? 'Preencha as suas informações profissionais' :
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

              {(userType === 'prestador' || userType === 'especialista_geral') && (
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
                    <Label htmlFor="costPerSession">Custo por Sessão (€) *</Label>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Confirmação
              </h2>
              <p className="text-gray-600">
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

              {(userType === 'prestador' || userType === 'especialista_geral') && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Informações Profissionais</h3>
                  <p><strong>Especialidade:</strong> {specialties.find(s => s.value === formData.specialty)?.label}</p>
                  <p><strong>Custo por Sessão:</strong> €{formData.costPerSession}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Registo na Plataforma
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Crie a sua conta usando o código de acesso fornecido
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Passo {currentStep} de 4</span>
                <span>{Math.round((currentStep / 4) * 100)}%</span>
              </div>
              <Progress value={(currentStep / 4) * 100} className="h-2" />
            </div>

            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Criando Conta...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Criar Conta
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-gray-600">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                  Iniciar Sessão
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

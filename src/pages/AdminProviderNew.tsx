import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Upload, 
  User, 
  FileText,
  Clock,
  Shield,
  Brain,
  Heart,
  DollarSign,
  Scale,
  Building2,
  Plus,
  X
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ProviderFormData {
  // Basic Data
  name: string;
  email: string;
  bio: string;
  languages: string[];
  avatar: File | null;
  
  // Credentials
  licenseFile: File | null;
  licenseNumber: string;
  licenseExpiry: string;
  
  // Availability & Capacity
  defaultSlot: number;
  maxSessionsPerDay: number;
  maxSessionsPerWeek: number;
  initialStatus: 'active' | 'inactive';
  
  // Pillars
  pillars: {
    mentalHealth: boolean;
    physicalWellness: boolean;
    financialAssistance: boolean;
    legalAssistance: boolean;
  };
  
  // Company restrictions
  restrictedCompanies: string[];
}

const AdminProviderNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');
  
  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    email: '',
    bio: '',
    languages: [],
    avatar: null,
    licenseFile: null,
    licenseNumber: '',
    licenseExpiry: '',
    defaultSlot: 50,
    maxSessionsPerDay: 8,
    maxSessionsPerWeek: 40,
    initialStatus: 'inactive',
    pillars: {
      mentalHealth: false,
      physicalWellness: false,
      financialAssistance: false,
      legalAssistance: false
    },
    restrictedCompanies: []
  });

  // Mock companies data
  const availableCompanies = [
    'TechCorp Lda',
    'HealthPlus SA',
    'InnovateLab',
    'DataSys Solutions',
    'StartupHub'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePillarChange = (pillar: keyof ProviderFormData['pillars'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      pillars: {
        ...prev.pillars,
        [pillar]: checked
      }
    }));
  };

  const handleFileUpload = (field: 'avatar' | 'licenseFile', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const addLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== language)
    }));
  };

  const toggleCompanyRestriction = (company: string) => {
    setFormData(prev => ({
      ...prev,
      restrictedCompanies: prev.restrictedCompanies.includes(company)
        ? prev.restrictedCompanies.filter(c => c !== company)
        : [...prev.restrictedCompanies, company]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email) {
      toast({
        title: "Erro de validação",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const selectedPillars = Object.values(formData.pillars).some(Boolean);
    if (!selectedPillars) {
      toast({
        title: "Erro de validação",
        description: "Selecione pelo menos um pilar",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Prestador criado com sucesso!",
        description: `${formData.name} foi adicionado ao sistema. Estado: ${formData.initialStatus === 'active' ? 'Ativo' : 'Aguardando verificação'}`,
      });
      
      navigate('/admin/prestadores');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar prestador. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pillarOptions = [
    {
      key: 'mentalHealth',
      label: 'Saúde Mental',
      icon: Brain,
      color: 'text-blue-600'
    },
    {
      key: 'physicalWellness',
      label: 'Bem-Estar Físico',
      icon: Heart,
      color: 'text-red-600'
    },
    {
      key: 'financialAssistance',
      label: 'Assistência Financeira',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      key: 'legalAssistance',
      label: 'Assistência Jurídica',
      icon: Scale,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Novo Prestador</h1>
            <p className="text-sm text-muted-foreground">Criar e configurar prestador de serviços</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Data Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Dados Básicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Dr./Dra. Nome Completo"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="prestador@exemplo.com"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Bio Curta</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Breve descrição profissional..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Línguas Faladas</Label>
                    <div className="flex gap-2 mt-1">
                      <Select value={newLanguage} onValueChange={setNewLanguage}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecionar língua" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border shadow-lg z-50">
                          <SelectItem value="PT">Português</SelectItem>
                          <SelectItem value="EN">English</SelectItem>
                          <SelectItem value="ES">Español</SelectItem>
                          <SelectItem value="FR">Français</SelectItem>
                          <SelectItem value="DE">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={addLanguage} disabled={!newLanguage}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.languages.map(lang => (
                        <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                          {lang}
                          <button type="button" onClick={() => removeLanguage(lang)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Foto/Avatar</Label>
                  <div className="flex items-center gap-4 mt-1">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={formData.avatar ? URL.createObjectURL(formData.avatar) : ''} />
                      <AvatarFallback>
                        {formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'PR'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('avatar', e.target.files?.[0] || null)}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Foto
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credentials Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Credenciais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="licenseNumber">Nº de Identificação da Licença</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      placeholder="Ex: OP12345"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="licenseExpiry">Validade da Licença</Label>
                    <Input
                      id="licenseExpiry"
                      type="date"
                      value={formData.licenseExpiry}
                      onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Upload de Licença (PDF/JPG)</Label>
                  <div className="mt-1">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('licenseFile', e.target.files?.[0] || null)}
                      className="hidden"
                      id="license-upload"
                    />
                    <Label htmlFor="license-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {formData.licenseFile ? formData.licenseFile.name : 'Clique para fazer upload'}
                        </p>
                      </div>
                    </Label>
                  </div>
                  <Badge variant="outline" className="mt-2 text-amber-600 border-amber-300">
                    Estado: Aguardando verificação
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability & Capacity Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Disponibilidade & Capacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="defaultSlot">Slot Padrão (minutos)</Label>
                  <Select value={formData.defaultSlot.toString()} onValueChange={(value) => handleInputChange('defaultSlot', parseInt(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="50">50 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxSessionsPerDay">Máximo por Dia</Label>
                  <Input
                    id="maxSessionsPerDay"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.maxSessionsPerDay}
                    onChange={(e) => handleInputChange('maxSessionsPerDay', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxSessionsPerWeek">Máximo por Semana</Label>
                  <Input
                    id="maxSessionsPerWeek"
                    type="number"
                    min="1"
                    max="168"
                    value={formData.maxSessionsPerWeek}
                    onChange={(e) => handleInputChange('maxSessionsPerWeek', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="initialStatus">Estado Inicial</Label>
                  <Select value={formData.initialStatus} onValueChange={(value: 'active' | 'inactive') => handleInputChange('initialStatus', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pillars Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Pilares de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pillarOptions.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div key={pillar.key} className="flex items-center space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        id={pillar.key}
                        checked={formData.pillars[pillar.key as keyof ProviderFormData['pillars']]}
                        onCheckedChange={(checked) => handlePillarChange(pillar.key as keyof ProviderFormData['pillars'], checked as boolean)}
                      />
                      <Label htmlFor={pillar.key} className="flex items-center gap-2 cursor-pointer flex-1">
                        <Icon className={`h-5 w-5 ${pillar.color}`} />
                        <span className="font-medium">{pillar.label}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>

              {/* Company Restrictions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <Label className="text-base font-medium">Restrições de Empresas</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Selecione empresas específicas que este prestador pode atender (opcional)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableCompanies.map((company) => (
                    <div key={company} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        id={`company-${company}`}
                        checked={formData.restrictedCompanies.includes(company)}
                        onCheckedChange={() => toggleCompanyRestriction(company)}
                      />
                      <Label htmlFor={`company-${company}`} className="text-sm cursor-pointer flex-1">
                        {company}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.restrictedCompanies.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhuma restrição - pode atender todas as empresas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? 'A criar...' : 'Criar Prestador'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProviderNew;
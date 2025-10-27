import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { profile } = useAuth();
  const { t } = useTranslation('admin');
  const { t: tCommon } = useTranslation('common');
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
        title: t('providerNew.validation.title'),
        description: t('providerNew.validation.nameEmailRequired'),
        variant: "destructive"
      });
      return;
    }

    const selectedPillars = Object.values(formData.pillars).some(Boolean);
    if (!selectedPillars) {
      toast({
        title: t('providerNew.validation.title'),
        description: t('providerNew.validation.selectPillar'),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get selected pillars
      const selectedPillars = [];
      if (formData.pillars.mentalHealth) selectedPillars.push('saude_mental');
      if (formData.pillars.physicalWellness) selectedPillars.push('bem_estar_fisico');
      if (formData.pillars.financialAssistance) selectedPillars.push('assistencia_financeira');
      if (formData.pillars.legalAssistance) selectedPillars.push('assistencia_juridica');

      // Generate random password
      const randomPassword = Math.random().toString(36).slice(-12) + 'A1!';

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: randomPassword,
        options: {
          data: { name: formData.name }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar utilizador');

      // Create profile WITHOUT role
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          bio: formData.bio,
          metadata: {
            languages: formData.languages,
            license_number: formData.licenseNumber,
            license_expiry: formData.licenseExpiry
          }
        });

      if (profileError) throw profileError;

      // Create role in user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'prestador',
          created_by: profile?.id
        });

      if (roleError) throw roleError;

      // Create prestador record
      const { error: prestadorError } = await supabase
        .from('prestadores')
        .insert({
          name: formData.name,
          email: formData.email,
          pillar_specialties: selectedPillars,
          biography: formData.bio,
          languages: formData.languages
        });

      if (prestadorError) throw prestadorError;

      // Log admin action
      if (profile?.id) {
        await supabase.from('admin_logs').insert({
          admin_id: profile.id,
          action: 'prestador_created',
          entity_type: 'prestador',
          entity_id: authData.user.id,
          changes: formData
        });
      }

      const statusText = formData.initialStatus === 'active' ? t('providerNew.availability.active') : t('providerNew.credentials.statusPending').replace('Estado: ', '');
      
      toast({
        title: t('providerNew.success.title'),
        description: `Prestador criado. Email: ${formData.email}, Senha: ${randomPassword}`,
      });

      console.log('Provider credentials:', { email: formData.email, password: randomPassword });
      
      navigate('/admin/prestadores');
    } catch (error: any) {
      console.error('Provider creation error:', error);
      toast({
        title: t('providerNew.error.title'),
        description: error.message || t('providerNew.error.description'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pillarOptions = [
    {
      key: 'mentalHealth',
      label: tCommon('pillars.mentalHealth'),
      icon: Brain,
      color: 'text-blue-600'
    },
    {
      key: 'physicalWellness',
      label: tCommon('pillars.physicalWellness'),
      icon: Heart,
      color: 'text-red-600'
    },
    {
      key: 'financialAssistance',
      label: tCommon('pillars.financialAssistance'),
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      key: 'legalAssistance',
      label: tCommon('pillars.legalAssistance'),
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
            {t('providerNew.back')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('providerNew.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('providerNew.subtitle')}</p>
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
                {t('providerNew.basicData.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t('providerNew.basicData.fullName')} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('providerNew.basicData.fullNamePlaceholder')}
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">{t('providerNew.basicData.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('providerNew.basicData.emailPlaceholder')}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio">{t('providerNew.basicData.bio')}</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder={t('providerNew.basicData.bioPlaceholder')}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>{t('providerNew.basicData.languages')}</Label>
                    <div className="flex gap-2 mt-1">
                      <Select value={newLanguage} onValueChange={setNewLanguage}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={t('providerNew.basicData.selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border shadow-lg z-50">
                          <SelectItem value="PT">{t('providerNew.languages.portuguese')}</SelectItem>
                          <SelectItem value="EN">{t('providerNew.languages.english')}</SelectItem>
                          <SelectItem value="ES">{t('providerNew.languages.spanish')}</SelectItem>
                          <SelectItem value="FR">{t('providerNew.languages.french')}</SelectItem>
                          <SelectItem value="DE">{t('providerNew.languages.german')}</SelectItem>
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
                  <Label>{t('providerNew.basicData.photo')}</Label>
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
                            {t('providerNew.basicData.uploadPhoto')}
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
                {t('providerNew.credentials.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="licenseNumber">{t('providerNew.credentials.licenseNumber')}</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      placeholder={t('providerNew.credentials.licenseNumberPlaceholder')}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="licenseExpiry">{t('providerNew.credentials.licenseExpiry')}</Label>
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
                  <Label>{t('providerNew.credentials.uploadLicense')}</Label>
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
                          {formData.licenseFile ? formData.licenseFile.name : t('providerNew.credentials.clickToUpload')}
                        </p>
                      </div>
                    </Label>
                  </div>
                  <Badge variant="outline" className="mt-2 text-amber-600 border-amber-300">
                    {t('providerNew.credentials.statusPending')}
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
                {t('providerNew.availability.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="defaultSlot">{t('providerNew.availability.defaultSlot')}</Label>
                  <Select value={formData.defaultSlot.toString()} onValueChange={(value) => handleInputChange('defaultSlot', parseInt(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      <SelectItem value="30">{t('providerNew.availability.minutes30')}</SelectItem>
                      <SelectItem value="45">{t('providerNew.availability.minutes45')}</SelectItem>
                      <SelectItem value="50">{t('providerNew.availability.minutes50')}</SelectItem>
                      <SelectItem value="60">{t('providerNew.availability.minutes60')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxSessionsPerDay">{t('providerNew.availability.maxPerDay')}</Label>
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
                  <Label htmlFor="maxSessionsPerWeek">{t('providerNew.availability.maxPerWeek')}</Label>
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
                  <Label htmlFor="initialStatus">{t('providerNew.availability.initialStatus')}</Label>
                  <Select value={formData.initialStatus} onValueChange={(value: 'active' | 'inactive') => handleInputChange('initialStatus', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      <SelectItem value="active">{t('providerNew.availability.active')}</SelectItem>
                      <SelectItem value="inactive">{t('providerNew.availability.inactive')}</SelectItem>
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
                {t('providerNew.pillars.title')}
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
                  <Label className="text-base font-medium">{t('providerNew.restrictions.title')}</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('providerNew.restrictions.subtitle')}
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
                    {t('providerNew.restrictions.noRestrictions')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? t('providerNew.creating') : t('providerNew.createProvider')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProviderNew;
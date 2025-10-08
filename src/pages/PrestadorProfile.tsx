import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Camera, 
  Shield, 
  Upload, 
  Save, 
  FileText, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Globe,
  Award,
  Plus,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface PrestadorProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio: string;
  specialties: string[];
  languages: string[];
  licenseNumber?: string;
  licenseExpiry?: string;
  verificationStatus: 'pending' | 'verified' | 'expired' | 'not_submitted';
  documentsUploaded: boolean;
}

const mockProfileData: PrestadorProfileData = {
  id: 'prest-1',
  name: 'Dr. Ana Silva',
  email: 'ana.silva@email.com',
  avatar: '/lovable-uploads/537ae6d8-8bad-4984-87ef-5165033fdc1c.png',
  bio: 'Psicóloga clínica especializada em ansiedade e stress laboral. 15 anos de experiência em terapia cognitivo-comportamental.',
  specialties: ['Saúde Mental', 'Ansiedade', 'Stress Laboral'],
  languages: ['Português', 'Inglês', 'Espanhol'],
  licenseNumber: 'COP-12345',
  licenseExpiry: '2025-12-31',
  verificationStatus: 'verified',
  documentsUploaded: true
};

const availableSpecialties = [
  'Saúde Mental', 'Bem-Estar Físico', 'Assistência Financeira', 'Assistência Jurídica',
  'Ansiedade', 'Depressão', 'Stress Laboral', 'Terapia de Casal', 'Nutrição',
  'Exercício Físico', 'Fisioterapia', 'Planeamento Financeiro', 'Investimentos',
  'Direito Laboral', 'Direito Familiar', 'Direito Criminal'
];

const availableLanguages = [
  'Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano'
];

export default function PrestadorProfile() {
  const { t } = useTranslation('provider');
  const [profile, setProfile] = useState<PrestadorProfileData>(mockProfileData);
  const [isEditing, setIsEditing] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const getStatusConfig = () => {
    switch (profile.verificationStatus) {
      case 'verified':
        return {
          color: 'bg-green-50 border-green-200 text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          title: 'Perfil Verificado',
          message: 'As suas credenciais foram verificadas e aprovadas.'
        };
      case 'pending':
        return {
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: Clock,
          iconColor: 'text-blue-600',
          title: 'Aguardando Verificação',
          message: 'Os seus documentos estão a ser analisados pela nossa equipa.'
        };
      case 'expired':
        return {
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          title: 'Licença Expirada',
          message: 'A sua licença expirou. Por favor, carregue documentos atualizados.'
        };
      default:
        return {
          color: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: FileText,
          iconColor: 'text-gray-600',
          title: 'Verificação Pendente',
          message: 'Carregue os seus documentos para verificação.'
        };
    }
  };

  const handleSave = () => {
    console.log('Saving profile:', profile);
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    console.log('Opening avatar upload...');
  };

  const handleDocumentUpload = () => {
    console.log('Opening document upload...');
    setProfile(prev => ({ 
      ...prev, 
      documentsUploaded: true, 
      verificationStatus: 'pending' 
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty && !profile.specialties.includes(newSpecialty)) {
      setProfile(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setProfile(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const addLanguage = () => {
    if (newLanguage && !profile.languages.includes(newLanguage)) {
      setProfile(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Perfil Profissional"
        subtitle="Gerir as suas informações e credenciais"
        icon={User}
        showBackButton
        backUrl="/prestador/dashboard"
        actions={
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Guardar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Editar Perfil
              </Button>
            )}
          </div>
        }
      />

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Status Banner */}
        <div className={`p-4 rounded-lg border ${statusConfig.color}`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${statusConfig.iconColor}`} />
            <div>
              <h4 className="font-semibold">{statusConfig.title}</h4>
              <p className="text-sm">{statusConfig.message}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback className="text-2xl font-bold">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        onClick={handleAvatarUpload}
                        className="absolute bottom-0 right-0 rounded-full h-10 w-10 p-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Name and Verification */}
                  <div className="space-y-2">
                    {isEditing ? (
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="text-center text-2xl font-bold"
                      />
                    ) : (
                      <div className="flex items-center gap-2 justify-center">
                        <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                        {profile.verificationStatus === 'verified' && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                            <Shield className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                      </div>
                    )}
                    <p className="text-gray-600">{profile.email}</p>
                  </div>

                  {/* Bio */}
                  <div className="w-full max-w-2xl">
                    {isEditing ? (
                      <Textarea
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Escreva a sua biografia profissional..."
                        className="text-center min-h-[100px]"
                        maxLength={200}
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                    )}
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        {profile.bio.length}/200 caracteres
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Especialidades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty) => (
                    <Badge 
                      key={specialty} 
                      variant="secondary"
                      className="text-sm py-1 px-3"
                    >
                      {specialty}
                      {isEditing && (
                        <button
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-2 text-gray-500 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Select value={newSpecialty} onValueChange={setNewSpecialty}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t('provider.profile.addSpecialty', { ns: 'provider' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSpecialties
                          .filter(s => !profile.specialties.includes(s))
                          .map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addSpecialty} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Idiomas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language) => (
                    <Badge 
                      key={language} 
                      variant="outline"
                      className="text-sm py-1 px-3"
                    >
                      {language}
                      {isEditing && (
                        <button
                          onClick={() => removeLanguage(language)}
                          className="ml-2 text-gray-500 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Select value={newLanguage} onValueChange={setNewLanguage}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t('provider.profile.addLanguage', { ns: 'provider' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages
                          .filter(l => !profile.languages.includes(l))
                          .map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addLanguage} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Credentials Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Credenciais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Número da Licença
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.licenseNumber || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      placeholder="Ex: COP-12345"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.licenseNumber || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Validade da Licença
                  </label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={profile.licenseExpiry || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p className="text-gray-900">
                        {profile.licenseExpiry 
                          ? format(new Date(profile.licenseExpiry), "dd 'de' MMMM 'de' yyyy", { locale: pt })
                          : 'Não informado'
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleDocumentUpload}
                    variant={profile.documentsUploaded ? "outline" : "default"}
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {profile.documentsUploaded ? t('provider.profile.updateDocuments', { ns: 'provider' }) : t('provider.profile.uploadDocuments', { ns: 'provider' })}
                  </Button>
                  
                  {profile.documentsUploaded && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {t('provider.profile.documentsUploaded', { ns: 'provider' })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle>Estado da Verificação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    profile.verificationStatus === 'verified' ? 'bg-green-100' :
                    profile.verificationStatus === 'pending' ? 'bg-blue-100' :
                    profile.verificationStatus === 'expired' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <StatusIcon className={`h-8 w-8 ${statusConfig.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{statusConfig.title}</p>
                    <p className="text-sm text-gray-600">{statusConfig.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
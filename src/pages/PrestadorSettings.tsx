import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { AvailabilitySettings } from '@/components/specialist/AvailabilitySettings';
import { 
  User, 
  Camera, 
  Shield, 
  Save, 
  Settings,
  Clock,
  Euro,
  Lock,
  Brain,
  Heart,
  DollarSign,
  Scale
} from 'lucide-react';
import { mockPrestadorSettings } from '@/data/prestadorMetrics';
import { useToast } from "@/hooks/use-toast";

const PrestadorSettings = () => {
  const [settings, setSettings] = useState(mockPrestadorSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const { toast } = useToast();

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'Bem-Estar Físico':
        return <Heart className="h-4 w-4 text-yellow-600" />;
      case 'Assistência Financeira':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'Assistência Jurídica':
        return <Scale className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getPillarBadgeColor = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bem-Estar Físico':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Assistência Financeira':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Assistência Jurídica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado",
      description: "As suas informações pessoais foram salvas com sucesso"
    });
    setIsEditing(false);
  };

  const handleOpenAvailability = () => {
    setIsAvailabilityModalOpen(true);
  };

  const handleChangePassword = () => {
    if (newPassword.new !== newPassword.confirm) {
      toast({
        title: "Erro",
        description: "As palavras-passe não coincidem",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Palavra-passe alterada",
      description: "A sua palavra-passe foi alterada com sucesso"
    });

    setNewPassword({
      current: '',
      new: '',
      confirm: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Perfil e Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerir as suas informações pessoais e configurações
          </p>
        </div>
        
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          {isEditing ? 'Cancelar' : 'Editar'}
        </Button>
      </div>

      <div className="h-[calc(100vh-200px)]">
        <BentoGrid className="h-full grid-rows-2 gap-4">
          {/* Personal Information */}
          <BentoCard
            name="Informação Pessoal"
            description={`${settings.name} - ${settings.email}`}
            Icon={User}
            className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2"
            background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />}
            iconColor="text-blue-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
          >
            <div className="relative z-30 flex flex-col h-full p-6 overflow-y-auto">
              <div className="space-y-4">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {settings.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Camera className="h-3 w-3" />
                      Alterar Foto
                    </Button>
                  )}
                </div>

                {/* Basic Info */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-xs">Nome completo</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pillar" className="text-xs">Pilar</Label>
                    <div className="mt-1">
                      <Badge className={`${getPillarBadgeColor(settings.pillar)} flex items-center gap-1 w-fit text-xs`}>
                        {getPillarIcon(settings.pillar)}
                        {settings.pillar}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      O pilar não pode ser alterado
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <Button onClick={handleSaveProfile} className="w-full gap-2 h-8 text-sm" size="sm">
                    <Save className="h-3 w-3" />
                    Guardar Alterações
                  </Button>
                )}
              </div>
            </div>
          </BentoCard>

          {/* Financial Information */}
          <BentoCard
            name="Informação Financeira"
            description={`${settings.costPerSession} MZN por sessão`}
            Icon={Euro}
            className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2"
            background={<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100" />}
            iconColor="text-green-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
          >
            <div className="relative z-30 flex flex-col h-full p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="costPerSession" className="text-xs">Valor por sessão (MZN)</Label>
                  <div className="relative mt-1">
                    <Input
                      id="costPerSession"
                      value={settings.costPerSession}
                      disabled
                      className="pl-8 h-8 text-sm"
                    />
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Este valor é apenas para visualização e não pode ser alterado
                  </p>
                </div>

                <div className="p-3 bg-white/80 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    Informação sobre Pagamentos
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Recebe 75% do valor por sessão</li>
                    <li>• 25% é retido como comissão da plataforma</li>
                    <li>• Pagamentos são processados mensalmente</li>
                    <li>• Consulte a secção "Desempenho" para detalhes financeiros</li>
                  </ul>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Availability Settings */}
          <BentoCard
            name="Disponibilidade"
            description="Configure os seus horários disponíveis"
            Icon={Clock}
            onClick={handleOpenAvailability}
            className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3"
            background={<div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100" />}
            iconColor="text-purple-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta="Gerir Horários"
          >
            <div className="relative z-30 flex flex-col h-full p-6 overflow-y-auto">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Horários Preferidos</Label>
                  <p className="text-sm font-medium mt-1">{settings.preferredHours}</p>
                </div>

                <div>
                  <Label className="text-xs">Disponibilidade Semanal (Preview)</Label>
                  <div className="mt-2 space-y-1">
                    {settings.availability.slice(0, 3).map((day, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white/80 rounded text-xs">
                        <div className="w-16 font-medium">{day.split(':')[0]}:</div>
                        <div className="flex-1 text-muted-foreground">{day.split(':')[1]}</div>
                      </div>
                    ))}
                    {settings.availability.length > 3 && (
                      <p className="text-[10px] text-muted-foreground text-center pt-1">
                        +{settings.availability.length - 3} mais dias
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Security Settings */}
          <BentoCard
            name="Segurança"
            description="Alterar palavra-passe e configurações de segurança"
            Icon={Lock}
            className="lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3"
            background={<div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100" />}
            iconColor="text-red-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
          >
            <div className="relative z-30 flex flex-col h-full p-6 overflow-y-auto">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="currentPassword" className="text-xs">Palavra-passe atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={newPassword.current}
                    onChange={(e) => setNewPassword({ ...newPassword, current: e.target.value })}
                    className="mt-1 h-8 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-xs">Nova palavra-passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword.new}
                    onChange={(e) => setNewPassword({ ...newPassword, new: e.target.value })}
                    className="mt-1 h-8 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-xs">Confirmar nova palavra-passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={newPassword.confirm}
                    onChange={(e) => setNewPassword({ ...newPassword, confirm: e.target.value })}
                    className="mt-1 h-8 text-sm"
                  />
                </div>

                <Button 
                  onClick={handleChangePassword} 
                  className="w-full gap-2 h-8 text-sm"
                  size="sm"
                  disabled={!newPassword.current || !newPassword.new || !newPassword.confirm}
                >
                  <Lock className="h-3 w-3" />
                  Alterar Palavra-passe
                </Button>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>

      {/* GDPR Footer */}
      <Card className="border-0 shadow-sm bg-muted/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Proteção de Dados</h4>
              <p className="text-sm text-muted-foreground">
                Os seus dados estão protegidos e seguem as normas RGPD. 
                Apenas as informações necessárias para o funcionamento da plataforma são recolhidas e armazenadas. 
                Pode solicitar a eliminação dos seus dados a qualquer momento através do nosso suporte.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Settings Modal */}
      <AvailabilitySettings 
        open={isAvailabilityModalOpen}
        onOpenChange={setIsAvailabilityModalOpen}
      />
    </div>
  );
};

export default PrestadorSettings;

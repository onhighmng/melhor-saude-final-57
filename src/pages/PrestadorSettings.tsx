import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isFinancialInfoOpen, setIsFinancialInfoOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
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
    <div className="space-y-6 min-h-screen bg-blue-50 p-6 -m-6">
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

      <div className="w-full h-[calc(100vh-200px)]">
        <BentoGrid className="h-full grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-4 w-full">
          {/* Personal Information - Minimal */}
          <BentoCard
            name="Informação Pessoal"
            description={`${settings.name}`}
            Icon={User}
            onClick={() => setIsPersonalInfoOpen(true)}
            className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2"
            background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />}
            iconColor="text-blue-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta="Ver Detalhes"
          />

          {/* Financial Information - Minimal */}
          <BentoCard
            name="Informação Financeira"
            description={`${settings.costPerSession} MZN/sessão`}
            Icon={Euro}
            onClick={() => setIsFinancialInfoOpen(true)}
            className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2"
            background={<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100" />}
            iconColor="text-green-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta="Ver Detalhes"
          />

          {/* Availability Settings - Minimal */}
          <BentoCard
            name="Disponibilidade"
            description={settings.preferredHours}
            Icon={Clock}
            onClick={() => setIsAvailabilityModalOpen(true)}
            className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3"
            background={<div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100" />}
            iconColor="text-purple-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta="Gerir Horários"
          />

          {/* Security Settings - Minimal */}
          <BentoCard
            name="Segurança"
            description="Alterar palavra-passe"
            Icon={Lock}
            onClick={() => setIsSecurityOpen(true)}
            className="lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3"
            background={<div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100" />}
            iconColor="text-red-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta="Gerir Segurança"
          />
        </BentoGrid>
      </div>

      {/* Personal Information Modal */}
      <Dialog open={isPersonalInfoOpen} onOpenChange={setIsPersonalInfoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informação Pessoal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {settings.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Alterar Foto
                </Button>
              )}
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="pillar">Pilar</Label>
                <div className="mt-1">
                  <Badge className={`${getPillarBadgeColor(settings.pillar)} flex items-center gap-1 w-fit`}>
                    {getPillarIcon(settings.pillar)}
                    {settings.pillar}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  O pilar não pode ser alterado
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="flex-1">
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
              {isEditing && (
                <Button onClick={() => {
                  handleSaveProfile();
                  setIsEditing(false);
                }} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Alterações
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Financial Information Modal */}
      <Dialog open={isFinancialInfoOpen} onOpenChange={setIsFinancialInfoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Informação Financeira
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="costPerSession">Valor por sessão (MZN)</Label>
              <div className="relative mt-1">
                <Input
                  id="costPerSession"
                  value={settings.costPerSession}
                  disabled
                  className="pl-8"
                />
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Este valor é apenas para visualização e não pode ser alterado
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Informação sobre Pagamentos
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Recebe 75% do valor por sessão</li>
                <li>• 25% é retido como comissão da plataforma</li>
                <li>• Pagamentos são processados mensalmente</li>
                <li>• Consulte a secção "Desempenho" para detalhes financeiros</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Settings Modal */}
      <Dialog open={isSecurityOpen} onOpenChange={setIsSecurityOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="currentPassword">Palavra-passe atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={newPassword.current}
                onChange={(e) => setNewPassword({ ...newPassword, current: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="newPassword">Nova palavra-passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword.new}
                onChange={(e) => setNewPassword({ ...newPassword, new: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar nova palavra-passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={newPassword.confirm}
                onChange={(e) => setNewPassword({ ...newPassword, confirm: e.target.value })}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={() => {
                handleChangePassword();
                setIsSecurityOpen(false);
              }} 
              className="w-full gap-2"
              disabled={!newPassword.current || !newPassword.new || !newPassword.confirm}
            >
              <Lock className="h-4 w-4" />
              Alterar Palavra-passe
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

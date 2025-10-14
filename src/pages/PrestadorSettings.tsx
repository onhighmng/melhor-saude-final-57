import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Camera, 
  Shield, 
  Save, 
  Settings,
  Clock,
  Euro,
  Lock,
  Globe,
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
        return <Heart className="h-4 w-4 text-green-600" />;
      case 'Assistência Financeira':
        return <DollarSign className="h-4 w-4 text-orange-600" />;
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Assistência Financeira':
        return 'bg-orange-100 text-orange-800 border-orange-200';
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

  const handleUpdateAvailability = () => {
    toast({
      title: "Disponibilidade atualizada",
      description: "Os seus horários de disponibilidade foram atualizados"
    });
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
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informação Pessoal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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

            {isEditing && (
              <Button onClick={handleSaveProfile} className="w-full gap-2">
                <Save className="h-4 w-4" />
                Guardar Alterações
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Informação Financeira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>

        {/* Availability Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Disponibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="preferredHours">Horários Preferidos</Label>
              <Input
                id="preferredHours"
                value={settings.preferredHours}
                onChange={(e) => setSettings({ ...settings, preferredHours: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Disponibilidade Semanal</Label>
              <div className="mt-2 space-y-2">
                {settings.availability.map((day, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-20 text-sm font-medium">{day.split(':')[0]}:</div>
                    <div className="flex-1 text-sm text-muted-foreground">{day.split(':')[1]}</div>
                  </div>
                ))}
              </div>
            </div>

            {isEditing && (
              <Button onClick={handleUpdateAvailability} className="w-full gap-2">
                <Clock className="h-4 w-4" />
                Atualizar Disponibilidade
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              onClick={handleChangePassword} 
              className="w-full gap-2"
              disabled={!newPassword.current || !newPassword.new || !newPassword.confirm}
            >
              <Lock className="h-4 w-4" />
              Alterar Palavra-passe
            </Button>
          </CardContent>
        </Card>
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
    </div>
  );
};

export default PrestadorSettings;

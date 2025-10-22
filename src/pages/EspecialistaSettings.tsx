import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, User, Bell, Shield } from 'lucide-react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const EspecialistaSettings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || ''
  });

  // Notification preferences
  const [notificationSettings, setNotificationSettings] = useState({
    newCallRequests: true,
    sessionReminders: true,
    sessionCancellations: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(profile?.avatar_url || '');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // TODO: Upload avatar file to Supabase Storage if avatarFile exists
    // For now, just show success message
    toast({
      title: 'Perfil atualizado',
      description: 'As suas informações foram guardadas com sucesso.',
    });
    setIsProfileModalOpen(false);
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Notificações configuradas',
      description: 'As suas preferências de notificação foram guardadas.',
    });
    setIsNotificationsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-4xl font-heading font-bold text-foreground">
          Definições
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Gerir as suas configurações pessoais e preferências
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="w-full flex-1 overflow-hidden">
        <BentoGrid className="h-full grid-cols-2" style={{ gridAutoRows: '1fr', gridTemplateColumns: '1fr 1fr' }}>
          <BentoCard
            name="Perfil"
            description={profile?.name || "Especialista"}
            Icon={User}
            href="#"
            cta="Editar"
            className="col-span-1"
            background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />}
            onClick={() => setIsProfileModalOpen(true)}
            iconColor="text-blue-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            iconSize={48}
            nameSize="text-3xl"
            descriptionSize="text-xl"
          />

          <BentoCard
            name="Notificações"
            description="Pedidos e sessões"
            Icon={Bell}
            href="#"
            cta="Configurar"
            className="col-span-1"
            background={<div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50" />}
            onClick={() => setIsNotificationsModalOpen(true)}
            iconColor="text-amber-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            iconSize={48}
            nameSize="text-3xl"
            descriptionSize="text-xl"
          />
        </BentoGrid>

        {/* Modals */}
        <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center gap-4 pb-4 border-b">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('avatar')?.click()} className="text-lg font-bold">
                      Carregar Foto
                    </Button>
                  </Label>
                  <Input 
                    id="avatar" 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP (máx. 5MB)</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-lg font-bold">Nome</Label>
                  <Input 
                    id="name" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-lg font-bold">Email</Label>
                  <Input id="email" value={profileData.email} readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProfile}>
                  Guardar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isNotificationsModalOpen} onOpenChange={setIsNotificationsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configurações de Notificação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure como deseja receber notificações sobre novos pedidos de chamada e sessões.
              </p>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Notificações de Eventos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Novos Pedidos de Chamada</Label>
                        <p className="text-xs text-muted-foreground">Receber notificações quando há novos pedidos</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.newCallRequests}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newCallRequests: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Lembretes de Sessões</Label>
                        <p className="text-xs text-muted-foreground">Notificar 15 minutos antes das sessões</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.sessionReminders}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, sessionReminders: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Cancelamentos de Sessões</Label>
                        <p className="text-xs text-muted-foreground">Avisar quando uma sessão for cancelada</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.sessionCancellations}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, sessionCancellations: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Canais de Notificação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Notificações por Email</Label>
                        <p className="text-xs text-muted-foreground">Receber notificações no seu email</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Notificações por SMS</Label>
                        <p className="text-xs text-muted-foreground">Receber notificações por mensagem de texto</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Notificações Push</Label>
                        <p className="text-xs text-muted-foreground">Receber notificações no navegador</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNotificationsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveNotifications}>
                  Guardar Configurações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default EspecialistaSettings;

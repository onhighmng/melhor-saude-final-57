import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { uploadAvatar } from '@/utils/avatarUpload';

const EspecialistaSettings = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  
  // Profile data - update when profile changes
  const [profileData, setProfileData] = useState({
    name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || ''
  });

  // Update profile data when profile context changes
  useEffect(() => {
    if (profile) {
      console.log('[EspecialistaSettings] Loading profile from context:', {
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        metadata: profile.metadata
      });
      
      setProfileData({
        name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || ''
      });
      setAvatarPreview(profile.avatar_url || '');
      
      // Load notification settings from metadata if they exist
      if (profile.metadata && typeof profile.metadata === 'object') {
        const metadata = profile.metadata as any;
        if (metadata.notifications) {
          setNotificationSettings({
            newCallRequests: metadata.notifications.newCallRequests ?? true,
            sessionReminders: metadata.notifications.sessionReminders ?? true,
            sessionCancellations: metadata.notifications.sessionCancellations ?? true,
            emailNotifications: metadata.notifications.emailNotifications ?? true,
            smsNotifications: metadata.notifications.smsNotifications ?? false,
            pushNotifications: metadata.notifications.pushNotifications ?? true,
          });
        }
      }
    }
  }, [profile]);

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

  const handleSaveProfile = async () => {
    if (!profile?.id) {
      toast({
        title: 'Erro',
        description: 'ID de utilizador não encontrado',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('[EspecialistaSettings] Saving profile:', profileData);
      let avatarUrl = profileData.avatar_url;

      // Upload avatar if file selected
      if (avatarFile) {
        console.log('[EspecialistaSettings] Uploading avatar file:', avatarFile.name, avatarFile.type, avatarFile.size);
        const result = await uploadAvatar(profile.id, avatarFile);
        
        console.log('[EspecialistaSettings] Upload result:', result);
        
        if (!result.success) {
          toast({
            title: 'Erro ao fazer upload da foto',
            description: result.error,
            variant: 'destructive',
          });
          return;
        }

        avatarUrl = result.url || avatarUrl;
        console.log('[EspecialistaSettings] Avatar URL after upload:', avatarUrl);
      }

      // Update profile in database
      const updateData = {
        name: profileData.name,
        phone: profileData.phone,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };
      
      console.log('[EspecialistaSettings] Updating database with:', updateData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id)
        .select();

      if (error) {
        console.error('[EspecialistaSettings] Database update error:', error);
        throw error;
      }
      
      console.log('[EspecialistaSettings] Database updated successfully:', data);

      // Clear avatar file after successful upload
      setAvatarFile(null);
      
      // Refresh profile in context to show updated avatar immediately
      await refreshProfile();
      
      toast({
        title: 'Perfil atualizado',
        description: 'As suas informações foram guardadas com sucesso.',
      });

      setIsProfileModalOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível guardar as alterações.';
      console.error('Error saving profile:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      if (!profile?.id) {
        toast({
          title: 'Erro',
          description: 'ID de utilizador não encontrado',
          variant: 'destructive',
        });
        return;
      }

      // Get existing metadata or initialize as empty object
      const existingMetadata = profile.metadata || {};
      
      console.log('[EspecialistaSettings] Saving notification settings:', notificationSettings);
      
      const { error } = await supabase.from('profiles').update({
        metadata: {
          ...existingMetadata,
          notifications: notificationSettings
        },
        updated_at: new Date().toISOString()
      }).eq('id', profile.id);

      if (error) throw error;

      // Refresh profile in context
      await refreshProfile();
      
      toast({
        title: 'Notificações configuradas',
        description: 'As suas preferências de notificação foram guardadas.',
      });
      setIsNotificationsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving notifications:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao guardar preferências',
        variant: 'destructive',
      });
    }
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
            description={profile?.full_name || "Especialista"}
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
                    {(avatarPreview || profile?.avatar_url) ? (
                      <img 
                        src={`${avatarPreview || profile?.avatar_url}?t=${Date.now()}`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        key={`${avatarPreview || profile?.avatar_url}-${Date.now()}`}
                      />
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

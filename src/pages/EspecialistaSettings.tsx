import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    phone: profile?.phone || ''
  });

  const handleSaveProfile = () => {
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input 
                    id="name" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pedidos de Chamada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label className="text-sm">Receber notificações para novos pedidos</Label>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sessões Agendadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label className="text-sm">Notificar 15 minutos antes das sessões</Label>
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

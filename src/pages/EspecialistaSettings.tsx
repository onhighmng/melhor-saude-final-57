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
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  
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
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Definições
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir as suas configurações pessoais e preferências
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="w-full flex-1">
        <BentoGrid className="lg:grid-rows-2 h-full grid-cols-2" style={{ gridAutoRows: '1fr', gridTemplateColumns: '1fr 1fr' }}>
          <BentoCard
            name="Perfil"
            description={profile?.name || "Especialista"}
            Icon={User}
            href="#"
            cta="Editar"
            className="lg:row-start-1 lg:row-end-2 col-span-1"
            background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />}
            onClick={() => setIsProfileModalOpen(true)}
            iconColor="text-blue-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
          />

          <BentoCard
            name="Notificações"
            description="Pedidos e sessões"
            Icon={Bell}
            href="#"
            cta="Configurar"
            className="lg:row-start-1 lg:row-end-2 col-span-1"
            background={<div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50" />}
            onClick={() => setIsNotificationsModalOpen(true)}
            iconColor="text-amber-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
          />

          <BentoCard
            name="Acesso e Permissões"
            description="Função e empresas atribuídas"
            Icon={Shield}
            href="#"
            cta="Ver detalhes"
            className="lg:row-start-2 lg:row-end-3 col-span-2"
            background={<div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50" />}
            onClick={() => setIsAccessModalOpen(true)}
            iconColor="text-emerald-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
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

        <Dialog open={isAccessModalOpen} onOpenChange={setIsAccessModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Acesso e Permissões</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Função</Label>
                <Input value="Especialista Geral" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Empresas Atribuídas</Label>
                <Input value="3 empresas" readOnly />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Permissões</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Gerir pedidos de chamada dos colaboradores</li>
                    <li>• Realizar sessões 1:1 com colaboradores</li>
                    <li>• Ver chats de triagem e pré-diagnóstico</li>
                    <li>• Encaminhar casos para prestadores externos</li>
                    <li>• Adicionar notas internas nos perfis dos utilizadores</li>
                  </ul>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button onClick={() => setIsAccessModalOpen(false)}>
                  Fechar
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User, Bell, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const EspecialistaSettings = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Definições
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir as suas configurações pessoais e preferências
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={profile?.name || ''} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile?.email || ''} readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={profile?.phone || ''} />
            </div>
            <Button>Guardar Alterações</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure como deseja receber notificações sobre novos pedidos de chamada e sessões.
            </p>
            <Button variant="outline">Configurar Notificações</Button>
          </CardContent>
        </Card>

        {/* Access Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Acesso e Permissões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Função</Label>
              <Input value="Especialista Geral" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Empresas Atribuídas</Label>
              <Input value="3 empresas" readOnly />
            </div>
            <p className="text-sm text-muted-foreground">
              Pode gerir pedidos de chamada, sessões e histórico de utilizadores das empresas atribuídas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EspecialistaSettings;

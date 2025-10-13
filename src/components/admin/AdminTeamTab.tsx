import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search, UserPlus, Shield, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'support';
  permissions: {
    users: boolean;
    companies: boolean;
    providers: boolean;
    sessions: boolean;
    reports: boolean;
    settings: boolean;
  };
  lastActive: string;
  status: 'active' | 'inactive';
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@admin.com',
    role: 'super_admin',
    permissions: {
      users: true,
      companies: true,
      providers: true,
      sessions: true,
      reports: true,
      settings: true,
    },
    lastActive: '2024-10-13T10:30:00',
    status: 'active',
  },
  {
    id: '2',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@admin.com',
    role: 'admin',
    permissions: {
      users: true,
      companies: true,
      providers: true,
      sessions: true,
      reports: true,
      settings: false,
    },
    lastActive: '2024-10-13T09:15:00',
    status: 'active',
  },
  {
    id: '3',
    name: 'Rita Costa',
    email: 'rita.costa@admin.com',
    role: 'manager',
    permissions: {
      users: true,
      companies: true,
      providers: false,
      sessions: true,
      reports: true,
      settings: false,
    },
    lastActive: '2024-10-12T18:45:00',
    status: 'active',
  },
  {
    id: '4',
    name: 'João Ferreira',
    email: 'joao.ferreira@admin.com',
    role: 'support',
    permissions: {
      users: true,
      companies: false,
      providers: false,
      sessions: true,
      reports: false,
      settings: false,
    },
    lastActive: '2024-10-10T14:20:00',
    status: 'inactive',
  },
];

const AdminTeamTab = () => {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const getRoleBadge = (role: string) => {
    const variants = {
      super_admin: 'destructive',
      admin: 'default',
      manager: 'secondary',
      support: 'outline',
    };
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Administrador',
      manager: 'Gestor',
      support: 'Suporte',
    };
    return (
      <Badge variant={variants[role as keyof typeof variants] as any}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  const handlePermissionToggle = (permission: keyof TeamMember['permissions']) => {
    if (!selectedMember) return;

    const updatedMember = {
      ...selectedMember,
      permissions: {
        ...selectedMember.permissions,
        [permission]: !selectedMember.permissions[permission],
      },
    };

    setSelectedMember(updatedMember);
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === selectedMember.id ? updatedMember : member
      )
    );
  };

  const handleSavePermissions = () => {
    toast({
      title: 'Permissões Atualizadas',
      description: 'As permissões foram guardadas com sucesso.',
    });
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMembers = teamMembers.filter(m => m.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">Equipa administrativa</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers}</div>
            <p className="text-xs text-muted-foreground">Com acesso ao sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => m.role === 'super_admin').length}
            </div>
            <p className="text-xs text-muted-foreground">Acesso total</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Membros da Equipa</CardTitle>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Membro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Procurar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(member.lastActive).toLocaleString('pt-PT')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMember(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Permissões - {member.name}</DialogTitle>
                          <DialogDescription>
                            Gerencie as permissões de acesso deste membro
                          </DialogDescription>
                        </DialogHeader>
                        {selectedMember && selectedMember.id === member.id && (
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label>Gestão de Utilizadores</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Ver e editar utilizadores
                                  </p>
                                </div>
                                <Switch
                                  checked={selectedMember.permissions.users}
                                  onCheckedChange={() => handlePermissionToggle('users')}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label>Gestão de Empresas</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Ver e editar empresas
                                  </p>
                                </div>
                                <Switch
                                  checked={selectedMember.permissions.companies}
                                  onCheckedChange={() => handlePermissionToggle('companies')}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label>Gestão de Prestadores</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Ver e editar prestadores
                                  </p>
                                </div>
                                <Switch
                                  checked={selectedMember.permissions.providers}
                                  onCheckedChange={() => handlePermissionToggle('providers')}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label>Gestão de Sessões</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Ver e gerir sessões
                                  </p>
                                </div>
                                <Switch
                                  checked={selectedMember.permissions.sessions}
                                  onCheckedChange={() => handlePermissionToggle('sessions')}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label>Relatórios</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Aceder a relatórios e análises
                                  </p>
                                </div>
                                <Switch
                                  checked={selectedMember.permissions.reports}
                                  onCheckedChange={() => handlePermissionToggle('reports')}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label>Configurações do Sistema</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Editar configurações globais
                                  </p>
                                </div>
                                <Switch
                                  checked={selectedMember.permissions.settings}
                                  onCheckedChange={() => handlePermissionToggle('settings')}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setSelectedMember(null)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleSavePermissions}>
                                Guardar Alterações
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTeamTab;

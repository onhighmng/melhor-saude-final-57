import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Download, FileText, Users, Settings, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'view' | 'edit' | 'delete' | 'export' | 'login' | 'logout';
  resource: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failed';
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-10-13T10:45:00',
    user: 'Ana Silva',
    action: 'export',
    resource: 'Relatório Mensal',
    details: 'Exportou relatório de sessões de Outubro',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: '2',
    timestamp: '2024-10-13T10:30:00',
    user: 'Carlos Mendes',
    action: 'edit',
    resource: 'Empresa TechCorp',
    details: 'Alterou limite de sessões de 300 para 400',
    ipAddress: '192.168.1.105',
    status: 'success',
  },
  {
    id: '3',
    timestamp: '2024-10-13T10:15:00',
    user: 'Rita Costa',
    action: 'view',
    resource: 'Utilizador João Silva',
    details: 'Visualizou perfil e histórico de sessões',
    ipAddress: '192.168.1.110',
    status: 'success',
  },
  {
    id: '4',
    timestamp: '2024-10-13T09:50:00',
    user: 'João Ferreira',
    action: 'login',
    resource: 'Sistema',
    details: 'Início de sessão bem sucedido',
    ipAddress: '192.168.1.115',
    status: 'success',
  },
  {
    id: '5',
    timestamp: '2024-10-13T09:30:00',
    user: 'Ana Silva',
    action: 'delete',
    resource: 'Prestador Test User',
    details: 'Removeu prestador de teste',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: '6',
    timestamp: '2024-10-13T09:00:00',
    user: 'Carlos Mendes',
    action: 'edit',
    resource: 'Configurações',
    details: 'Tentativa de alterar configurações do sistema',
    ipAddress: '192.168.1.105',
    status: 'failed',
  },
  {
    id: '7',
    timestamp: '2024-10-13T08:45:00',
    user: 'Rita Costa',
    action: 'export',
    resource: 'Lista de Utilizadores',
    details: 'Exportou CSV com utilizadores ativos',
    ipAddress: '192.168.1.110',
    status: 'success',
  },
  {
    id: '8',
    timestamp: '2024-10-13T08:30:00',
    user: 'Ana Silva',
    action: 'view',
    resource: 'Dashboard',
    details: 'Acedeu ao dashboard administrativo',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
];

const AdminLogsTab = () => {
  const { t } = useTranslation('admin');
  const [logs] = useState(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getActionBadge = (action: string) => {
    const variants = {
      view: 'default',
      edit: 'secondary',
      delete: 'destructive',
      export: 'outline',
      login: 'default',
      logout: 'secondary',
    };
    const labels = {
      view: 'Visualização',
      edit: 'Edição',
      delete: 'Eliminação',
      export: 'Exportação',
      login: 'Login',
      logout: 'Logout',
    };
    return (
      <Badge variant={variants[action as keyof typeof variants] as any}>
        {labels[action as keyof typeof labels]}
      </Badge>
    );
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return <FileText className="h-4 w-4" />;
      case 'edit':
        return <Settings className="h-4 w-4" />;
      case 'delete':
        return <Database className="h-4 w-4" />;
      case 'export':
        return <Download className="h-4 w-4" />;
      case 'login':
      case 'logout':
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesAction && matchesStatus;
  });

  const totalActions = logs.length;
  const failedActions = logs.filter(l => l.status === 'failed').length;
  const todayActions = logs.filter(l => 
    new Date(l.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActions}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Hoje</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayActions}</div>
            <p className="text-xs text-muted-foreground">Atividade do dia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Falhadas</CardTitle>
            <Settings className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedActions}</div>
            <p className="text-xs text-muted-foreground">Sem autorização</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registo de Ações</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Procurar por utilizador, recurso ou detalhes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo de Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="view">Visualização</SelectItem>
                <SelectItem value="edit">Edição</SelectItem>
                <SelectItem value="delete">Eliminação</SelectItem>
                <SelectItem value="export">Exportação</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failed">Falhado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Utilizador</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('pt-PT')}
                    </TableCell>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell className="max-w-md">
                      <span className="text-sm text-muted-foreground">{log.details}</span>
                    </TableCell>
                    <TableCell className="text-sm font-mono">{log.ipAddress}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status === 'success' ? 'Sucesso' : 'Falhado'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogsTab;

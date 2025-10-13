import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Bell, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  type: 'inactive_user' | 'goal_achieved' | 'quota_low' | 'payment_failed' | 'system_error';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  resolved: boolean;
  user?: string;
  company?: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'inactive_user',
    title: 'Utilizador Inativo',
    description: 'João Silva não acede à plataforma há 30 dias',
    severity: 'medium',
    timestamp: '2024-10-10T14:30:00',
    resolved: false,
    user: 'João Silva',
    company: 'TechCorp',
  },
  {
    id: '2',
    type: 'goal_achieved',
    title: 'Meta Atingida',
    description: 'Maria Santos completou 100% dos objetivos mensais',
    severity: 'low',
    timestamp: '2024-10-12T09:15:00',
    resolved: false,
    user: 'Maria Santos',
    company: 'InnovaSolutions',
  },
  {
    id: '3',
    type: 'quota_low',
    title: 'Quota Baixa',
    description: 'GlobalFinance tem apenas 10% das sessões disponíveis',
    severity: 'high',
    timestamp: '2024-10-13T08:00:00',
    resolved: false,
    company: 'GlobalFinance',
  },
  {
    id: '4',
    type: 'payment_failed',
    title: 'Pagamento Falhado',
    description: 'Pagamento de StartupHub foi recusado',
    severity: 'high',
    timestamp: '2024-10-11T16:45:00',
    resolved: false,
    company: 'StartupHub',
  },
  {
    id: '5',
    type: 'goal_achieved',
    title: 'Meta Atingida',
    description: 'Pedro Costa completou 100% dos objetivos trimestrais',
    severity: 'low',
    timestamp: '2024-10-09T11:20:00',
    resolved: true,
    user: 'Pedro Costa',
  },
];

const AdminAlertsTab = () => {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const [alerts, setAlerts] = useState(mockAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'inactive_user':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'goal_achieved':
        return <Bell className="h-5 w-5 text-green-500" />;
      case 'quota_low':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'payment_failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'system_error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      high: 'destructive',
      medium: 'secondary',
      low: 'default',
    };
    const labels = {
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa',
    };
    return (
      <Badge variant={variants[severity as keyof typeof variants] as any}>
        {labels[severity as keyof typeof labels]}
      </Badge>
    );
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
    toast({
      title: 'Alerta Resolvido',
      description: 'O alerta foi marcado como resolvido.',
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'resolved' && alert.resolved) ||
      (statusFilter === 'pending' && !alert.resolved);

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const pendingCount = alerts.filter(a => !a.resolved).length;
  const highSeverityCount = alerts.filter(a => a.severity === 'high' && !a.resolved).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">Todos os alertas do sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Aguardam resolução</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prioridade Alta</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highSeverityCount}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção imediata</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Procurar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{alert.title}</h3>
                      {getSeverityBadge(alert.severity)}
                      {alert.resolved && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Resolvido
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{new Date(alert.timestamp).toLocaleString('pt-PT')}</span>
                      {alert.user && <span>• Utilizador: {alert.user}</span>}
                      {alert.company && <span>• Empresa: {alert.company}</span>}
                    </div>
                  </div>
                </div>
                {!alert.resolved && (
                  <Button size="sm" onClick={() => handleResolve(alert.id)}>
                    Resolver
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Nenhum alerta encontrado com os filtros selecionados
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminAlertsTab;

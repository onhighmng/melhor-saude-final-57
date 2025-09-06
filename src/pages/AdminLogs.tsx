import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar as CalendarIcon,
  Download,
  Search,
  Eye,
  Edit,
  LogIn,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Monitor,
  MapPin
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  actionType: "view" | "export" | "modify" | "login" | "delete";
  resource: "PHI" | "session" | "user" | "company" | "system";
  resourceDetails: string;
  justification?: string;
  result: "success" | "error" | "warning";
  tenant: string;
  ipAddress: string;
  userAgent: string;
  sessionDuration?: number;
}

const mockLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2024-01-24 12:56:00",
    user: { name: "Alice Brown", email: "alice@healthcorp.com", avatar: "/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png" },
    action: "Exportou relatório de utilizadores",
    actionType: "export",
    resource: "PHI",
    resourceDetails: "Relatório mensal - 45 registos de utilizadores",
    justification: "Relatório mensal obrigatório para compliance",
    result: "success",
    tenant: "HealthCorp",
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    sessionDuration: 180
  },
  {
    id: "2", 
    timestamp: "2024-01-20 09:12:00",
    user: { name: "John Doe", email: "john@techmed.com", avatar: "/lovable-uploads/085a608e-3a3e-45e5-898b-2f9b4c0f7f67.png" },
    action: "Acedeu a detalhes da sessão #1247",
    actionType: "view",
    resource: "session",
    resourceDetails: "Sessão entre Maria Santos e Dr. Pedro Costa",
    justification: "Revisão semanal de qualidade do serviço",
    result: "success",
    tenant: "TechMed",
    ipAddress: "10.0.0.23",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
    sessionDuration: 300
  },
  {
    id: "3",
    timestamp: "2024-01-15 15:33:00", 
    user: { name: "David Smith", email: "david@wellness.co", avatar: "/lovable-uploads/0daa1ba3-5b7c-49db-950f-22ccfee40b86.png" },
    action: "Visualizou perfil do utilizador",
    actionType: "view",
    resource: "PHI",
    resourceDetails: "Perfil completo de Carlos Ferreira #USER-789",
    justification: "Pedido do utilizador para verificação de dados",
    result: "success",
    tenant: "Wellness Co",
    ipAddress: "203.0.113.12",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    sessionDuration: 120
  },
  {
    id: "4",
    timestamp: "2024-01-15 11:44:00",
    user: { name: "Alice Brown", email: "alice@healthcorp.com", avatar: "/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png" },
    action: "Modificou dados de cliente #389",
    actionType: "modify",
    resource: "PHI", 
    resourceDetails: "Atualizou informações de contacto do utilizador",
    justification: "Correção de dados pessoais a pedido do utilizador",
    result: "success",
    tenant: "HealthCorp",
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    sessionDuration: 90
  },
  {
    id: "5",
    timestamp: "2024-01-20 03:31:00",
    user: { name: "John Doe", email: "john@techmed.com", avatar: "/lovable-uploads/085a608e-3a3e-45e5-898b-2f9b4c0f7f67.png" },
    action: "Adicionou novo utilizador",
    actionType: "modify",
    resource: "user",
    resourceDetails: "Criou conta para Ana Lima - Law Firm",
    justification: "Novo colaborador admitido na empresa cliente",
    result: "success",
    tenant: "TechMed",
    ipAddress: "10.0.0.23",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15"
  },
  {
    id: "6",
    timestamp: "2024-01-15 03:14:00",
    user: { name: "Emma Wilson", email: "emma@mindcare.org", avatar: "/lovable-uploads/18286dba-299d-452d-b21d-2860965d5785.png" },
    action: "Falha no login do sistema",
    actionType: "login",
    resource: "system",
    resourceDetails: "Tentativa de acesso com credenciais inválidas",
    result: "error",
    tenant: "MindCare",
    ipAddress: "198.51.100.42",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"
  },
  {
    id: "7",
    timestamp: "2024-01-31 11:58:00",
    user: { name: "Michael Lee", email: "michael@lawfirm.com", avatar: "/lovable-uploads/2315135f-f033-4434-be6f-1ad3824c1ebb.png" },
    action: "Exportou dados de feedback",
    actionType: "export",
    resource: "PHI",
    resourceDetails: "Relatório de feedback dos últimos 3 meses",
    justification: "Análise de satisfação trimestral",
    result: "success",
    tenant: "Law Firm",
    ipAddress: "172.16.0.88",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    sessionDuration: 240
  }
];

const actionIcons = {
  view: Eye,
  export: Download,
  modify: Edit,
  login: LogIn,
  delete: XCircle
};

const resourceColors = {
  PHI: "bg-red-100 text-red-800 border-red-200",
  session: "bg-blue-100 text-blue-800 border-blue-200", 
  user: "bg-green-100 text-green-800 border-green-200",
  company: "bg-purple-100 text-purple-800 border-purple-200",
  system: "bg-gray-100 text-gray-800 border-gray-200"
};

const resultColors = {
  success: "bg-green-100 text-green-800 border-green-200",
  error: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200"
};

const resultIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle
};

const AdminLogs = () => {
  const [logs] = useState(mockLogs);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [tenantFilter, setTenantFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const { toast } = useToast();

  // Calculate metrics
  const totalLogs = logs.length;
  const phiAccesses = logs.filter(log => log.resource === "PHI").length;
  const exports = logs.filter(log => log.actionType === "export").length;
  const justificationRate = Math.round((logs.filter(log => log.justification).length / totalLogs) * 100);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (tenantFilter !== "all" && log.tenant.toLowerCase() !== tenantFilter.toLowerCase()) return false;
    if (actionFilter !== "all" && log.actionType !== actionFilter) return false;
    if (userFilter && !log.user.name.toLowerCase().includes(userFilter.toLowerCase()) && 
        !log.user.email.toLowerCase().includes(userFilter.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    // In a real app, this would trigger PHI-safe CSV/PDF export
    console.log("Exporting audit logs...");
    
    toast({
      title: "Exportação iniciada",
      description: "Os logs serão exportados em formato PHI-safe.",
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Logs & Auditoria
            </h1>
            <p className="text-muted-foreground">
              Painel de compliance e rastreamento de acessos PHI/GDPR
            </p>
          </div>
          
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Logs
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalLogs}</div>
              <p className="text-xs text-muted-foreground">
                No período selecionado
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Acessos PHI
              </CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{phiAccesses}</div>
              <p className="text-xs text-muted-foreground">
                Dados pessoais acedidos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Exportações
              </CardTitle>
              <Download className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{exports}</div>
              <p className="text-xs text-muted-foreground">
                Relatórios exportados
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Com Justificação
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{justificationRate}%</div>
              <p className="text-xs text-muted-foreground">
                Logs justificados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-48">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar utilizador..."
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={tenantFilter} onValueChange={setTenantFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Tenant/Empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Empresas</SelectItem>
                  <SelectItem value="healthcorp">HealthCorp</SelectItem>
                  <SelectItem value="techmed">TechMed</SelectItem>
                  <SelectItem value="wellness co">Wellness Co</SelectItem>
                  <SelectItem value="mindcare">MindCare</SelectItem>
                  <SelectItem value="law firm">Law Firm</SelectItem>
                </SelectContent>
              </Select>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo de Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Ações</SelectItem>
                  <SelectItem value="view">Visualização</SelectItem>
                  <SelectItem value="export">Exportação</SelectItem>
                  <SelectItem value="modify">Modificação</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="delete">Eliminação</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Data início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "dd/MM/yyyy") : "Data fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Registos de Auditoria ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum log encontrado para este filtro
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros para ver resultados diferentes.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setTenantFilter("all");
                    setActionFilter("all");
                    setUserFilter("");
                    setDateFrom(undefined);
                    setDateTo(undefined);
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Timestamp</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Utilizador</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Ação</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Recurso</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Justificação</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Resultado</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      const ActionIcon = actionIcons[log.actionType];
                      const ResultIcon = resultIcons[log.result];
                      
                      return (
                        <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-4">
                            <span className="text-sm font-mono text-foreground">{log.timestamp}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={log.user.avatar} alt={log.user.name} />
                                <AvatarFallback>{log.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium text-foreground text-sm">{log.user.name}</span>
                                <div className="text-xs text-muted-foreground">{log.user.email}</div>
                                <div className="text-xs text-muted-foreground">{log.tenant}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <ActionIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{log.action}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={`text-xs ${resourceColors[log.resource]}`}>
                              {log.resource}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1 max-w-48 truncate">
                              {log.resourceDetails}
                            </div>
                          </td>
                          <td className="p-4">
                            {log.justification ? (
                              <div className="text-xs text-foreground max-w-48 truncate" title={log.justification}>
                                {log.justification}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={`text-xs flex items-center gap-1 w-fit ${resultColors[log.result]}`}>
                              <ResultIcon className="h-3 w-3" />
                              {log.result === 'success' ? 'Sucesso' : log.result === 'error' ? 'Erro' : 'Aviso'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedLog(log)}
                                  className="h-8 px-3"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
                                  <DialogDescription>
                                    Informação completa sobre esta ação de auditoria
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedLog && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Informações Básicas</h4>
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Timestamp:</span>
                                            <span className="text-sm font-mono">{selectedLog.timestamp}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Duração:</span>
                                            <span className="text-sm">{formatDuration(selectedLog.sessionDuration)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Origem do Acesso</h4>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm font-mono">{selectedLog.ipAddress}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Monitor className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground truncate" title={selectedLog.userAgent}>
                                              {selectedLog.userAgent.split(' ')[0]}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Ação Realizada</h4>
                                      <div className="p-3 bg-muted/50 rounded-lg">
                                        <p className="text-sm font-medium mb-1">{selectedLog.action}</p>
                                        <p className="text-sm text-muted-foreground">{selectedLog.resourceDetails}</p>
                                      </div>
                                    </div>

                                    {selectedLog.justification && (
                                      <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Justificação</h4>
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                          <p className="text-sm">{selectedLog.justification}</p>
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${resourceColors[selectedLog.resource].includes('red') ? 'bg-red-600' : resourceColors[selectedLog.resource].includes('blue') ? 'bg-blue-600' : resourceColors[selectedLog.resource].includes('green') ? 'bg-green-600' : resourceColors[selectedLog.resource].includes('purple') ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
                                        <span className="text-sm">Recurso: {selectedLog.resource}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${selectedLog.result === 'success' ? 'bg-green-600' : selectedLog.result === 'error' ? 'bg-red-600' : 'bg-yellow-600'}`}></div>
                                        <span className="text-sm">
                                          Resultado: {selectedLog.result === 'success' ? 'Sucesso' : selectedLog.result === 'error' ? 'Erro' : 'Aviso'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogs;
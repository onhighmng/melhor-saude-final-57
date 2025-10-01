import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar as CalendarIcon, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Eye,
  Download,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface Session {
  id: string;
  user: {
    name: string;
    avatar?: string;
    company: string;
  };
  provider: {
    name: string;
    avatar?: string;
  };
  pillar: "Saúde Mental" | "Bem-estar Físico" | "Assistência Financeira" | "Assistência Jurídica";
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  deduction: "company" | "personal";
  refundApplied: boolean;
  datetime: string;
  auditTrail: {
    bookedBy: string;
    bookedAt: string;
    cancelledBy?: string;
    cancelledAt?: string;
    policies: string[];
    actions: Array<{
      action: string;
      by: string;
      at: string;
    }>;
  };
}

const mockSessions: Session[] = [
  {
    id: "1",
    user: { name: "João Silva", company: "Tech Corp", avatar: "/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png" },
    provider: { name: "Dr. Ana Costa", avatar: "/lovable-uploads/085a608e-3a3e-45e5-898b-2f9b4c0f7f67.png" },
    pillar: "Saúde Mental",
    status: "completed",
    deduction: "company",
    refundApplied: false,
    datetime: "2024-01-15 14:00",
    auditTrail: {
      bookedBy: "João Silva",
      bookedAt: "2024-01-10 10:30",
      policies: ["Dedução automática empresa", "Política de cancelamento 24h"],
      actions: [
        { action: "Sessão marcada", by: "João Silva", at: "2024-01-10 10:30" },
        { action: "Sessão concluída", by: "Sistema", at: "2024-01-15 14:50" },
        { action: "Dedução aplicada", by: "Sistema", at: "2024-01-15 15:00" }
      ]
    }
  },
  {
    id: "2",
    user: { name: "Maria Santos", company: "Health Inc", avatar: "/lovable-uploads/0daa1ba3-5b7c-49db-950f-22ccfee40b86.png" },
    provider: { name: "Dr. Pedro Lopes", avatar: "/lovable-uploads/18286dba-299d-452d-b21d-2860965d5785.png" },
    pillar: "Bem-estar Físico",
    status: "no_show",
    deduction: "personal",
    refundApplied: true,
    datetime: "2024-01-16 09:00",
    auditTrail: {
      bookedBy: "Maria Santos",
      bookedAt: "2024-01-12 16:45",
      policies: ["Falta sem aviso - dedução pessoal", "Reembolso aplicado por exceção"],
      actions: [
        { action: "Sessão marcada", by: "Maria Santos", at: "2024-01-12 16:45" },
        { action: "Falta registada", by: "Dr. Pedro Lopes", at: "2024-01-16 09:15" },
        { action: "Dedução pessoal aplicada", by: "Sistema", at: "2024-01-16 09:16" },
        { action: "Reembolso manual", by: "Admin User", at: "2024-01-16 15:30" }
      ]
    }
  },
  {
    id: "3",
    user: { name: "Carlos Ferreira", company: "Wellness Co", avatar: "/lovable-uploads/2315135f-f033-4434-be6f-1ad3824c1ebb.png" },
    provider: { name: "Dr. Sofia Rodrigues", avatar: "/lovable-uploads/5098d52a-638c-4f18-8bf0-36058ff94187.png" },
    pillar: "Assistência Financeira",
    status: "cancelled",
    deduction: "company",
    refundApplied: false,
    datetime: "2024-01-17 11:30",
    auditTrail: {
      bookedBy: "Carlos Ferreira",
      bookedAt: "2024-01-14 14:20",
      cancelledBy: "Carlos Ferreira",
      cancelledAt: "2024-01-16 18:00",
      policies: ["Cancelamento com mais de 24h - sem dedução"],
      actions: [
        { action: "Sessão marcada", by: "Carlos Ferreira", at: "2024-01-14 14:20" },
        { action: "Sessão cancelada", by: "Carlos Ferreira", at: "2024-01-16 18:00" },
        { action: "Política aplicada - sem dedução", by: "Sistema", at: "2024-01-16 18:01" }
      ]
    }
  },
  {
    id: "4",
    user: { name: "Ana Lima", company: "Law Firm", avatar: "/lovable-uploads/537ae6d8-8bad-4984-87ef-5165033fdc1c.png" },
    provider: { name: "Dr. Miguel Santos", avatar: "/lovable-uploads/5d2071d4-8909-4e5f-b30d-cf52091ffba9.png" },
    pillar: "Assistência Jurídica",
    status: "scheduled",
    deduction: "company",
    refundApplied: false,
    datetime: "2024-01-20 15:00",
    auditTrail: {
      bookedBy: "Ana Lima",
      bookedAt: "2024-01-18 11:15",
      policies: ["Sessão agendada - aguarda conclusão"],
      actions: [
        { action: "Sessão marcada", by: "Ana Lima", at: "2024-01-18 11:15" }
      ]
    }
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-800 border-green-200";
    case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
    case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
    case "no_show": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle className="h-3 w-3" />;
    case "scheduled": return <Clock className="h-3 w-3" />;
    case "cancelled": return <XCircle className="h-3 w-3" />;
    case "no_show": return <AlertCircle className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed": return "Concluída";
    case "scheduled": return "Agendada";
    case "cancelled": return "Cancelada";
    case "no_show": return "Falta";
    default: return status;
  }
};

const getPillarColor = (pillar: string) => {
  switch (pillar) {
    case "Saúde Mental": return "bg-blue-100 text-blue-800 border-blue-200";
    case "Bem-estar Físico": return "bg-green-100 text-green-800 border-green-200";
    case "Assistência Financeira": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Assistência Jurídica": return "bg-purple-100 text-purple-800 border-purple-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const AdminSessions = () => {
  const { toast } = useToast();
  const [sessions] = useState(mockSessions);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pillarFilter, setPillarFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Calculate metrics
  const totalSessions = sessions.length;
  const correctlyDeducted = Math.round((sessions.filter(s => s.deduction === "company").length / totalSessions) * 100);
  const refunded = Math.round((sessions.filter(s => s.refundApplied).length / totalSessions) * 100);
  const anomalies = Math.round((sessions.filter(s => s.status === "no_show" && !s.refundApplied).length / totalSessions) * 100);

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (statusFilter !== "all" && session.status !== statusFilter) return false;
    if (pillarFilter !== "all" && session.pillar !== pillarFilter) return false;
    if (companyFilter !== "all" && session.user.company.toLowerCase() !== companyFilter.toLowerCase()) return false;
    if (searchTerm && !session.user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !session.provider.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    const csvData = filteredSessions.map(session => ({
      ID: session.id,
      Utilizador: session.user.name,
      Empresa: session.user.company,
      Prestador: session.provider.name,
      Pilar: session.pillar,
      Estado: getStatusText(session.status),
      Dedução: session.deduction === 'company' ? 'Empresa' : 'Pessoal',
      Reembolso: session.refundApplied ? 'Sim' : 'Não',
      'Data/Hora': session.datetime
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sessoes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Exportação concluída",
      description: "Dados das sessões exportados com sucesso.",
    });
  };

  const handleCorrectDeduction = (sessionId: string) => {
    setSelectedSession(prev => {
      if (!prev || prev.id !== sessionId) return prev;
      
      const correctedSession = {
        ...prev,
        deduction: prev.deduction === 'company' ? 'personal' as const : 'company' as const,
        auditTrail: {
          ...prev.auditTrail,
          actions: [
            ...prev.auditTrail.actions,
            {
              action: 'Dedução corrigida manualmente',
              by: 'Admin',
              at: new Date().toLocaleString('pt-PT')
            }
          ]
        }
      };
      
      return correctedSession;
    });

    toast({
      title: "Dedução corrigida",
      description: "O tipo de dedução foi alterado com sucesso.",
    });
  };

  const handleApplyRefund = (sessionId: string) => {
    setSelectedSession(prev => {
      if (!prev || prev.id !== sessionId) return prev;
      
      const refundedSession = {
        ...prev,
        refundApplied: true,
        auditTrail: {
          ...prev.auditTrail,
          actions: [
            ...prev.auditTrail.actions,
            {
              action: 'Reembolso aplicado manualmente',
              by: 'Admin',
              at: new Date().toLocaleString('pt-PT')
            }
          ]
        }
      };
      
      return refundedSession;
    });

    toast({
      title: "Reembolso aplicado",
      description: "O reembolso foi aplicado à sessão com sucesso.",
    });
  };

  const handleMarkException = (sessionId: string) => {
    setSelectedSession(prev => {
      if (!prev || prev.id !== sessionId) return prev;
      
      const exceptionSession = {
        ...prev,
        auditTrail: {
          ...prev.auditTrail,
          policies: [...prev.auditTrail.policies, 'Marcado como exceção - requer revisão'],
          actions: [
            ...prev.auditTrail.actions,
            {
              action: 'Marcado como exceção',
              by: 'Admin',
              at: new Date().toLocaleString('pt-PT')
            }
          ]
        }
      };
      
      return exceptionSession;
    });

    toast({
      title: "Exceção marcada",
      description: "A sessão foi marcada como exceção para revisão.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gestão de Sessões
          </h1>
          <p className="text-muted-foreground">
            Auditoria e gestão de todas as sessões da plataforma
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sessões Totais
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deduzidas Corretamente
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{correctlyDeducted}%</div>
              <p className="text-xs text-muted-foreground">
                Política aplicada
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reembolsadas
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{refunded}%</div>
              <p className="text-xs text-muted-foreground">
                Reembolso aplicado
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Anomalias
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{anomalies}%</div>
              <p className="text-xs text-muted-foreground">
                Falta sem política
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-48">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar utilizador ou prestador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Estados</SelectItem>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="no_show">Falta</SelectItem>
                </SelectContent>
              </Select>

              <Select value={pillarFilter} onValueChange={setPillarFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Pilar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Pilares</SelectItem>
                  <SelectItem value="Saúde Mental">Saúde Mental</SelectItem>
                  <SelectItem value="Bem-estar Físico">Bem-estar Físico</SelectItem>
                  <SelectItem value="Assistência Financeira">Assistência Financeira</SelectItem>
                  <SelectItem value="Assistência Jurídica">Assistência Jurídica</SelectItem>
                </SelectContent>
              </Select>

              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Empresas</SelectItem>
                  <SelectItem value="tech corp">Tech Corp</SelectItem>
                  <SelectItem value="health inc">Health Inc</SelectItem>
                  <SelectItem value="wellness co">Wellness Co</SelectItem>
                  <SelectItem value="law firm">Law Firm</SelectItem>
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

              <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Sessões ({filteredSessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhuma sessão encontrada neste filtro
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros para ver resultados diferentes.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Utilizador</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Prestador</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Pilar</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Estado</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Dedução</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Reembolso</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Data/Hora</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session) => (
                      <tr key={session.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={session.user.avatar} alt={session.user.name} />
                              <AvatarFallback>{session.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-foreground">{session.user.name}</span>
                              <div className="text-xs text-muted-foreground">{session.user.company}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={session.provider.avatar} alt={session.provider.name} />
                              <AvatarFallback>{session.provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{session.provider.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`text-xs ${getPillarColor(session.pillar)}`}>
                            {session.pillar}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`text-xs flex items-center gap-1 w-fit ${getStatusColor(session.status)}`}>
                            {getStatusIcon(session.status)}
                            {getStatusText(session.status)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm ${session.deduction === 'company' ? 'text-green-700' : 'text-orange-700'}`}>
                            {session.deduction === 'company' ? 'Empresa' : 'Pessoal'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm ${session.refundApplied ? 'text-green-700' : 'text-gray-600'}`}>
                            {session.refundApplied ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-foreground">{session.datetime}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedSession(session)}
                                  className="h-8 px-3"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Auditoria da Sessão</DialogTitle>
                                  <DialogDescription>
                                    Histórico completo de ações para a sessão entre {selectedSession?.user.name} e {selectedSession?.provider.name}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedSession && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Quem Marcou</h4>
                                        <p className="text-sm">{selectedSession.auditTrail.bookedBy}</p>
                                        <p className="text-xs text-muted-foreground">{selectedSession.auditTrail.bookedAt}</p>
                                      </div>
                                      {selectedSession.auditTrail.cancelledBy && (
                                        <div>
                                          <h4 className="font-medium text-sm text-muted-foreground mb-2">Quem Cancelou</h4>
                                          <p className="text-sm">{selectedSession.auditTrail.cancelledBy}</p>
                                          <p className="text-xs text-muted-foreground">{selectedSession.auditTrail.cancelledAt}</p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Políticas Aplicadas</h4>
                                      <div className="space-y-1">
                                        {selectedSession.auditTrail.policies.map((policy, index) => (
                                          <Badge key={index} variant="secondary" className="text-xs">
                                            {policy}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Histórico de Ações</h4>
                                      <div className="space-y-3">
                                        {selectedSession.auditTrail.actions.map((action, index) => (
                                          <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                                            <div className="flex-1">
                                              <p className="text-sm font-medium">{action.action}</p>
                                              <p className="text-xs text-muted-foreground">Por: {action.by}</p>
                                              <p className="text-xs text-muted-foreground">{action.at}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t border-border">
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleCorrectDeduction(selectedSession.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                      >
                                        Corrigir Dedução
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleApplyRefund(selectedSession.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        Aplicar Reembolso
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleMarkException(selectedSession.id)}
                                        variant="outline"
                                      >
                                        Marcar Exceção
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    ))}
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

export default AdminSessions;
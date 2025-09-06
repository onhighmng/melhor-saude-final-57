import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, AlertTriangle, Users, CheckCircle, XCircle, Globe, Lock, Plus, Download, Trash2, Settings, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FullscreenModal from "@/components/admin/FullscreenModal";

interface Session {
  id: string;
  provider: string;
  company: string;
  pillar: "Saúde Mental" | "Bem-estar Físico" | "Assistência Financeira" | "Assistência Jurídica";
  user: string;
  time: string;
  duration: number;
  status: "normal" | "conflict" | "timezone" | "blocked";
  date: string;
}

interface Conflict {
  id: string;
  type: "overlap" | "timezone" | "capacity";
  sessions: string[];
  description: string;
  severity: "high" | "medium" | "low";
}

const mockSessions: Session[] = [
  { id: "1", provider: "Henry", company: "Tech Corp", pillar: "Saúde Mental", user: "João Silva", time: "09:00", duration: 50, status: "normal", date: "2024-01-02" },
  { id: "2", provider: "Emin", company: "Health Inc", pillar: "Saúde Mental", user: "Maria Santos", time: "19:78", duration: 50, status: "conflict", date: "2024-01-02" },
  { id: "3", provider: "Asalym", company: "Wellness Co", pillar: "Assistência Jurídica", user: "Pedro Costa", time: "15:00", duration: 50, status: "normal", date: "2024-01-03" },
  { id: "4", provider: "Tricici", company: "Mind Spa", pillar: "Bem-estar Físico", user: "Ana Lima", time: "08:00", duration: 50, status: "normal", date: "2024-01-08" },
  { id: "5", provider: "Financial Assistant", company: "Wealth Co", pillar: "Assistência Financeira", user: "Carlos Ferreira", time: "22:00", duration: 50, status: "normal", date: "2024-01-11" },
  { id: "6", provider: "Flexibles Vacuum", company: "Tech Corp", pillar: "Saúde Mental", user: "Sofia Rodrigues", time: "14:00", duration: 50, status: "normal", date: "2024-01-16" },
  { id: "7", provider: "Legal Assistant", company: "Law Firm", pillar: "Assistência Jurídica", user: "Miguel Santos", time: "04:00", duration: 50, status: "timezone", date: "2024-01-18" },
  { id: "8", provider: "Mental Health Pro", company: "Wellness Co", pillar: "Saúde Mental", user: "Isabel Costa", time: "16:00", duration: 50, status: "normal", date: "2024-01-15" },
  { id: "9", provider: "Legal Assistant", company: "Law Firm", pillar: "Assistência Jurídica", user: "Roberto Lima", time: "15:00", duration: 50, status: "normal", date: "2024-01-19" }
];

const mockConflicts: Conflict[] = [
  { id: "1", type: "overlap", sessions: ["1", "2"], description: "Sobreposição de horário: Emin tem 2 sessões ao mesmo tempo", severity: "high" },
  { id: "2", type: "timezone", sessions: ["7"], description: "Fuso horário divergente: Legal Assistant - 4am pode não ser adequado", severity: "medium" },
  { id: "3", type: "capacity", sessions: ["5", "6"], description: "Prestador próximo da capacidade máxima", severity: "low" }
];

const getPillarColor = (pillar: string, status: string) => {
  const baseColors = {
    "Saúde Mental": "bg-blue-500",
    "Bem-estar Físico": "bg-green-500", 
    "Assistência Financeira": "bg-yellow-500",
    "Assistência Jurídica": "bg-purple-500"
  };

  if (status === "conflict") return "bg-red-500";
  if (status === "timezone") return "bg-orange-500";
  if (status === "blocked") return "bg-gray-500";
  
  return baseColors[pillar as keyof typeof baseColors] || "bg-gray-500";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "normal": return <CheckCircle className="h-3 w-3 text-green-600" />;
    case "conflict": return <AlertTriangle className="h-3 w-3 text-red-600" />;
    case "timezone": return <Globe className="h-3 w-3 text-orange-600" />;
    case "blocked": return <Lock className="h-3 w-3 text-gray-600" />;
    default: return <CheckCircle className="h-3 w-3 text-green-600" />;
  }
};

const AdminScheduling = () => {
  const [currentView, setCurrentView] = useState<"month" | "week" | "day">("month");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedConflicts, setSelectedConflicts] = useState<string[]>([]);
  const [massActionReason, setMassActionReason] = useState("");
  const [actionsModalOpen, setActionsModalOpen] = useState(false);
  const [conflictsModalOpen, setConflictsModalOpen] = useState(false);
  const [legendModalOpen, setLegendModalOpen] = useState(false);

  const totalSessions = mockSessions.length;
  const cancellations = mockSessions.filter(s => s.status === "conflict").length;
  const reassigned = mockSessions.filter(s => s.status === "timezone").length;

  const filteredSessions = mockSessions.filter(session => {
    if (selectedProvider !== "all" && !session.provider.toLowerCase().includes(selectedProvider.toLowerCase())) return false;
    if (selectedCompany !== "all" && !session.company.toLowerCase().includes(selectedCompany.toLowerCase())) return false;
    return true;
  });

  const handleMassCancellation = () => {
    console.log("Mass cancellation:", selectedConflicts, massActionReason);
    setSelectedConflicts([]);
    setMassActionReason("");
  };

  const handleReassignSessions = () => {
    console.log("Reassigning sessions:", selectedConflicts);
    setSelectedConflicts([]);
  };

  const generateCalendarDays = () => {
    const days = [];
    const startDate = 1;
    const daysInMonth = 31;
    
    for (let day = startDate; day <= daysInMonth; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const dateStr = `2024-01-${dayStr}`;
      const daySessions = filteredSessions.filter(s => s.date === dateStr);
      
      days.push({ day, dateStr, sessions: daySessions });
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Calendário da Plataforma
            </h1>
            <p className="text-muted-foreground">
              Gerir todas as sessões, detectar conflitos e aplicar regras globais
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prestador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Prestadores</SelectItem>
                <SelectItem value="henry">Henry</SelectItem>
                <SelectItem value="emin">Emin</SelectItem>
                <SelectItem value="asalym">Asalym</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Empresas</SelectItem>
                <SelectItem value="tech">Tech Corp</SelectItem>
                <SelectItem value="health">Health Inc</SelectItem>
                <SelectItem value="wellness">Wellness Co</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalSessions}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cancellations</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{cancellations}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reassigned</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{reassigned}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Calendar Main View */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Janeiro 2024</CardTitle>
                  <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
                    <TabsList>
                      <TabsTrigger value="month">Mês</TabsTrigger>
                      <TabsTrigger value="week">Semana</TabsTrigger>
                      <TabsTrigger value="day">Dia</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map(({ day, sessions }) => (
                    <div key={day} className="min-h-24 p-1 border border-border rounded-lg hover:bg-muted/50">
                      <div className="text-sm font-medium mb-1">{day}</div>
                      <div className="space-y-1">
                        {sessions.slice(0, 3).map((session) => (
                          <div
                            key={session.id}
                            className={`text-xs p-1 rounded text-white truncate cursor-pointer ${getPillarColor(session.pillar, session.status)}`}
                            title={`${session.provider} - ${session.user} (${session.time})`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{session.provider}</span>
                              {getStatusIcon(session.status)}
                            </div>
                            <div className="truncate opacity-90">{session.time}</div>
                          </div>
                        ))}
                        {sessions.length > 3 && (
                          <div className="text-xs text-muted-foreground">+{sessions.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Ações Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActionsModalOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Gerir Ações Admin
                </Button>
              </CardContent>
            </Card>

            {/* Conflict Scanner */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Scanner de Conflitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setConflictsModalOpen(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Ver Conflitos ({mockConflicts.length})
                </Button>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Legenda</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setLegendModalOpen(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Ver Legenda Completa
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions Modal */}
        <FullscreenModal
          isOpen={actionsModalOpen}
          onClose={() => setActionsModalOpen(false)}
          title="Ações Administrativas"
          description="Gerir ações do calendário da plataforma"
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-20 bg-orange-600 hover:bg-orange-700 text-white flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    <span className="text-center">Emergência: Reatribuir Sessões Futuras</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reatribuir Sessões em Conflito</DialogTitle>
                    <DialogDescription>
                      Selecione as sessões em conflito para reatribuição automática
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    {mockConflicts.filter(c => c.type === "overlap").map(conflict => (
                      <div key={conflict.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          checked={selectedConflicts.includes(conflict.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedConflicts([...selectedConflicts, conflict.id]);
                            } else {
                              setSelectedConflicts(selectedConflicts.filter(id => id !== conflict.id));
                            }
                          }}
                        />
                        <span className="text-sm">{conflict.description}</span>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button onClick={handleReassignSessions} className="bg-orange-600 hover:bg-orange-700 text-white">
                      Reatribuir Selecionadas
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-20 bg-red-600 hover:bg-red-700 text-white flex-col">
                    <Trash2 className="h-6 w-6 mb-2" />
                    <span className="text-center">Cancelamentos em Massa</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancelamentos em Massa</DialogTitle>
                    <DialogDescription>
                      Aplique um template de comunicação para cancelar múltiplas sessões
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="Motivo do cancelamento..."
                    value={massActionReason}
                    onChange={(e) => setMassActionReason(e.target.value)}
                  />
                  <DialogFooter>
                    <Button onClick={handleMassCancellation} className="bg-red-600 hover:bg-red-700 text-white">
                      Confirmar Cancelamentos
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="h-20 flex-col">
                <Download className="h-6 w-6 mb-2" />
                <span>Exportar Calendário</span>
              </Button>
            </div>
          </div>
        </FullscreenModal>

        {/* Conflicts Modal */}
        <FullscreenModal
          isOpen={conflictsModalOpen}
          onClose={() => setConflictsModalOpen(false)}
          title="Scanner de Conflitos"
          description="Análise detalhada de conflitos detectados no calendário"
        >
          <div className="space-y-6">
            {mockConflicts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum conflito detectado</h3>
                <p className="text-muted-foreground">O sistema está funcionando corretamente</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {mockConflicts.map((conflict) => (
                  <Card key={conflict.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={conflict.severity === "high" ? "destructive" : conflict.severity === "medium" ? "outline" : "secondary"}
                          className="text-sm"
                        >
                          {conflict.type}
                        </Badge>
                        <Badge variant="outline">
                          {conflict.severity} prioridade
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {conflict.sessions.length} sessões afetadas
                      </span>
                    </div>
                    <p className="text-foreground mb-4">{conflict.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Resolver
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </FullscreenModal>

        {/* Legend Modal */}
        <FullscreenModal
          isOpen={legendModalOpen}
          onClose={() => setLegendModalOpen(false)}
          title="Legenda do Calendário"
          description="Guia completo de símbolos e cores utilizados no calendário"
        >
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Status das Sessões</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <span className="font-medium">Sessão Normal</span>
                    <p className="text-sm text-muted-foreground">Sessão agendada sem problemas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div>
                    <span className="font-medium">Conflito de Horário</span>
                    <p className="text-sm text-muted-foreground">Sobreposição de agendamentos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  <Globe className="h-6 w-6 text-orange-600" />
                  <div>
                    <span className="font-medium">Fuso Horário Divergente</span>
                    <p className="text-sm text-muted-foreground">Horários atípicos que podem indicar problemas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  <Lock className="h-6 w-6 text-gray-600" />
                  <div>
                    <span className="font-medium">Slot Bloqueado</span>
                    <p className="text-sm text-muted-foreground">Horário indisponível para agendamentos</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Pilares de Atendimento</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded"></div>
                  <div>
                    <span className="font-medium">Saúde Mental</span>
                    <p className="text-sm text-muted-foreground">Consultas psicológicas e psiquiátricas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                  <div>
                    <span className="font-medium">Bem-estar Físico</span>
                    <p className="text-sm text-muted-foreground">Atividades físicas e saúde corporal</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                  <div>
                    <span className="font-medium">Assistência Financeira</span>
                    <p className="text-sm text-muted-foreground">Consultoria e planejamento financeiro</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  <div className="w-6 h-6 bg-purple-500 rounded"></div>
                  <div>
                    <span className="font-medium">Assistência Jurídica</span>
                    <p className="text-sm text-muted-foreground">Consultoria e suporte legal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FullscreenModal>
      </div>
    </div>
  );
};

export default AdminScheduling;
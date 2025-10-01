import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Calendar,
  Download,
  Edit3,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

interface SessionHistory {
  id: string;
  date: string;
  provider: string;
  pillar: string;
  status: "completed" | "cancelled" | "no_show" | "scheduled";
  type: "company" | "personal";
}

interface EmployeeDetail {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "active" | "inactive";
  department: string;
  joinDate: string;
  companySessions: number;
  personalSessions: number;
  totalSessions: number;
  usedSessions: number;
  providers: {
    mentalHealth?: string;
    physicalWellness?: string;
    financialAssistance?: string;
    legalAssistance?: string;
  };
  sessionHistory: SessionHistory[];
}

const mockEmployee: EmployeeDetail = {
  id: "1",
  name: "Ana Silva",
  email: "ana.silva@empresa.com",
  avatar: "/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png",
  status: "active",
  department: "Tecnologia",
  joinDate: "2023-03-15",
  companySessions: 12,
  personalSessions: 3,
  totalSessions: 15,
  usedSessions: 8,
  providers: {
    mentalHealth: "Dr. Pedro Santos",
    physicalWellness: "Dra. Maria Costa",
    financialAssistance: "Dr. João Ferreira"
  },
  sessionHistory: [
    {
      id: "1",
      date: "2024-01-20 14:00",
      provider: "Dr. Pedro Santos",
      pillar: "Saúde Mental",
      status: "completed",
      type: "company"
    },
    {
      id: "2", 
      date: "2024-01-15 10:30",
      provider: "Dra. Maria Costa",
      pillar: "Bem-estar Físico",
      status: "completed",
      type: "company"
    },
    {
      id: "3",
      date: "2024-01-10 16:00",
      provider: "Dr. João Ferreira", 
      pillar: "Assistência Financeira",
      status: "no_show",
      type: "personal"
    },
    {
      id: "4",
      date: "2024-01-05 09:00",
      provider: "Dr. Pedro Santos",
      pillar: "Saúde Mental",
      status: "cancelled",
      type: "company"
    },
    {
      id: "5",
      date: "2024-02-01 11:00",
      provider: "Dra. Maria Costa",
      pillar: "Bem-estar Físico",
      status: "scheduled",
      type: "company"
    }
  ]
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "cancelled": return <XCircle className="h-4 w-4 text-red-600" />;
    case "no_show": return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    case "scheduled": return <Clock className="h-4 w-4 text-blue-600" />;
    default: return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed": return "Concluída";
    case "cancelled": return "Cancelada";
    case "no_show": return "Falta";
    case "scheduled": return "Agendada";
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-800 border-green-200";
    case "cancelled": return "bg-red-100 text-red-800 border-red-200";
    case "no_show": return "bg-orange-100 text-orange-800 border-orange-200";
    case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const CompanyEmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employee] = useState<EmployeeDetail>(mockEmployee);
  const [newCompanySessions, setNewCompanySessions] = useState(employee.companySessions);
  const [newPersonalSessions, setNewPersonalSessions] = useState(employee.personalSessions);

  const handleAdjustQuotas = () => {
    // In a real app, this would update the backend
    console.log("Adjusting quotas:", { 
      employeeId: id,
      companySessions: newCompanySessions,
      personalSessions: newPersonalSessions 
    });
    
    toast({
      title: "Quotas ajustadas",
      description: `Quotas atualizadas para ${employee.name}`,
    });
  };

  const handleRevokeAccess = () => {
    // In a real app, this would revoke access
    console.log("Revoking access for employee:", id);
    
    toast({
      title: "Acesso revogado",
      description: `Acesso revogado para ${employee.name}`,
      variant: "destructive"
    });
  };

  const handleExportHistory = () => {
    // In a real app, this would generate and download CSV/PDF
    console.log("Exporting history for employee:", id);
    
    toast({
      title: "Histórico exportado",
      description: "Ficheiro CSV foi descarregado com sucesso.",
    });
  };

  const pillarNames = {
    "Saúde Mental": "mentalHealth",
    "Bem-estar Físico": "physicalWellness", 
    "Assistência Financeira": "financialAssistance",
    "Assistência Jurídica": "legalAssistance"
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/company/employees')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {employee.name}
            </h1>
            <p className="text-muted-foreground">
              Detalhes e histórico do colaborador
            </p>
          </div>
        </div>

        {/* Employee Profile */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Info */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Perfil do Colaborador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={employee.avatar} alt={employee.name} />
                  <AvatarFallback className="text-lg">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">{employee.email}</p>
                <Badge 
                  variant={employee.status === 'active' ? 'default' : 'secondary'}
                  className="mt-2"
                >
                  {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Departamento:</span>
                  <span className="text-sm">{employee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Data de entrada:</span>
                  <span className="text-sm">{new Date(employee.joinDate).toLocaleDateString('pt-PT')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Sessões utilizadas:</span>
                  <span className="text-sm font-medium">{employee.usedSessions} / {employee.totalSessions}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Quotas */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Quotas de Sessões</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Ajustar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajustar Quotas</DialogTitle>
                    <DialogDescription>
                      Defina as quotas de sessões empresa e pessoais para {employee.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companySessions">Sessões Empresa</Label>
                      <Input
                        id="companySessions"
                        type="number"
                        value={newCompanySessions}
                        onChange={(e) => setNewCompanySessions(parseInt(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="personalSessions">Sessões Pessoais</Label>
                      <Input
                        id="personalSessions"
                        type="number"
                        value={newPersonalSessions}
                        onChange={(e) => setNewPersonalSessions(parseInt(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAdjustQuotas} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Guardar Alterações
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{employee.companySessions}</div>
                  <div className="text-sm text-muted-foreground">Sessões Empresa</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{employee.personalSessions}</div>
                  <div className="text-sm text-muted-foreground">Sessões Pessoais</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="text-sm font-medium mb-2">Utilização Total</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {employee.usedSessions} de {employee.totalSessions} utilizadas
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round((employee.usedSessions / employee.totalSessions) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Providers */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Prestadores Atribuídos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(pillarNames).map(([pillarName, pillarKey]) => (
                <div key={pillarKey} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{pillarName}:</span>
                  <span className="text-sm text-muted-foreground">
                    {employee.providers[pillarKey] || "Não atribuído"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={handleExportHistory} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Histórico
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <UserX className="h-4 w-4 mr-2" />
                    Revogar Acesso
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Revogar Acesso</DialogTitle>
                    <DialogDescription>
                      Tem a certeza que pretende revogar o acesso de {employee.name}? Esta ação não pode ser revertida.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button variant="destructive" onClick={handleRevokeAccess}>
                      Confirmar Revogação
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Session History Timeline */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employee.sessionHistory
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((session) => (
                <div key={session.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(session.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{session.provider}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.date).toLocaleDateString('pt-PT')} às {new Date(session.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {session.pillar}
                      </Badge>
                      <Badge variant={session.type === 'company' ? 'default' : 'secondary'} className="text-xs">
                        {session.type === 'company' ? 'Empresa' : 'Pessoal'}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(session.status)}`}>
                        {getStatusText(session.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyEmployeeDetail;
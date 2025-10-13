import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Calendar,
  Users,
  Video,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Brain,
  Heart,
  DollarSign,
  Scale,
  Eye
} from 'lucide-react';
import { mockCompanySessions } from '@/data/companyMetrics';
import { useToast } from "@/hooks/use-toast";

const CompanySessions = () => {
  const [sessions, setSessions] = useState(mockCompanySessions);
  const [filteredSessions, setFilteredSessions] = useState(mockCompanySessions);
  const [searchQuery, setSearchQuery] = useState('');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const { toast } = useToast();

  // Calculate summary metrics
  const totalSessionsThisMonth = sessions.filter(s => s.status === 'Concluída' || s.status === 'Agendada').length;
  const virtualSessions = sessions.filter(s => s.type === 'Virtual' && s.status === 'Concluída').length;
  const presencialSessions = sessions.filter(s => s.type === 'Presencial' && s.status === 'Concluída').length;
  const completedSessions = sessions.filter(s => s.status === 'Concluída').length;

  // Filter sessions
  React.useEffect(() => {
    let filtered = sessions;

    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.specialist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (pillarFilter !== 'all') {
      filtered = filtered.filter(session => session.pillar === pillarFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(session => 
            new Date(session.date) >= filterDate && new Date(session.date) < new Date(filterDate.getTime() + 24 * 60 * 60 * 1000)
          );
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(session => new Date(session.date) >= filterDate);
          break;
        case 'month':
          filterDate.setDate(now.getDate() - 30);
          filtered = filtered.filter(session => new Date(session.date) >= filterDate);
          break;
      }
    }

    setFilteredSessions(filtered);
  }, [sessions, searchQuery, pillarFilter, statusFilter, dateFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluída':
        return <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Concluída
        </Badge>;
      case 'Agendada':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Agendada
        </Badge>;
      case 'Cancelada':
        return <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Cancelada
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'Bem-Estar Físico':
        return <Heart className="h-4 w-4 text-green-600" />;
      case 'Assistência Financeira':
        return <DollarSign className="h-4 w-4 text-orange-600" />;
      case 'Assistência Jurídica':
        return <Scale className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getPillarBadgeColor = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bem-Estar Físico':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Assistência Financeira':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Assistência Jurídica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
  };

  const handleViewCalendar = () => {
    setShowCalendarModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sessões da Empresa</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe todas as sessões realizadas pelos seus colaboradores
          </p>
        </div>
        
        <Button onClick={handleViewCalendar} size="lg" className="gap-2">
          <Calendar className="h-4 w-4" />
          Ver Próximas Sessões
        </Button>
      </div>

      {/* Summary Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Total de Sessões Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {totalSessionsThisMonth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Agendadas + Concluídas
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Video className="h-4 w-4 text-green-600" />
              Sessões Virtuais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {virtualSessions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((virtualSessions / (virtualSessions + presencialSessions)) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              Sessões Presenciais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {presencialSessions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((presencialSessions / (virtualSessions + presencialSessions)) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-600" />
              Sessões Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {completedSessions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((completedSessions / totalSessionsThisMonth) * 100)}% de conclusão
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Procurar por colaborador ou especialista..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={pillarFilter} onValueChange={setPillarFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por Pilar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Pilares</SelectItem>
            <SelectItem value="Saúde Mental">Saúde Mental</SelectItem>
            <SelectItem value="Bem-Estar Físico">Bem-Estar Físico</SelectItem>
            <SelectItem value="Assistência Financeira">Assistência Financeira</SelectItem>
            <SelectItem value="Assistência Jurídica">Assistência Jurídica</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Estados</SelectItem>
            <SelectItem value="Agendada">Agendada</SelectItem>
            <SelectItem value="Concluída">Concluída</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filtrar por Data" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Datas</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Última Semana</SelectItem>
            <SelectItem value="month">Último Mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sessions Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Histórico de Sessões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Colaborador</th>
                  <th className="text-left p-4 font-medium">Pilar</th>
                  <th className="text-left p-4 font-medium">Especialista</th>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-left p-4 font-medium">Data</th>
                  <th className="text-left p-4 font-medium">Estado</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nenhuma sessão encontrada com os filtros aplicados
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr key={session.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <div className="font-medium">{session.employeeName}</div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getPillarBadgeColor(session.pillar)} flex items-center gap-1 w-fit`}>
                          {getPillarIcon(session.pillar)}
                          {session.pillar}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{session.specialist}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {session.type === 'Virtual' ? (
                            <Video className="h-3 w-3" />
                          ) : (
                            <MapPin className="h-3 w-3" />
                          )}
                          {session.type}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(session.date).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewSession(session)}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Session Detail Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Sessão</DialogTitle>
            <DialogDescription>
              Informações completas sobre esta sessão
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Colaborador</label>
                  <p className="text-lg font-semibold">{selectedSession.employeeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Especialista</label>
                  <p className="text-lg font-semibold">{selectedSession.specialist}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pilar</label>
                  <div className="mt-1">
                    <Badge className={`${getPillarBadgeColor(selectedSession.pillar)} flex items-center gap-1 w-fit`}>
                      {getPillarIcon(selectedSession.pillar)}
                      {selectedSession.pillar}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {selectedSession.type === 'Virtual' ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                      {selectedSession.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data</label>
                  <p className="text-lg">{new Date(selectedSession.date).toLocaleDateString('pt-PT')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedSession.status)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Calendar Modal */}
      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Próximas Sessões</DialogTitle>
            <DialogDescription>
              Calendário com as próximas sessões agendadas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Simplified Calendar View */}
            <div className="border rounded-lg p-6 bg-muted/20">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Outubro 2024</h3>
                <p className="text-sm text-muted-foreground">Próximas sessões agendadas</p>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                  <div key={day} className="text-center font-medium text-sm p-2">
                    {day}
                  </div>
                ))}

                {/* Mock upcoming sessions */}
                {Array.from({ length: 35 }).map((_, idx) => {
                  const dayNum = idx - 2;
                  const isCurrentMonth = dayNum >= 1 && dayNum <= 31;
                  const hasSession = [18, 19, 20, 22, 24, 25, 26, 28, 29, 30, 31].includes(dayNum);
                  const isPast = dayNum < new Date().getDate();

                  return (
                    <div
                      key={idx}
                      className={`
                        p-4 rounded-lg border text-center min-h-[60px] flex flex-col justify-center
                        ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
                        ${isCurrentMonth && hasSession && !isPast ? 'bg-blue-100 border-blue-300 text-blue-700' : ''}
                        ${isCurrentMonth && !hasSession && !isPast ? 'bg-green-100 border-green-300 text-green-700' : ''}
                        ${isPast ? 'bg-gray-100 border-gray-300 text-gray-500' : ''}
                      `}
                    >
                      {isCurrentMonth && (
                        <>
                          <div className="font-semibold">{dayNum}</div>
                          <div className="text-xs mt-1">
                            {hasSession && !isPast ? '🔵 Sessão' : !isPast ? '🟩 Livre' : ''}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCalendarModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanySessions;

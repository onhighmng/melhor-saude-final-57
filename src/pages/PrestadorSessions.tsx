import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Download, 
  Filter, 
  RefreshCw, 
  Users, 
  Activity, 
  Clock, 
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  MapPin,
  Video,
  Brain,
  Heart,
  DollarSign,
  Scale,
  Star,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockPrestadorSessions } from '@/data/prestadorMetrics';

export default function PrestadorSessions() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState(mockPrestadorSessions);
  const [filteredSessions, setFilteredSessions] = useState(mockPrestadorSessions);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  // Filter sessions
  React.useEffect(() => {
    let filtered = sessions;

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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    setFilteredSessions(filtered);
  }, [sessions, dateFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter(s => s.status === 'Concluída').length;
    const scheduled = sessions.filter(s => s.status === 'Agendada').length;
    const cancelled = sessions.filter(s => s.status === 'Cancelada').length;
    const avgRating = sessions
      .filter(s => s.rating)
      .reduce((sum, s) => sum + s.rating!, 0) / sessions.filter(s => s.rating).length || 0;

    return { total, completed, scheduled, cancelled, avgRating };
  }, [sessions]);

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
        return <Heart className="h-4 w-4 text-yellow-600" />;
      case 'Assistência Financeira':
        return <DollarSign className="h-4 w-4 text-green-600" />;
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Assistência Financeira':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Assistência Jurídica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
  };

  const handleAddNotes = (session: any) => {
    setSelectedSession(session);
    setSessionNotes(session.notes || '');
    setShowNotesModal(true);
  };

  const handleSaveNotes = () => {
    if (selectedSession) {
      setSessions(prev => prev.map(s => 
        s.id === selectedSession.id ? { ...s, notes: sessionNotes } : s
      ));
      
      toast({
        title: "Notas adicionadas",
        description: `Notas pós-sessão foram salvas para ${selectedSession.clientName}`
      });
      
      setShowNotesModal(false);
      setSessionNotes('');
      setSelectedSession(null);
    }
  };

  const handleExportSessions = () => {
    toast({
      title: "Sessões exportadas",
      description: "Lista de sessões foi exportada com sucesso"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sessões</h1>
          <p className="text-muted-foreground mt-1">
            Gerir todas as sessões associadas ao seu perfil
          </p>
        </div>
        
        <Button onClick={handleExportSessions} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Total de Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as sessões
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((stats.completed / stats.total) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Agendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
              {stats.scheduled}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Próximas sessões
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-600" />
              Avaliação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
              <Star className="h-6 w-6 fill-purple-600 text-purple-600" />
              {stats.avgRating.toFixed(1)}/10
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Satisfação dos colaboradores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por Data" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Datas</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Última Semana</SelectItem>
            <SelectItem value="month">Último Mês</SelectItem>
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

        <Button 
          variant="outline" 
          onClick={() => {
            setDateFilter('all');
            setStatusFilter('all');
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Limpar Filtros
        </Button>
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
                  <th className="text-left p-4 font-medium">Data</th>
                  <th className="text-left p-4 font-medium">Colaborador</th>
                  <th className="text-left p-4 font-medium">Empresa</th>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-left p-4 font-medium">Estado</th>
                  <th className="text-left p-4 font-medium">Avaliação</th>
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
                        <div className="font-medium">{new Date(session.date).toLocaleDateString('pt-PT')}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{session.clientName}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {session.company}
                        </div>
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
                      <td className="p-4">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="p-4">
                        {session.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{session.rating}/10</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Não avaliado</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewSession(session)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Ver Detalhes
                          </Button>
                          {session.status === 'Concluída' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddNotes(session)}
                              className="gap-1"
                            >
                              <Plus className="h-4 w-4" />
                              Notas
                            </Button>
                          )}
                        </div>
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
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Colaborador</label>
                  <p className="text-lg font-semibold">{selectedSession.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                  <p className="text-lg font-semibold">{selectedSession.company}</p>
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
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedSession.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data</label>
                  <p className="text-lg">{new Date(selectedSession.date).toLocaleDateString('pt-PT')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Avaliação</label>
                  {selectedSession.rating ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{selectedSession.rating}/10</span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Não avaliado</p>
                  )}
                </div>
              </div>
              
              {selectedSession.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notas</label>
                  <div className="mt-1 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm">{selectedSession.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nota Pós-Sessão</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notas da sessão</Label>
              <Textarea
                id="notes"
                placeholder="Descreva o progresso do colaborador, pontos importantes discutidos, próximos passos..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNotesModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNotes}>
                Guardar Notas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, SessionStatus } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, Download, Filter, RefreshCw, ExternalLink, Users, Activity, Clock, Target, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockBookings, getMockBookings } from '@/data/mockData';
import { formatDate, formatTime } from '@/utils/dateFormatting';

interface SessionData {
  id: string;
  date: string;
  time: string;
  userName: string;
  pillar: 'saude_mental' | 'assistencia_juridica' | 'assistencia_financeira' | 'bem_estar_fisico';
  status: SessionStatus;
  location: 'online' | 'presencial';

  duration: number;
  notes?: string;
  meeting_link?: string;
  meeting_platform?: string;
}

export default function PrestadorSessions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>(
    getMockBookings().map(booking => ({
      id: booking.id,
      date: booking.date,
      time: booking.time,
      userName: booking.prestadores?.name || 'Utilizador',
      pillar: booking.pillar as 'saude_mental' | 'assistencia_juridica' | 'assistencia_financeira' | 'bem_estar_fisico',
      status: booking.status as SessionStatus,
      location: 'online' as const,
      duration: 60,
      notes: booking.notes,
      meeting_link: booking.meeting_link || '',
      meeting_platform: booking.meeting_platform || ''
    }))
  );
  const [editingSession, setEditingSession] = useState<SessionData | null>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingPlatform, setMeetingPlatform] = useState('');

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      
      if (fromDate && sessionDate < fromDate) return false;
      if (toDate && sessionDate > toDate) return false;
      if (statusFilter !== 'all' && session.status !== statusFilter) return false;
      if (pillarFilter !== 'all' && session.pillar !== pillarFilter) return false;
      
      return true;
    });
  }, [sessions, dateFrom, dateTo, statusFilter, pillarFilter]);

  const sessionStats = useMemo(() => {
    const completed = filteredSessions.filter(s => s.status === 'completed').length;
    const cancelled = filteredSessions.filter(s => s.status === 'cancelled').length;
    const noShows = filteredSessions.filter(s => s.status === 'no-show').length;
    const total = filteredSessions.length;

    return { completed, cancelled, noShows, total };
  }, [filteredSessions]);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setStatusFilter('all');
    setPillarFilter('all');
  };

  const handleAddMeetingLink = (session: SessionData) => {
    setEditingSession(session);
    setMeetingLink(session.meeting_link || '');
    setMeetingPlatform(session.meeting_platform || '');
  };

  const handleSaveMeetingLink = () => {
    if (!editingSession) return;

    setSessions(prev => prev.map(s => 
      s.id === editingSession.id 
        ? { ...s, meeting_link: meetingLink, meeting_platform: meetingPlatform }
        : s
    ));

    toast({
      title: "Link adicionado",
      description: "O link da reunião foi adicionado com sucesso.",
    });

    setEditingSession(null);
    setMeetingLink('');
    setMeetingPlatform('');
  };

  const exportToCsv = () => {
    const pillarLabels: Record<string, string> = {
      saude_mental: "Saúde Mental",
      assistencia_juridica: "Assistência Jurídica", 
      assistencia_financeira: "Assistência Financeira",
      bem_estar_fisico: "Bem-Estar Físico"
    };

    const statusLabels: Record<string, string> = {
      completed: "Concluída",
      confirmed: "Confirmada",
      pending: "Agendada",
      cancelled: "Cancelada",
      'no-show': "Falta"
    };

    const locationLabels: Record<string, string> = {
      online: "Online",
      presencial: "Presencial"
    };

    const csvData = filteredSessions.map(session => ({
      Data: session.date,
      Hora: session.time,
      Utilizador: session.userName,
      Pilar: pillarLabels[session.pillar] || session.pillar,
      Estado: statusLabels[session.status] || session.status,
      Local: locationLabels[session.location] || session.location,
      'Duração (min)': session.duration,
      Notas: session.notes || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sessoes_prestador_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast({
      title: "Exportação concluída",
      description: `${filteredSessions.length} sessões exportadas com sucesso.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Todas as Sessões"
        subtitle="Gerir e acompanhar todas as suas sessões"
        icon={Activity}
        showBackButton
        backUrl="/prestador/dashboard"
        actions={
          <Button onClick={exportToCsv} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Session Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{sessionStats.total}</p>
                  <p className="text-sm text-gray-500">Total de Sessões</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{sessionStats.completed}</p>
                  <p className="text-sm text-gray-500">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{sessionStats.cancelled}</p>
                  <p className="text-sm text-gray-500">Canceladas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{sessionStats.noShows}</p>
                  <p className="text-sm text-gray-500">Faltas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Data Início</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Data Fim</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os Estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Estados</SelectItem>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="no-show">Falta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pilar</label>
                <Select value={pillarFilter} onValueChange={setPillarFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os Pilares" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Pilares</SelectItem>
                    <SelectItem value="saude_mental">Saúde Mental</SelectItem>
                    <SelectItem value="bem_estar_fisico">Bem-Estar Físico</SelectItem>
                    <SelectItem value="assistencia_financeira">Assistência Financeira</SelectItem>
                    <SelectItem value="assistencia_juridica">Assistência Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Sessões</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma sessão encontrada
                </h3>
                <p className="text-gray-500">
                  Ajuste os filtros para ver mais sessões
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data e Hora</TableHead>
                      <TableHead>Utilizador</TableHead>
                      <TableHead>Pilar</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Link da Reunião</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => {
                      const sessionDate = formatDate(`${session.date}T${session.time}`);
                      const sessionTime = formatTime(`${session.date}T${session.time}`);
                      
                      return (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{sessionDate}</div>
                              <div className="text-sm text-gray-500">{sessionTime}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              {session.userName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {session.pillar === 'saude_mental' ? 'Saúde Mental' :
                               session.pillar === 'bem_estar_fisico' ? 'Bem-Estar Físico' :
                               session.pillar === 'assistencia_financeira' ? 'Assistência Financeira' :
                               'Assistência Jurídica'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={session.status} />
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {session.location === 'presencial' ? 'Presencial' : 'Online'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {session.meeting_link ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {session.meeting_platform}
                                </Badge>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAddMeetingLink(session)}
                                    >
                                      <LinkIcon className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                </Dialog>
                              </div>
                            ) : (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddMeetingLink(session)}
                                  >
                                    <LinkIcon className="h-4 w-4 mr-1" />
                                    Adicionar
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => navigate(`/prestador/sessoes/${session.id}`)}
                            >
                              <ExternalLink className="h-4 w-4" />
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meeting Link Dialog */}
      <Dialog open={!!editingSession} onOpenChange={() => setEditingSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Link da Reunião</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Plataforma da Reunião</Label>
              <Select value={meetingPlatform} onValueChange={setMeetingPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Plataforma da Reunião" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google Meet">Google Meet</SelectItem>
                  <SelectItem value="Zoom">Zoom</SelectItem>
                  <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                  <SelectItem value="Outra">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">URL da Reunião</Label>
              <Input
                id="link"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingSession(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveMeetingLink}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
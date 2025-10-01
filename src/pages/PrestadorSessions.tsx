import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, SessionStatus } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { Calendar, Download, Filter, RefreshCw, ExternalLink, Users, Activity, Clock, Target, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface SessionData {
  id: string;
  date: string;
  time: string;
  userName: string;
  pillar: 'psicologica' | 'juridica' | 'financeira' | 'fisica';
  status: SessionStatus;
  location: 'online' | 'presencial';
  duration: number;
  notes?: string;
  meeting_link?: string;
  meeting_platform?: string;
}

const pillarLabels = {
  psicologica: 'Saúde Mental',
  fisica: 'Bem-Estar Físico', 
  financeira: 'Assistência Financeira',
  juridica: 'Assistência Jurídica'
};

const locationLabels = {
  online: 'Online',
  presencial: 'Presencial'
};

export default function PrestadorSessions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingPlatform, setMeetingPlatform] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) return;

      // Find prestador_id from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userData.user.id)
        .single();

      if (!profile) return;

      // Fetch bookings for this prestador
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          notes,
          status,
          meeting_link,
          meeting_platform,
          user_id
        `)
        .eq('prestador_id', profile.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;

      // Fetch user names separately
      const userIds = bookings?.map(b => b.user_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p.name]) || []);

      const formattedSessions: SessionData[] = (bookings || []).map(booking => {
        const bookingDate = new Date(booking.booking_date);
        return {
          id: booking.id,
          date: bookingDate.toISOString().split('T')[0],
          time: format(bookingDate, 'HH:mm'),
          userName: profilesMap.get(booking.user_id) || 'Utilizador',
          pillar: 'juridica',
          status: (booking.status as SessionStatus) || 'scheduled',
          location: 'online',
          duration: 50,
          notes: booking.notes || undefined,
          meeting_link: booking.meeting_link || undefined,
          meeting_platform: booking.meeting_platform || undefined,
        };
      });

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Erro ao carregar sessões",
        description: "Não foi possível carregar as sessões.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMeetingLink = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          meeting_link: meetingLink,
          meeting_platform: meetingPlatform,
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Link guardado",
        description: "O link da reunião foi guardado com sucesso.",
      });

      setEditingSession(null);
      setMeetingLink('');
      setMeetingPlatform('');
      fetchSessions();
    } catch (error) {
      console.error('Error saving meeting link:', error);
      toast({
        title: "Erro",
        description: "Não foi possível guardar o link.",
        variant: "destructive",
      });
    }
  };

  const openMeetingLinkDialog = (session: SessionData) => {
    setEditingSession(session.id);
    setMeetingLink(session.meeting_link || '');
    setMeetingPlatform(session.meeting_platform || '');
  };

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

  const exportToCsv = () => {
    const pillarLabels: Record<string, string> = {
      psicologica: 'Psicológica',
      juridica: 'Jurídica', 
      financeira: 'Financeira',
      fisica: 'Física'
    };

    const statusLabels: Record<string, string> = {
      completed: 'Concluída',
      confirmed: 'Confirmada',
      pending: 'Pendente',
      cancelled: 'Cancelada',
      'no-show': 'Falta'
    };

    const locationLabels: Record<string, string> = {
      online: 'Online',
      presencial: 'Presencial'
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

  const formatSessionDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`);
    return {
      date: format(dateTime, "dd 'de' MMMM", { locale: pt }),
      time: format(dateTime, 'HH:mm')
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Todas as Sessões"
        subtitle="Veja e filtre todas as sessões que já realizou ou estão agendadas"
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
                <label className="text-sm font-medium text-gray-700">Data Inicial</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Data Final</label>
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
                    <SelectValue placeholder="Todos os estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estados</SelectItem>
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
                    <SelectValue placeholder="Todos os pilares" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os pilares</SelectItem>
                    <SelectItem value="psicologica">Saúde Mental</SelectItem>
                    <SelectItem value="fisica">Bem-Estar Físico</SelectItem>
                    <SelectItem value="financeira">Assistência Financeira</SelectItem>
                    <SelectItem value="juridica">Assistência Jurídica</SelectItem>
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
                  Sem sessões encontradas
                </h3>
                <p className="text-gray-500">
                  Não existem sessões para os filtros aplicados.
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
                      <TableHead>Duração</TableHead>
                      <TableHead>Link Reunião</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => {
                      const { date, time } = formatSessionDateTime(session.date, session.time);
                      
                      return (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{date}</div>
                              <div className="text-sm text-gray-500">{time}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              {session.userName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {pillarLabels[session.pillar]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={session.status} />
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {locationLabels[session.location]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {session.duration}min
                            </span>
                          </TableCell>
                          <TableCell>
                            {session.meeting_link ? (
                              <Badge variant="secondary" className="gap-1">
                                <LinkIcon className="h-3 w-3" />
                                {session.meeting_platform || 'Link'}
                              </Badge>
                            ) : (
                              <span className="text-sm text-gray-400">Sem link</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => openMeetingLinkDialog(session)}
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                    {session.meeting_link ? 'Editar' : 'Adicionar'} Link
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Link da Reunião</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="platform">Plataforma</Label>
                                      <Select value={meetingPlatform} onValueChange={setMeetingPlatform}>
                                        <SelectTrigger id="platform">
                                          <SelectValue placeholder="Selecione a plataforma" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Zoom">Zoom</SelectItem>
                                          <SelectItem value="Google Meet">Google Meet</SelectItem>
                                          <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                                          <SelectItem value="Outro">Outro</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="link">Link da Reunião</Label>
                                      <Input
                                        id="link"
                                        type="url"
                                        placeholder="https://..."
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                      />
                                    </div>
                                    <Button 
                                      onClick={() => handleSaveMeetingLink(session.id)}
                                      disabled={!meetingLink || !meetingPlatform}
                                    >
                                      Guardar Link
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={() => navigate(`/prestador/sessoes/${session.id}`)}
                              >
                                <ExternalLink className="h-4 w-4" />
                                Detalhes
                              </Button>
                            </div>
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
    </div>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  UserX, 
  MapPin, 
  Video, 
  Brain,
  Dumbbell,
  DollarSign,
  Scale,
  MoreHorizontal,
  Wifi,
  WifiOff,
  Filter,
  TrendingUp,
  CalendarDays,
  Settings,
  FileText
} from 'lucide-react';
import { mockPrestadorSessions, mockPrestadorMetrics, mockPrestadorUser } from '@/data/mockData';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';

const pillarIcons = {
  'saude_mental': Brain,
  'bem_estar_fisico': Dumbbell,
  'assistencia_financeira': DollarSign,
  'assistencia_juridica': Scale
};

export default function PrestadorDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'hoje' | 'proximos7dias'>('hoje');
  const [sessions, setSessions] = useState(mockPrestadorSessions);

  const pillarNames = {
    'saude_mental': 'Saúde Mental',
    'bem_estar_fisico': 'Bem-Estar Físico',
    'assistencia_financeira': 'Assistência Financeira',
    'assistencia_juridica': 'Assistência Jurídica'
  };

  const statusColors = {
    agendada: 'bg-blue-100 text-blue-800 border-blue-200',
    confirmada: 'bg-green-100 text-green-800 border-green-200',
    em_curso: 'bg-amber-100 text-amber-800 border-amber-200',
    concluida: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelada: 'bg-red-100 text-red-800 border-red-200',
    falta: 'bg-orange-100 text-orange-800 border-orange-200'
  };

  const statusLabels = {
    agendada: 'Agendada',
    confirmada: 'Confirmada',
    em_curso: 'Em Curso',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
    falta: 'Falta'
  };

  const formatSessionDate = (date: string) => {
    const sessionDate = parseISO(date);
    if (isToday(sessionDate)) return 'Hoje';
    if (isTomorrow(sessionDate)) return 'Amanhã';
    return format(sessionDate, 'EEEE, d MMM', { locale: pt });
  };

  const getFilteredSessions = () => {
    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);

    return sessions.filter(session => {
      const sessionDate = parseISO(session.date);
      if (timeFilter === 'hoje') {
        return isToday(sessionDate);
      }
      return sessionDate >= today && sessionDate <= in7Days;
    });
  };

  const groupSessionsByDate = (sessions: typeof mockPrestadorSessions) => {
    const grouped = sessions.reduce((acc, session) => {
      const date = session.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(session);
      return acc;
    }, {} as Record<string, typeof mockPrestadorSessions>);

    // Sort sessions within each date by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.time.localeCompare(b.time));
    });

    return grouped;
  };

  const handleSessionAction = (sessionId: string, action: 'concluir' | 'falta' | 'cancelar' | 'detalhes') => {
    if (action === 'concluir') {
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'concluida' as const }
          : session
      ));
      toast.success('Sessão marcada como concluída');
    } else if (action === 'falta') {
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'falta' as const }
          : session
      ));
      toast.warning('Falta registada');
    } else if (action === 'detalhes') {
      console.log(`Viewing details for session ${sessionId}`);
    }
  };

  const filteredSessions = getFilteredSessions();
  const groupedSessions = groupSessionsByDate(filteredSessions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={`Bem-vindo, ${mockPrestadorUser.name.split(' ')[0]}`}
        subtitle="Gerir as suas sessões e disponibilidade"
        className="bg-white border-b"
      />

      {/* Online Status & Filters Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Online Status Toggle */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsOnline(!isOnline)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isOnline 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                {isOnline ? 'Online' : 'Offline'}
              </button>
            </div>

            {/* Time Filters */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={timeFilter === 'hoje' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeFilter('hoje')}
                className="h-8"
              >
                Hoje
              </Button>
              <Button
                variant={timeFilter === 'proximos7dias' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeFilter('proximos7dias')}
                className="h-8"
              >
                Próximos 7 dias
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <CalendarDays className="w-4 h-4 mr-2" />
              Calendário
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <FileText className="w-4 h-4 mr-2" />
              Notas
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Definições
            </Button>
          </div>
        </div>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
          <div className="max-w-7xl mx-auto">
            Está atualmente offline. As marcações não serão atribuídas até ficar online novamente.
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Sessions Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Week Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{mockPrestadorMetrics.weekMetrics.sessoesConcluidas}</p>
                      <p className="text-sm text-gray-600">Concluídas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{mockPrestadorMetrics.weekMetrics.sessoesCanceladas}</p>
                      <p className="text-sm text-gray-600">Canceladas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <UserX className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{mockPrestadorMetrics.weekMetrics.faltasRegistadas}</p>
                      <p className="text-sm text-gray-600">Faltas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{mockPrestadorMetrics.weekMetrics.utilizadoresAtendidos}</p>
                      <p className="text-sm text-gray-600">Utilizadores</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sessões */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Sessões</h2>
              </div>
              {Object.keys(groupedSessions).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {timeFilter === 'hoje' ? 'Sem sessões hoje' : 'Sem sessões nos próximos 7 dias'}
                        </h3>
                        <p className="text-gray-600">
                          Aproveite o tempo livre!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                Object.entries(groupedSessions).map(([date, sessions]) => (
                  <Card key={date}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-gray-900">
                        {formatSessionDate(date)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sessions.map((session) => {
                        const PillarIcon = pillarIcons[session.pillar as keyof typeof pillarIcons];
                        
                        return (
                          <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <PillarIcon className="w-5 h-5 text-primary" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-medium text-gray-900">{session.user_name}</h4>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${statusColors[session.status as keyof typeof statusColors]}`}
                                  >
                                    {statusLabels[session.status as keyof typeof statusLabels]}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {session.time}
                                  </span>
                                  <span className="flex items-center gap-1">
                                     {session.location === 'online' ? (
                                       <>
                                         <Video className="w-4 h-4" />
                                         Online
                                       </>
                                    ) : (
                                       <>
                                         <MapPin className="w-4 h-4" />
                                         Presencial
                                       </>
                                    )}
                                  </span>
                                  <span>{pillarNames[session.pillar as keyof typeof pillarNames]}</span>
                                </div>
                                
                                {session.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{session.notes}</p>
                                )}
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-2">
                              {session.status === 'confirmada' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleSessionAction(session.id, 'concluir')}
                                     className="text-green-600 border-green-200 hover:bg-green-50"
                                   >
                                     <CheckCircle className="w-4 h-4 mr-1" />
                                     Concluir
                                   </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleSessionAction(session.id, 'falta')}
                                     className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                   >
                                     <UserX className="w-4 h-4 mr-1" />
                                     Marcar Falta
                                   </Button>
                                </>
                              )}
                              
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleSessionAction(session.id, 'detalhes')}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Monthly Overview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Visão Geral do Mês
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Sessões</span>
                  <span className="font-medium">{mockPrestadorMetrics.monthMetrics.totalSessoes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Satisfação Média</span>
                  <span className="font-medium">{mockPrestadorMetrics.monthMetrics.satisfacao}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tempo Médio</span>
                  <span className="font-medium">{mockPrestadorMetrics.monthMetrics.tempoMedio}min</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acesso Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-left">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Ver Calendário Completo
                </Button>
                <Button variant="ghost" className="w-full justify-start text-left">
                  <FileText className="w-4 h-4 mr-2" />
                  Notas de Sessões Passadas
                </Button>
                <Button variant="ghost" className="w-full justify-start text-left">
                  <Settings className="w-4 h-4 mr-2" />
                  Definições do Prestador
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
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
  TrendingUp,
  CalendarDays,
  Settings,
  FileText,
  BarChart3
} from 'lucide-react';
import sessionsCardBg from '@/assets/sessions-card-bg.jpg';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
// Mock data removed - using real Supabase data

const pillarIcons = {
  'saude_mental': Brain,
  'bem_estar_fisico': Dumbbell,
  'assistencia_financeira': DollarSign,
  'assistencia_juridica': Scale
};

export default function PrestadorDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'hoje' | 'proximos7dias'>('hoje');
  interface Session {
    id: string;
    user_id: string;
    date: string;
    start_time: string;
    status: string;
    pillar: string;
    notes: string;
    profiles?: { name: string; email: string };
    user_name?: string;
    userName?: string;
    userEmail?: string;
    userAvatar?: string;
    companyName?: string;
    time?: string;
  }
  interface Metrics {
    todaySessions: number;
    totalSessions: number;
    completedSessions: number;
    weekSessions: number;
    uniqueUsers: number;
    avgRating: string;
    revenue: number;
  }
  const [sessions, setSessions] = useState<Session[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [prestadorName, setPrestadorName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get prestador ID and name
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id, name')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) {
          setLoading(false);
          return;
        }

        setPrestadorName(prestador.name);

        // Load bookings for this prestador
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles (name, email, avatar_url),
            companies (company_name)
          `)
          .eq('prestador_id', prestador.id)
          .order('date', { ascending: true });

        if (bookings) {
          setSessions(bookings.map((b) => {
            const profile = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
            const company = Array.isArray(b.companies) ? b.companies[0] : b.companies;
            return {
              ...b,
              profiles: profile ? { name: profile.full_name || '', email: profile.email || '' } : undefined,
              userName: profile?.full_name || '',
              userEmail: profile?.email || '',
              userAvatar: profile?.avatar_url || '',
              companyName: company?.company_name || ''
            };
          }) as Session[]);
        }

        // Calculate metrics
        const totalSessions = bookings?.length || 0;
        const todaySessions = bookings?.filter(b => b.date === new Date().toISOString().split('T')[0]).length || 0;
        const completedSessions = bookings?.filter(b => b.status === 'completed').length || 0;
        const thisWeekStart = new Date();
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
        const weekSessions = bookings?.filter(b => new Date(b.date) >= thisWeekStart).length || 0;
        const uniqueUsers = new Set(bookings?.map(b => b.user_id)).size;
        const avgRating = bookings?.filter(b => b.rating)
          .reduce((sum, b) => sum + (b.rating || 0), 0) / (bookings?.filter(b => b.rating).length || 1);

        // Load revenue data from prestador_pricing
        const { data: pricing } = await supabase
          .from('prestador_pricing')
          .select('session_price')
          .eq('prestador_id', prestador.id)
          .single();

        const revenue = completedSessions * (pricing?.session_price || 0);

        setMetrics({
          todaySessions,
          totalSessions,
          completedSessions,
          weekSessions,
          uniqueUsers,
          avgRating: avgRating.toFixed(1),
          revenue
        });
      } catch (error) {
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Real-time subscription for bookings updates
    const prestadorIdPromise = supabase
      .from('prestadores')
      .select('id')
      .eq('user_id', profile.id)
      .single();

    prestadorIdPromise.then(({ data: prestador }) => {
      if (prestador?.id) {
        const channel = supabase
          .channel('prestador-dashboard-updates')
          .on('postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'bookings',
              filter: `prestador_id=eq.${prestador.id}`
            },
            () => loadData()
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    });
  }, [profile?.id]);

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

  const groupSessionsByDate = (sessions: Session[]) => {
    const grouped = sessions.reduce((acc, session) => {
      const date = session.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(session);
      return acc;
    }, {} as Record<string, any[]>);

    // Sort sessions within each date by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.start_time || a.time || '00:00';
        const timeB = b.start_time || b.time || '00:00';
        return timeA.localeCompare(timeB);
      });
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
      // Navigate to session details would go here
    }
  };

  const filteredSessions = getFilteredSessions();
  const groupedSessions = groupSessionsByDate(filteredSessions);

  return (
    <div className="space-y-6 min-h-screen bg-blue-50 p-6 -m-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Bem-vindo, {prestadorName.split(' ')[0] || profile?.name || 'Prestador'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir as suas sessões e disponibilidade
        </p>
      </div>

      {/* Quick Access Navigation - Bento Grid */}
      <div className="flex-1 min-h-0">
        <BentoGrid className="lg:grid-rows-3 h-full grid-rows-[10rem] lg:auto-rows-[minmax(14rem,1fr)]">
          {/* Top Left - Calendário */}
          <BentoCard 
            name="Calendário" 
            description="Gerir disponibilidade e horários"
            Icon={CalendarDays} 
            onClick={() => navigate('/prestador/calendario')} 
            className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2" 
            background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />}
            iconColor="text-blue-600"
            textColor="text-black"
            descriptionColor="text-black/70"
            href="#"
            cta=""
          />

          {/* Top Right - Configurações */}
          <BentoCard 
            name="Configurações" 
            description="Perfil e definições" 
            Icon={Settings} 
            onClick={() => navigate('/prestador/configuracoes')} 
            className="lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2" 
            background={<div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100" />}
            iconColor="text-amber-600"
            textColor="text-black"
            descriptionColor="text-black/70"
            href="#"
            cta=""
          />

          {/* Middle - Desempenho (spanning 2 rows) */}
          <BentoCard 
            name="" 
            description="" 
            href="#" 
            cta="" 
            className="lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4"
            background={
              <div className="absolute inset-0 flex flex-col p-6 overflow-y-auto bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Desempenho</h3>
                </div>
                <div className="flex-1 flex flex-col justify-between min-h-0">
                  <div className="w-full space-y-3">
                    {/* Week Metrics */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-white/70 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-1 mb-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-muted-foreground">Sessões Concluídas</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{metrics?.weekSessions || 0}</p>
                      </div>
                      <div className="p-3 bg-white/70 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-1 mb-1">
                          <Users className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-muted-foreground">Utilizadores Atendidos</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{metrics?.uniqueUsers || 0}</p>
                      </div>
                    </div>

                    {/* Monthly Overview */}
                    <div className="space-y-2 p-3 bg-white/70 rounded-lg border border-purple-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Total Sessões</span>
                        <span className="font-medium text-sm">{metrics?.totalSessions || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Receita Total</span>
                        <span className="font-medium text-sm">{metrics?.revenue ? `${metrics.revenue.toFixed(2)} MZN` : '0 MZN'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Satisfação</span>
                        <span className="font-medium text-sm">{metrics?.avgRating || '0.0'}/5</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate('/prestador/desempenho')} 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-sm py-2 mt-3"
                  >
                    Ver Completo
                  </Button>
                </div>
              </div>
            }
          />

          {/* Bottom Left - Sessões (spanning 2 rows) */}
          <BentoCard 
            name="" 
            description="" 
            href="#" 
            cta="" 
            onClick={() => navigate('/prestador/sessoes')} 
            className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4 cursor-pointer" 
            background={
              <div className="absolute inset-0">
                <img 
                  src={sessionsCardBg} 
                  alt="Sessions" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
              </div>
            } 
          />

          {/* Middle - Próximas Sessões (spanning 3 rows) */}
          <BentoCard 
            name="" 
            description="" 
            href="#" 
            cta="" 
            className="lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3"
            background={
              <div className="absolute inset-0 p-5 flex flex-col justify-between bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="flex-shrink-0">
                  <h3 className="text-2xl font-semibold mb-1">Próximas Sessões</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {filteredSessions.length > 0 ? `${filteredSessions.length} sessões agendadas` : 'Nenhuma sessão agendada'}
                  </p>
                </div>
                <div className="flex-1 space-y-3 flex flex-col justify-start">
                  {filteredSessions.length > 0 ? filteredSessions.slice(0, 3).map(session => {
                    const PillarIcon = pillarIcons[session.pillar as keyof typeof pillarIcons];
                    return (
                      <div 
                        key={session.id} 
                        className="flex items-start gap-3 rounded-2xl p-2.5 border-l-[5px] border-blue-400 bg-blue-50 transition-all flex-shrink-0"
                      >
                        <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <PillarIcon className="w-5.5 h-5.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-0.5 text-blue-700">{session.user_name}</div>
                          <div className="text-xs text-muted-foreground">{session.date} • {session.time}</div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center text-sm text-muted-foreground flex-shrink-0">
                      Nenhuma sessão agendada
                    </div>
                  )}
                </div>
              </div>
            } 
          />
        </BentoGrid>
      </div>
    </div>
  );
}
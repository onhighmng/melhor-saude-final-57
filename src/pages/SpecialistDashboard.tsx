import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEscalatedChats } from '@/hooks/useEscalatedChats';
import { useSpecialistAnalytics } from '@/hooks/useSpecialistAnalytics';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EscalatedChatCard } from '@/components/specialist/EscalatedChatCard';
import { AnalyticsCard } from '@/components/specialist/AnalyticsCard';
import { Phone, TrendingUp, Users, Calendar, ThumbsUp, MessageSquare, ArrowRight, Clock, Building2, AlertTriangle, Star, BookOpen, User, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// Real data loaded via hooks: useEscalatedChats, useSpecialistAnalytics
import { useNavigate } from 'react-router-dom';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getPillarColors } from '@/utils/pillarColors';

export default function SpecialistDashboard() {
  const { profile, isEspecialistaGeral } = useAuth();
  const { escalatedChats, isLoading: chatsLoading } = useEscalatedChats();
  const { metrics, isLoading: analyticsLoading } = useSpecialistAnalytics();
  const navigate = useNavigate();
  const [pillarFilter, setPillarFilter] = useState<string>('all');

  useEffect(() => {
    // Add admin-page class to body for gray background (same as admin/company)
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  // State for real data
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [todaySessions, setTodaySessions] = useState<any[]>([]);
  const [assignedCompanies, setAssignedCompanies] = useState<any[]>([]);
  const [monthlyCases, setMonthlyCases] = useState(0);
  
  // Especialista Geral sees ALL escalated chats (no company filtering)
  const filteredCallRequests = escalatedChats.filter((chat: any) => chat.status === 'phone_escalated');

  // Load real sessions - get bookings assigned to this specialist
  // Shows ALL bookings (same as user profile and prestador calendar)
  useEffect(() => {
    const loadSessions = async () => {
      if (!profile?.id) {
        console.log('[SpecialistDashboard] No profile ID');
        return;
      }
      
      console.log('[SpecialistDashboard] Loading sessions for profile:', profile.id);
      
      // First get the prestador ID for this user
      const { data: prestador, error: prestadorError } = await supabase
        .from('prestadores')
        .select('id')
        .eq('user_id', profile.id)
        .single();
      
      if (prestadorError) {
        console.error('[SpecialistDashboard] Error fetching prestador:', prestadorError);
      }
      
      console.log('[SpecialistDashboard] Prestador data:', prestador);
      
      if (!prestador) {
        console.log('[SpecialistDashboard] No prestador found, setting empty sessions');
        setFilteredSessions([]);
        setTodaySessions([]);
        return;
      }
      
      // Then get bookings using the prestador ID (NOT profile.id)
      const { data, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, profiles!bookings_user_id_fkey(name)')
        .eq('prestador_id', prestador.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (bookingsError) {
        console.error('[SpecialistDashboard] Error fetching bookings:', bookingsError);
      }
      
      console.log('[SpecialistDashboard] Bookings data:', data);
      console.log('[SpecialistDashboard] Total bookings:', data?.length || 0);
      
      // Map the bookings to the expected session format
      const mappedSessions = (data || []).map((booking: any) => ({
        id: booking.id,
        user_name: booking.profiles?.name || 'Unknown',
        time: booking.start_time || '',
        date: booking.date,
        type: booking.session_type || booking.meeting_type || 'Session',
        status: booking.status,
        ...booking
      }));
      
      console.log('[SpecialistDashboard] Mapped sessions:', mappedSessions);
      
      // Filter sessions for today only
      const today = new Date().toISOString().split('T')[0];
      const todayFiltered = mappedSessions.filter((session: any) => {
        const sessionDate = session.date || session.booking_date;
        return sessionDate === today && (session.status === 'scheduled' || session.status === 'confirmed');
      });
      
      console.log('[SpecialistDashboard] Today sessions:', todayFiltered);
      
      setFilteredSessions(mappedSessions);
      setTodaySessions(todayFiltered);
    };
    loadSessions();
  }, [profile?.id]);

  // Load assigned companies
  useEffect(() => {
    const loadCompanies = async () => {
      if (!profile?.id) return;
      const { data } = await supabase
        .from('specialist_assignments')
        .select('*, companies!specialist_assignments_company_id_fkey(*)')
        .eq('specialist_id', profile.id)
        .eq('is_active', true);
      setAssignedCompanies(data?.map(a => a.companies) || []);
    };
    loadCompanies();
  }, [profile?.id]);
  
  // Calculate monthly cases from real data
  useEffect(() => {
    const calculateMonthlyCases = async () => {
      if (!profile?.id) return;
      
      // Get date range for this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayISO = firstDayOfMonth.toISOString();
      
      try {
        // Count chat sessions this month
        const { count: chatCount } = await supabase
          .from('chat_sessions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', firstDayISO);
        
        // Get prestador ID for completed bookings count
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();
        
        let bookingsCount = 0;
        if (prestador) {
          // Count completed bookings this month for this specialist
          const { count: bookCount } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('prestador_id', prestador.id)
            .eq('status', 'completed')
            .gte('created_at', firstDayISO);
          
          bookingsCount = bookCount || 0;
        }
        
        // Total cases = chat sessions + completed bookings
        const totalCases = (chatCount || 0) + bookingsCount;
        setMonthlyCases(totalCases);
        
        console.log('[SpecialistDashboard] Monthly cases calculated:', {
          chatCount,
          bookingsCount,
          totalCases
        });
      } catch (error) {
        console.error('[SpecialistDashboard] Error calculating monthly cases:', error);
      }
    };
    
    calculateMonthlyCases();
  }, [profile?.id]);

  const filteredChats = pillarFilter === 'all' 
    ? escalatedChats 
    : escalatedChats.filter(chat => chat.pillar === pillarFilter);

  

  return (
    <div className="relative w-full min-h-screen h-full flex flex-col">
      <div className="relative z-10 h-full flex flex-col">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4 h-full flex flex-col min-h-0">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEspecialistaGeral ? 'Dashboard - Profissional de Permanencia' : 'Dashboard Especialista'}
            </h1>
            <p className="text-muted-foreground">
              {isEspecialistaGeral 
                ? `Gerir pedidos de chamada e sessões para ${assignedCompanies.length} empresas atribuídas`
                : 'Visão geral da sua atividade'
              }
            </p>
          </div>

          {/* Bento Grid Layout - Same as Admin/Company Dashboards */}
          <div className="h-[calc(100vh-200px)]">
            <BentoGrid className="h-full grid-rows-3 gap-4">
              {/* Top Left - Call Requests */}
              <BentoCard 
                name="Chamadas Pendentes" 
                description={`${filteredCallRequests.length} chamadas aguardam ligação`} 
                Icon={Phone} 
                onClick={() => navigate('/especialista/call-requests')} 
                className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2" 
                background={<div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100" />}
                iconColor="text-yellow-600"
                  textColor="text-gray-900"
                descriptionColor="text-gray-600"
                href="#"
                cta="Ver Pedidos"

              />

              {/* Top Right - Today's Sessions */}
              <BentoCard 
                name="Sessões Hoje" 
                description={`${todaySessions.length} sessões agendadas para hoje`} 
                Icon={Calendar} 
                onClick={() => navigate('/prestador/calendar')} 
                className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2" 
                background={
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
                      style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
                      }}

                    />
                  </div>
                }
                iconColor="text-blue-600"
                  textColor="text-gray-900"
                descriptionColor="text-gray-600"
                href="#"
                cta="Ver Agenda"

              />

              {/* Bottom Left - Personal Stats */}
              <BentoCard 
                name="Desempenho Pessoal" 
                description={`${monthlyCases} casos este mês`} 
                Icon={TrendingUp} 
                onClick={() => navigate('/especialista/stats')} 
                className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4" 
                background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />}
                iconColor="text-blue-600"
                  textColor="text-gray-900"
                descriptionColor="text-gray-600"
                href="#"
                cta="Ver Estatísticas"

              />

              {/* Bottom Right - Recursos */}
              <BentoCard 
                name="" 
                description="" 
                onClick={() => navigate('/especialista/resources')} 
                className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4" 
                background={
                  <div className="absolute inset-0">
                    <img 
                      src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                      alt="" 
                      className="w-full h-full object-cover" 

                    />
                  </div>
                }
                href="#"
                cta=""
              >
              </BentoCard>

              {/* Center - Activity Overview */}
              <BentoCard 
                name="" 
                description="" 
                href="#" 
                cta="" 
                className="lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3" 
                background={<div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />}
                iconColor="text-green-600"
                  textColor="text-slate-900"
                descriptionColor="text-slate-600"
              >
                <div className="relative z-30 flex flex-col h-full p-6">
                  <div className="mb-4">
                    <h3 className="text-3xl font-semibold text-gray-900 mb-2">Visão Geral</h3>
                    <p className="text-gray-600">Atividade recente e métricas principais</p>
                  </div>
                  
                  <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                    {/* Call Requests */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-5 w-5 text-orange-600" />
                          <span className="font-semibold text-gray-900">Pedidos de Chamada</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {filteredCallRequests.slice(0, 3).map((request) => (
                          <div 
                            key={request.id} 
                            className="flex items-center gap-3 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => navigate('/especialista/call-requests')}
                          >
                            <div className="p-2 bg-orange-100 rounded-full">
                              <Phone className="h-3 w-3 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{request.user_name}</p>
                              <p className="text-xs text-gray-600 truncate">{request.company_name}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {new Date(request.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                            </Badge>
                          </div>
                        ))}
                        {filteredCallRequests.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            <Phone className="h-6 w-6 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">Sem pedidos pendentes</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meetings Booked */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">Sessões Hoje</span>
                        </div>
                        <Badge variant="secondary">{todaySessions.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {todaySessions.slice(0, 3).map((session) => (
                          <div 
                            key={session.id} 
                            className="flex items-center gap-3 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => navigate('/prestador/calendar')}
                          >
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Calendar className="h-3 w-3 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{session.user_name}</p>
                              <p className="text-xs text-gray-600 truncate">{session.time} - {session.type}</p>
                            </div>
                          </div>
                        ))}
                        {todaySessions.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            <Calendar className="h-6 w-6 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">Sem sessões hoje</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <button 
                      onClick={() => navigate('/especialista/stats')}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline"
                    >
                      Ver Estatísticas Completas →
                    </button>
                  </div>
                </div>
              </BentoCard>
            </BentoGrid>
          </div>

          {/* Legacy view removed - now all specialists see Bento Grid */}
          {false && metrics && (
            <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <AnalyticsCard
                title="Total de Chats"
                value={metrics.totalChats}
                icon={MessageSquare}
                description="Últimos 30 dias"

              />
              <AnalyticsCard
                title="Taxa de Resolução AI"
                value={`${metrics.aiResolvedRate.toFixed(1)}%`}
                icon={TrendingUp}
                description="Resolvidos sem escalação"

              />
              <AnalyticsCard
                title="Taxa de Escalação"
                value={`${metrics.phoneEscalationRate.toFixed(1)}%`}
                icon={Phone}
                description="Escalados para telefone"

              />
              <AnalyticsCard
                title="Taxa de Satisfação"
                value={`${metrics.satisfactionRate.toFixed(1)}%`}
                icon={ThumbsUp}
                description="Utilizadores satisfeitos"

              />
            </div>

            <Tabs value={pillarFilter} onValueChange={setPillarFilter}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="legal">Jurídica</TabsTrigger>
                <TabsTrigger value="psychological">Psicológica</TabsTrigger>
                <TabsTrigger value="physical">Física</TabsTrigger>
                <TabsTrigger value="financial">Financeira</TabsTrigger>
              </TabsList>

              <TabsContent value={pillarFilter} className="space-y-4 mt-6">
                {filteredChats.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Sem chats escalados</h3>
                      <p className="text-muted-foreground text-center">
                        Não há chats escalados no momento
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredChats.map((chat) => (
                      <EscalatedChatCard key={chat.id} chat={chat} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

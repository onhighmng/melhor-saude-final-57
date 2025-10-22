import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEscalatedChats } from '@/hooks/useEscalatedChats';
import { useSpecialistAnalytics } from '@/hooks/useSpecialistAnalytics';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EscalatedChatCard } from '@/components/specialist/EscalatedChatCard';
import { AnalyticsCard } from '@/components/specialist/AnalyticsCard';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Phone, TrendingUp, Users, Calendar, ThumbsUp, MessageSquare, ArrowRight, Clock, Building2, AlertTriangle, Star, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockCallRequests, mockEspecialistaSessions, mockCompanies, mockReferrals, mockSpecialistPersonalStats } from '@/data/especialistaGeralMockData';
import { useNavigate } from 'react-router-dom';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { useEffect } from 'react';
import recursosWellness from '@/assets/recursos-wellness.jpg';
import { useResourceStats } from '@/hooks/useResourceStats';
import { getPillarColors } from '@/utils/pillarColors';

export default function SpecialistDashboard() {
  const { profile, isEspecialistaGeral } = useAuth();
  const { escalatedChats, isLoading: chatsLoading } = useEscalatedChats();
  const { metrics, isLoading: analyticsLoading } = useSpecialistAnalytics();
  const { filterByCompanyAccess } = useCompanyFilter();
  const navigate = useNavigate();
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const resourceStats = useResourceStats();

  useEffect(() => {
    // Add admin-page class to body for gray background (same as admin/company)
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  // Filter data based on role
  const filteredCallRequests = filterByCompanyAccess(
    mockCallRequests.filter(req => req.status === 'pending')
  );
  const filteredSessions = filterByCompanyAccess(
    mockEspecialistaSessions.filter(s => s.date === new Date().toISOString().split('T')[0])
  );
  const assignedCompanies = filterByCompanyAccess(mockCompanies);
  const filteredReferrals = filterByCompanyAccess(mockReferrals);

  const filteredChats = pillarFilter === 'all' 
    ? escalatedChats 
    : escalatedChats.filter(chat => chat.pillar === pillarFilter);

  if (chatsLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="A carregar..." />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen h-full flex flex-col">
      <div className="relative z-10 h-full flex flex-col">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4 h-full flex flex-col min-h-0">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEspecialistaGeral ? 'Dashboard - Especialista Geral' : 'Dashboard Especialista'}
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
                background={<div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50" />}
                iconColor="text-orange-600"
                textColor="text-gray-900"
                descriptionColor="text-gray-600"
                href="#"
                cta="Ver Pedidos"
              />

              {/* Top Right - Today's Sessions */}
              <BentoCard 
                name="Sessões Hoje" 
                description={`${filteredSessions.length} sessões agendadas para hoje`} 
                Icon={Calendar} 
                onClick={() => navigate('/especialista/sessions')} 
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
                description={`${mockSpecialistPersonalStats.monthly_cases} casos este mês`} 
                Icon={TrendingUp} 
                onClick={() => navigate('/especialista/stats')} 
                className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4" 
                background={
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100">
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
                      style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
                      }}
                    />
                  </div>
                }
                iconColor="text-purple-600"
                textColor="text-gray-900"
                descriptionColor="text-gray-600"
                href="#"
                cta="Ver Estatísticas"
              />

              {/* Bottom Right - Recursos with Pillar Distribution */}
              <BentoCard 
                name="" 
                description="" 
                Icon={BookOpen} 
                onClick={() => navigate('/admin/resources')} 
                className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4" 
                background={
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-5" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                  </div>
                }
                iconColor="text-indigo-600"
                textColor="text-gray-900"
                descriptionColor="text-gray-600"
                href="#"
                cta="Ver Todos"
              >
                <div className="relative z-30 flex flex-col h-full p-6">
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-900">Recursos</h3>
                        <p className="text-sm text-gray-600">{resourceStats.total} materiais disponíveis</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pillar Distribution Visualization */}
                  <div className="flex-1 space-y-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Distribuição por Pilar
                    </div>
                    
                    {resourceStats.distribution.map((pillar) => {
                      const colors = getPillarColors(pillar.pillar);
                      
                      return (
                        <div 
                          key={pillar.pillar}
                          className="bg-white/70 backdrop-blur-sm rounded-lg p-3 hover:bg-white/90 transition-all cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/admin/resources', { state: { pillar: pillar.pillar } });
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: colors.text }}
                              />
                              <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {pillar.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{pillar.percentage}%</span>
                              <span className="text-sm font-bold" style={{ color: colors.text }}>
                                {pillar.count}
                              </span>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <Progress 
                            value={pillar.percentage} 
                            className="h-2"
                            style={{
                              backgroundColor: colors.bgLight,
                            }}
                            indicatorStyle={{
                              backgroundColor: colors.text
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Footer Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-xs text-gray-600">Mais Popular</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {resourceStats.mostPopular?.label || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-xs text-gray-600">Tipos</p>
                        <p className="text-sm font-semibold text-gray-900">
                          PDF • Vídeo • Artigo
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
                    {/* Personal Metrics */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-gray-900">Métricas Pessoais</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-600">Avaliação Média</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-green-600">{mockSpecialistPersonalStats.avg_rating}</span>
                            <span className="text-sm text-gray-500">/10</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Tempo Resposta</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-blue-600">{mockSpecialistPersonalStats.avg_response_time_minutes}</span>
                            <span className="text-sm text-gray-500">min</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resolution Rate */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                          <span className="font-semibold text-gray-900">Taxa de Resolução</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Resolução Interna</span>
                          <span className="font-bold text-green-600">{mockSpecialistPersonalStats.internal_resolution_rate}%</span>
                        </div>
                        <Progress value={mockSpecialistPersonalStats.internal_resolution_rate} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Encaminhamentos</span>
                          <span className="font-bold text-purple-600">{mockSpecialistPersonalStats.referral_rate}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-orange-600" />
                          <span className="font-semibold text-gray-900">Atividade Recente</span>
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
                              {Math.floor(request.wait_time / 60)}h
                            </Badge>
                          </div>
                        ))}
                        {filteredCallRequests.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            <MessageSquare className="h-6 w-6 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">Sem atividade recente</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Companies Overview */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-indigo-600" />
                          <span className="font-semibold text-gray-900">Empresas Atribuídas</span>
                        </div>
                        <Badge variant="secondary">{assignedCompanies.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {assignedCompanies.slice(0, 2).map((company) => (
                          <div key={company.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{company.name}</p>
                              <p className="text-xs text-gray-600">
                                {company.registered_employees}/{company.total_employees} utilizadores
                              </p>
                            </div>
                            <Badge variant={company.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {company.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Referrals */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                      <div 
                        className="flex items-center justify-between cursor-pointer hover:bg-white/40 rounded p-2 -m-2 transition-colors"
                        onClick={() => navigate('/especialista/referrals')}
                      >
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-5 w-5 text-purple-600" />
                          <span className="font-semibold text-gray-900">Encaminhamentos</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">{filteredReferrals.length}</span>
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

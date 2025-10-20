import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useEscalatedChats } from '@/hooks/useEscalatedChats';
import { useSpecialistAnalytics } from '@/hooks/useSpecialistAnalytics';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EscalatedChatCard } from '@/components/specialist/EscalatedChatCard';
import { AnalyticsCard } from '@/components/specialist/AnalyticsCard';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Phone, TrendingUp, Users, Calendar, ThumbsUp, MessageSquare, ArrowRight, Clock, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockCallRequests, mockEspecialistaSessions, mockCompanies, mockReferrals } from '@/data/especialistaGeralMockData';
import { useNavigate } from 'react-router-dom';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

export default function SpecialistDashboard() {
  const { t } = useTranslation('specialist');
  const { profile, isEspecialistaGeral } = useAuth();
  const { escalatedChats, isLoading: chatsLoading } = useEscalatedChats();
  const { metrics, isLoading: analyticsLoading } = useSpecialistAnalytics();
  const { filterByCompanyAccess } = useCompanyFilter();
  const navigate = useNavigate();
  const [pillarFilter, setPillarFilter] = useState<string>('all');

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
        <LoadingSpinner size="lg" text={t('dashboard.loading')} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {isEspecialistaGeral ? 'Dashboard - Especialista Geral' : t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          {isEspecialistaGeral 
            ? `Gerir pedidos de chamada e sessões para ${assignedCompanies.length} empresas atribuídas`
            : t('dashboard.subtitle')
          }
        </p>
      </div>

      {/* Especialista Geral Bento Grid */}
      {isEspecialistaGeral && (
        <div className="space-y-6">
          <BentoGrid className="lg:grid-rows-3 grid-rows-[8rem] lg:auto-rows-[minmax(12rem,1fr)] gap-4">
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
            >
              <div className="p-4">
                <div className="text-3xl font-bold text-orange-600 mb-2">{filteredCallRequests.length}</div>
                <div className="space-y-2">
                  {filteredCallRequests.slice(0, 2).map((request) => (
                    <div key={request.id} className="text-sm bg-white/60 rounded p-2">
                      <div className="font-medium">{request.user_name}</div>
                      <div className="text-xs text-gray-600">{Math.floor(request.wait_time / 60)}h espera</div>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>

            {/* Top Middle - Today's Sessions */}
            <BentoCard 
              name="Sessões Hoje" 
              description={`${filteredSessions.length} sessões agendadas para hoje`} 
              Icon={Calendar} 
              onClick={() => navigate('/especialista/sessions')} 
              className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2" 
              background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />}
              iconColor="text-blue-600"
              textColor="text-gray-900"
              descriptionColor="text-gray-600"
              href="#"
              cta="Ver Agenda"
            >
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">{filteredSessions.length}</div>
                <div className="space-y-2">
                  {filteredSessions.slice(0, 2).map((session) => (
                    <div key={session.id} className="text-sm bg-white/60 rounded p-2">
                      <div className="font-medium">{session.user_name}</div>
                      <div className="text-xs text-gray-600">{session.time} • {session.pillar}</div>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>

            {/* Top Right - Referrals */}
            <BentoCard 
              name="Encaminhamentos" 
              description={`${filteredReferrals.length} encaminhamentos realizados`} 
              Icon={ArrowRight} 
              onClick={() => navigate('/especialista/referrals')} 
              className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2" 
              background={<div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100" />}
              iconColor="text-purple-600"
              textColor="text-gray-900"
              descriptionColor="text-gray-600"
              href="#"
              cta="Ver Encaminhamentos"
            >
              <div className="p-4">
                <div className="text-3xl font-bold text-purple-600 mb-2">{filteredReferrals.length}</div>
                <p className="text-sm text-gray-600">Esta semana</p>
              </div>
            </BentoCard>

            {/* Left Column - Recent Activity */}
            <BentoCard 
              name="" 
              description="" 
              href="#" 
              cta="" 
              className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4" 
              background={<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />}
            >
              <div className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Atividade Recente</h3>
                  </div>
                  <div className="space-y-3">
                    {filteredCallRequests.slice(0, 4).map((request) => (
                      <div key={request.id} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                        <div className="p-2 bg-orange-100 rounded-full">
                          <Phone className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{request.user_name}</p>
                          <p className="text-xs text-gray-600">{request.company_name} • {Math.floor(request.wait_time / 60)}h</p>
                        </div>
                      </div>
                    ))}
                    {filteredCallRequests.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma atividade recente</p>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/especialista/call-requests')}
                  className="mt-4 text-sm text-primary hover:underline font-medium"
                >
                  Ver Todas as Atividades →
                </button>
              </div>
            </BentoCard>

            {/* Right Column - Assigned Companies */}
            <BentoCard 
              name="Empresas Atribuídas" 
              description={`${assignedCompanies.length} empresas sob responsabilidade`} 
              Icon={Building2} 
              onClick={() => {}} 
              className="lg:col-start-2 lg:col-end-4 lg:row-start-2 lg:row-end-4" 
              background={<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50" />}
              iconColor="text-indigo-600"
              textColor="text-gray-900"
              descriptionColor="text-gray-600"
              href="#"
              cta=""
            >
              <div className="p-6 h-full flex flex-col">
                <div className="mb-4">
                  <div className="text-2xl font-bold text-indigo-600 mb-2">{assignedCompanies.length}</div>
                  <p className="text-sm text-gray-600">Empresas atribuídas</p>
                </div>
                <div className="flex-1 grid gap-3">
                  {assignedCompanies.map((company) => (
                    <div key={company.id} className="bg-white/60 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{company.name}</h4>
                        <Badge variant={company.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {company.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>{company.registered_employees}/{company.total_employees} utilizadores</p>
                        <p>Taxa de adesão: {company.adoption_rate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>
          </BentoGrid>
        </div>
      )}

      {/* Fallback for non-especialista users - show original content */}
      {!isEspecialistaGeral && metrics && (
        <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnalyticsCard
            title={t('analytics.totalChats')}
            value={metrics.totalChats}
            icon={MessageSquare}
            description={t('analytics.last30Days')}
          />
          <AnalyticsCard
            title={t('analytics.aiResolvedRate')}
            value={`${metrics.aiResolvedRate.toFixed(1)}%`}
            icon={TrendingUp}
            description={t('analytics.resolvedWithoutEscalation')}
          />
          <AnalyticsCard
            title={t('analytics.phoneEscalationRate')}
            value={`${metrics.phoneEscalationRate.toFixed(1)}%`}
            icon={Phone}
            description={t('analytics.escalatedToPhone')}
          />
          <AnalyticsCard
            title={t('analytics.satisfactionRate')}
            value={`${metrics.satisfactionRate.toFixed(1)}%`}
            icon={ThumbsUp}
            description={t('analytics.satisfiedUsers')}
          />
        </div>

      <Tabs value={pillarFilter} onValueChange={setPillarFilter}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">{t('tabs.all')}</TabsTrigger>
          <TabsTrigger value="legal">{t('tabs.legal')}</TabsTrigger>
          <TabsTrigger value="psychological">{t('tabs.psychological')}</TabsTrigger>
          <TabsTrigger value="physical">{t('tabs.physical')}</TabsTrigger>
          <TabsTrigger value="financial">{t('tabs.financial')}</TabsTrigger>
        </TabsList>

        <TabsContent value={pillarFilter} className="space-y-4 mt-6">
          {filteredChats.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('emptyState.title')}</h3>
                <p className="text-muted-foreground text-center">
                  {t('emptyState.description')}
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
  );
}

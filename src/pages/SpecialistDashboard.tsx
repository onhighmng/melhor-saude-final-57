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
import { Phone, TrendingUp, Users, Calendar, ThumbsUp, MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockCallRequests, mockEspecialistaSessions, mockCompanies } from '@/data/especialistaGeralMockData';
import { useNavigate } from 'react-router-dom';

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

      {/* Especialista Geral Metrics */}
      {isEspecialistaGeral && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/especialista/call-requests')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chamadas Pendentes</CardTitle>
              <Phone className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredCallRequests.length}</div>
              <p className="text-xs text-muted-foreground">Aguardam ligação</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/especialista/sessions')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredSessions.length}</div>
              <p className="text-xs text-muted-foreground">Agendadas para hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas Atribuídas</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedCompanies.length}</div>
              <p className="text-xs text-muted-foreground">Sob responsabilidade</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/especialista/referrals')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encaminhamentos</CardTitle>
              <ArrowRight className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {isEspecialistaGeral && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/especialista/call-requests')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Phone className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Ver Pedidos de Chamada</h3>
                  <p className="text-sm text-muted-foreground">
                    {filteredCallRequests.length} chamadas pendentes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/especialista/sessions')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Agenda de Hoje</h3>
                  <p className="text-sm text-muted-foreground">
                    {filteredSessions.length} sessões agendadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      {isEspecialistaGeral && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCallRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Phone className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{request.user_name}</p>
                    <p className="text-sm text-muted-foreground">{request.company_name} • {Math.floor(request.wait_time / 60)}h espera</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString('pt-PT')}
                  </div>
                </div>
              ))}
              {filteredCallRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Overview */}
      {isEspecialistaGeral && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Empresas Atribuídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignedCompanies.map((company) => (
                <div key={company.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{company.name}</h4>
                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                      {company.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{company.registered_employees}/{company.total_employees} utilizadores registados</p>
                    <p>Taxa de adesão: {company.adoption_rate}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEscalatedChats } from '@/hooks/useEscalatedChats';
import { useSpecialistAnalytics } from '@/hooks/useSpecialistAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EscalatedChatCard } from '@/components/specialist/EscalatedChatCard';
import { AnalyticsCard } from '@/components/specialist/AnalyticsCard';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Phone, TrendingUp, Users, Calendar, ThumbsUp, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SpecialistDashboard() {
  const { user } = useAuth();
  const { escalatedChats, isLoading: chatsLoading } = useEscalatedChats();
  const { metrics, isLoading: analyticsLoading } = useSpecialistAnalytics();
  const [pillarFilter, setPillarFilter] = useState<string>('all');

  const filteredChats = pillarFilter === 'all' 
    ? escalatedChats 
    : escalatedChats.filter(chat => chat.pillar === pillarFilter);

  if (chatsLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="A carregar dashboard..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Painel de Especialista</h1>
        <p className="text-muted-foreground">
          Gerir conversas escaladas e acompanhar métricas de desempenho
        </p>
      </div>

      {/* Analytics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnalyticsCard
            title="Total de Conversas"
            value={metrics.totalChats}
            icon={MessageSquare}
            description="Últimos 30 dias"
          />
          <AnalyticsCard
            title="Taxa de Resolução IA"
            value={`${metrics.aiResolvedRate.toFixed(1)}%`}
            icon={TrendingUp}
            description="Conversas resolvidas sem escalação"
          />
          <AnalyticsCard
            title="Taxa de Escalação"
            value={`${metrics.phoneEscalationRate.toFixed(1)}%`}
            icon={Phone}
            description="Conversas escaladas para telefone"
          />
          <AnalyticsCard
            title="Taxa de Satisfação"
            value={`${metrics.satisfactionRate.toFixed(1)}%`}
            icon={ThumbsUp}
            description="Utilizadores satisfeitos"
          />
        </div>
      )}

      {/* Pillar Breakdown */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Pilar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Jurídico</p>
                <p className="text-2xl font-bold">{metrics.pillarBreakdown.legal}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Psicológico</p>
                <p className="text-2xl font-bold">{metrics.pillarBreakdown.psychological}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Físico</p>
                <p className="text-2xl font-bold">{metrics.pillarBreakdown.physical}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Financeiro</p>
                <p className="text-2xl font-bold">{metrics.pillarBreakdown.financial}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Escalated Chats Section */}
      <Tabs value={pillarFilter} onValueChange={setPillarFilter}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="legal">Jurídico</TabsTrigger>
          <TabsTrigger value="psychological">Psicológico</TabsTrigger>
          <TabsTrigger value="physical">Físico</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value={pillarFilter} className="space-y-4 mt-6">
          {filteredChats.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma conversa escalada</h3>
                <p className="text-muted-foreground text-center">
                  Não há conversas escaladas nesta categoria no momento.
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
    </div>
  );
}

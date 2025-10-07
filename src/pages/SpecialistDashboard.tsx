import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('specialist');
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
        <LoadingSpinner size="lg" text={t('dashboard.loading')} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Analytics Overview */}
      {metrics && (
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
      )}

      {/* Pillar Breakdown */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>{t('pillarBreakdown.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('pillarBreakdown.legal')}</p>
                <p className="text-2xl font-bold">{metrics.pillarBreakdown.legal}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('pillarBreakdown.psychological')}</p>
                <p className="text-2xl font-bold">{metrics.pillarBreakdown.psychological}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('pillarBreakdown.physical')}</p>
                <p className="text-2xl font-bold">{metrics.pillarBreakdown.physical}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('pillarBreakdown.financial')}</p>
                <p className="text-2xl font-bold">{metrics.pillarBreakdown.financial}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Escalated Chats Section */}
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
    </div>
  );
}

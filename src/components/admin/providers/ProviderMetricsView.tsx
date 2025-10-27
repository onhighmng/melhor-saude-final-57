import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, DollarSign, Users, Calendar, TrendingUp, Euro } from 'lucide-react';
import { Provider, ProviderMetrics, ProviderHistoryItem, ProviderStatus } from '@/types/adminProvider';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProviderMetricsViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider | null;
  onBack: () => void;
}

// Removed - now using real database queries

export const ProviderMetricsView = ({
  open,
  onOpenChange,
  provider,
  onBack,
}: ProviderMetricsViewProps) => {
  const { t } = useTranslation('admin-providers');
  const [status, setStatus] = useState<ProviderStatus>(provider?.status || 'active');
  const [metrics, setMetrics] = useState<ProviderMetrics | null>(null);
  const [history, setHistory] = useState<ProviderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (provider && open) {
      loadMetrics();
    }
  }, [provider, open]);

  const loadMetrics = async () => {
    if (!provider?.id) return;

    setLoading(true);
    try {
      // Load bookings for metrics
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, profiles(name)')
        .eq('prestador_id', provider.id);

      if (bookingsError) throw bookingsError;

      const completedSessions = bookings?.filter(b => b.status === 'completed') || [];
      const ratings = completedSessions.map(b => b.rating).filter(r => r !== null) as number[];
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
        : 0;

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const sessionsThisMonth = bookings?.filter(b => 
        new Date(b.date) >= thisMonth
      ).length || 0;

      // Get unique companies
      const { data: companies } = await supabase
        .from('bookings')
        .select('company_id')
        .eq('prestador_id', provider.id)
        .not('company_id', 'is', null);

      const uniqueCompanies = new Set(companies?.map(c => c.company_id) || []).size;

      setMetrics({
        sessionsCompleted: completedSessions.length,
        avgSatisfaction: parseFloat(avgRating.toFixed(1)),
        sessionsThisMonth,
        companiesServed: uniqueCompanies,
        costPerSession: provider.costPerSession || 0,
        platformMargin: (provider.costPerSession || 0) * 0.25,
        netToProvider: (provider.costPerSession || 0) * 0.75,
        totalPaidThisMonth: (provider.costPerSession || 0) * 0.75 * sessionsThisMonth,
      });

      // Load recent history
      const recentBookings = bookings
        ?.filter(b => b.status === 'completed')
        .slice(0, 5)
        .map(b => ({
          id: b.id,
          date: b.date,
          collaborator: (b.profiles as any)?.name || 'N/A',
          rating: b.rating || 0,
          sessionType: b.meeting_type as 'virtual' | 'presential'
        })) || [];

      setHistory(recentBookings);
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast.error('Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  if (!provider) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>{t('metricsView.title')}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando métricas...</p>
            </div>
          ) : !metrics ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Erro ao carregar métricas</p>
            </div>
          ) : (
            <>
          {/* General Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('metricsView.generalData')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('metricsView.fullName')}</p>
                  <p className="font-semibold">{provider.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('metricsView.pillar')}</p>
                  <p className="font-semibold">{t('pillars.' + provider.pillar)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('metricsView.sessionType')}</p>
                  <p className="font-semibold">{t('sessionTypes.' + provider.sessionType)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('metricsView.currentStatus')}</p>
                  <Select value={status} onValueChange={(value) => setStatus(value as ProviderStatus)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('status.active')}</SelectItem>
                      <SelectItem value="busy">{t('status.busy')}</SelectItem>
                      <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('metricsView.mainMetrics')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto mb-2 text-vibrant-blue" />
                  <p className="text-xs text-muted-foreground mb-1">{t('metricsView.sessionsCompleted')}</p>
                  <p className="text-2xl font-bold">{metrics.sessionsCompleted}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-mint-green" />
                  <p className="text-xs text-muted-foreground mb-1">{t('metricsView.avgSatisfaction')}</p>
                  <p className="font-mono text-xl font-semibold">{metrics.avgSatisfaction}/10</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto mb-2 text-peach-orange" />
                  <p className="text-xs text-muted-foreground mb-1">{t('metricsView.sessionsThisMonth')}</p>
                  <p className="text-2xl font-bold">{metrics.sessionsThisMonth}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Users className="h-5 w-5 mx-auto mb-2 text-sky-blue" />
                  <p className="text-xs text-muted-foreground mb-1">{t('metricsView.companiesServed')}</p>
                  <p className="text-2xl font-bold">{metrics.companiesServed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('metricsView.financial')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">{t('metricsView.costPerSession')}</span>
                <span className="font-semibold">MZN {metrics.costPerSession}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">{t('metricsView.platformMargin')}</span>
                <span className="font-semibold">MZN {metrics.platformMargin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">{t('metricsView.netToProvider')}</span>
                <span className="font-semibold text-mint-green">MZN {metrics.netToProvider.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded-lg">
                <span className="font-semibold">{t('metricsView.totalPaidThisMonth')}</span>
                <span className="font-bold text-lg text-vibrant-blue">MZN {metrics.totalPaidThisMonth.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('metricsView.history')}</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('metricsView.noHistory')}
                </p>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.collaborator}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      <Badge variant="outline" className="mr-3">
                        {t('sessionTypes.' + item.sessionType)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-peach-orange">{item.rating}/10</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

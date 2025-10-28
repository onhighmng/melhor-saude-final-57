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
import { useState } from 'react';

interface ProviderMetricsViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider | null;
  onBack: () => void;
}

// Mock metrics data - replace with real data
const getMockMetrics = (provider: Provider): ProviderMetrics => ({
  sessionsCompleted: provider.totalSessions,
  avgSatisfaction: provider.avgSatisfaction,
  sessionsThisMonth: 18,
  companiesServed: 4,
  costPerSession: provider.costPerSession,
  platformMargin: provider.costPerSession * 0.25,
  netToProvider: provider.costPerSession * 0.75,
  totalPaidThisMonth: provider.costPerSession * 0.75 * 18,
});

// Mock history data - replace with real data
const getMockHistory = (): ProviderHistoryItem[] => [
  { id: '1', date: '2024-10-10', collaborator: 'Ana Silva', rating: 9.5, sessionType: 'virtual' },
  { id: '2', date: '2024-10-08', collaborator: 'João Santos', rating: 9.0, sessionType: 'presential' },
  { id: '3', date: '2024-10-05', collaborator: 'Maria Costa', rating: 9.2, sessionType: 'virtual' },
  { id: '4', date: '2024-10-03', collaborator: 'Pedro Alves', rating: 8.8, sessionType: 'virtual' },
  { id: '5', date: '2024-10-01', collaborator: 'Sofia Fernandes', rating: 9.4, sessionType: 'presential' },
];

export const ProviderMetricsView = ({
  open,
  onOpenChange,
  provider,
  onBack,
}: ProviderMetricsViewProps) => {
  const { t } = useTranslation('admin-providers');
  const [status, setStatus] = useState<ProviderStatus>(provider?.status || 'active');

  if (!provider) return null;

  const metrics = getMockMetrics(provider);
  const history = getMockHistory();

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
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Brain,
  Dumbbell,
  TrendingUp,
  Scale,
  Star,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Provider, Pillar } from '@/types/adminProvider';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ProviderCardProps {
  provider: Provider;
  onClick: () => void;
}

const pillarIcons: Record<Pillar, React.ComponentType<{ className?: string }>> = {
  'mental_health': Brain,
  'physical_wellness': Dumbbell,
  'financial_assistance': TrendingUp,
  'legal_assistance': Scale,
};

const pillarColors: Record<Pillar, string> = {
  'mental_health': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'physical_wellness': 'bg-green-500/10 text-green-600 border-green-500/20',
  'financial_assistance': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'legal_assistance': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

export const ProviderCard = ({ provider, onClick }: ProviderCardProps) => {
  const { t } = useTranslation('admin-providers');
  const Icon = pillarIcons[provider.pillar];

  return (
    <Card 
      className="hover-lift cursor-pointer transition-all duration-200 hover:shadow-lg" 
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-vibrant-blue to-mint-green text-white">
                {provider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-semibold">{provider.name}</h3>
              <p className="text-sm text-muted-foreground">{provider.specialty}</p>
            </div>
          </div>
          <Badge 
            variant={provider.status === 'active' ? 'default' : 'secondary'}
            className={`${
              provider.status === 'active' 
                ? 'bg-success text-white' 
                : provider.status === 'busy'
                ? 'bg-warning text-white'
                : 'bg-muted'
            } flex items-center gap-1`}
          >
            {provider.status === 'active' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {t(`card.${provider.status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{t('pillars.' + provider.pillar)}</p>
          <Badge 
            variant="outline" 
            className={pillarColors[provider.pillar]}
          >
            <Icon className="h-3 w-3 mr-1" />
            {t('pillars.' + provider.pillar)}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('card.costPerSession')}</p>
            <p className="font-bold text-sm">MZN {provider.costPerSession}</p>
          </div>

          <div className="text-center border-x">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <p className="text-xs text-muted-foreground">{t('card.satisfaction')}</p>
            </div>
            <p className="font-bold text-sm">{provider.avgSatisfaction}/10</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('card.sessions')}</p>
            <p className="font-bold text-sm">{provider.totalSessions}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

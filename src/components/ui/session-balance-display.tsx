import React from 'react';
import { useTranslation } from 'react-i18next';
import { SessionBalance } from '@/types/session';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, AlertTriangle, Calendar, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionBalanceDisplayProps {
  sessionBalance: SessionBalance | null;
  loading?: boolean;
  showActionButton?: boolean;
  onActionClick?: () => void;
  className?: string;
}

export const SessionBalanceDisplay: React.FC<SessionBalanceDisplayProps> = ({
  sessionBalance,
  loading = false,
  showActionButton = true,
  onActionClick,
  className
}) => {
  const { t } = useTranslation('user');

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!sessionBalance) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">{t('sessionBalance.error')}</span>
        </div>
      </div>
    );
  }

  const hasActiveSessions = sessionBalance.hasActiveSessions;
  const totalRemaining = sessionBalance.totalRemaining;
  const isExpired = totalRemaining === 0 && !hasActiveSessions;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{t('sessionBalance.remaining')}</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">
            {totalRemaining}
          </span>
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {t('common:status.expired', { ns: 'common' })}
            </Badge>
          )}
          {!hasActiveSessions && totalRemaining > 0 && (
            <Badge variant="outline" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {t('common:status.inactive', { ns: 'common' })}
            </Badge>
          )}
        </div>
      </div>

      {sessionBalance && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="text-muted-foreground">{t('sessionBalance.employerSessions')}</div>
            <div className="font-bold text-foreground">
              {sessionBalance.employerRemaining || 0} {t('sessionBalance.remainingLabel')}
            </div>
          </div>
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="text-muted-foreground">{t('sessionBalance.personalSessions')}</div>
            <div className="font-bold text-foreground">
              {sessionBalance.personalRemaining || 0} {t('sessionBalance.remainingLabel')}
            </div>
          </div>
        </div>
      )}

      {showActionButton && (
        <div className="pt-2">
          {!hasActiveSessions && totalRemaining === 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onActionClick}
                  variant="default"
                  size="sm" 
                  className="w-full"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('sessionBalance.acquireSessions')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('sessionBalance.needSessionsTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          ) : hasActiveSessions ? (
            <Button 
              onClick={onActionClick}
              variant="default"
              size="sm" 
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {t('sessionBalance.scheduleSession')}
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onActionClick}
                  variant="outline"
                  size="sm" 
                  className="w-full"
                  disabled
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t('sessionBalance.inactiveSessions')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('sessionBalance.contactAdminTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionBalanceDisplay;

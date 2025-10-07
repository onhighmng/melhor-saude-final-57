import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Building2, User as UserIcon, ExternalLink } from "lucide-react";
import { Session, getStatusLabel, getPillarLabel, getPayerSourceLabel } from "@/data/sessionMockData";
import { SessionDeductionBadge } from "./SessionDeductionBadge";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface SessionHistoryCardProps {
  session: Session;
  onViewDetails?: (sessionId: string) => void;
  onReschedule?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
}

export function SessionHistoryCard({ 
  session, 
  onViewDetails,
  onReschedule,
  onCancel 
}: SessionHistoryCardProps) {
  const { t } = useTranslation('user');
  const [showMeetingLink, setShowMeetingLink] = useState(false);

  useEffect(() => {
    const checkMeetingLinkAvailability = () => {
      const sessionDateTime = new Date(`${session.date}T${session.time}`);
      const now = new Date();
      const fiveMinutesBefore = new Date(sessionDateTime.getTime() - 5 * 60 * 1000);
      
      setShowMeetingLink(now >= fiveMinutesBefore && now <= sessionDateTime);
    };

    checkMeetingLinkAvailability();
    const interval = setInterval(checkMeetingLinkAvailability, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [session.date, session.time]);

  const getMeetingPlatformDisplay = (platform: 'zoom' | 'google_meet' | 'teams') => {
    const platformMap = {
      'zoom': 'Zoom',
      'google_meet': 'Google Meet',
      'teams': 'Microsoft Teams'
    };
    return platformMap[platform];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'cancelled':
      case 'no_show':
        return 'destructive';
      case 'rescheduled':
        return 'secondary';
      case 'scheduled':
      case 'confirmed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const canReschedule = ['scheduled', 'confirmed'].includes(session.status);
  const canCancel = ['scheduled', 'confirmed'].includes(session.status);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {getPillarLabel(session.pillar)}
            </CardTitle>
            <CardDescription>
              {t('sessions.sessionWith', 'Sessão com {{provider}}', { provider: session.prestadorName })}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge variant={getStatusVariant(session.status)}>
              {getStatusLabel(session.status)}
            </Badge>
            <SessionDeductionBadge
              status={session.status}
              wasDeducted={session.wasDeducted}
              payerSource={session.payerSource}
              deductedAt={session.deductedAt}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Session Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(session.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{session.time} ({session.minutes}min)</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{session.prestadorName}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {session.payerSource === 'company' ? (
                <Building2 className="h-4 w-4" />
              ) : (
                <UserIcon className="h-4 w-4" />
              )}
              <span>{t('sessions.quota.company', 'Quota {{type}}', { type: getPayerSourceLabel(session.payerSource) })}</span>
            </div>
          </div>

          {/* Deduction Information */}
          {session.wasDeducted && session.deductedAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-800">
                <p className="font-medium">{t('sessions.deducted', 'Sessão Deduzida')}</p>
                <p>
                  {t('sessions.deductedFrom', 
                    'Deduzida da quota {{type}} em {{date}}', 
                    { 
                      type: getPayerSourceLabel(session.payerSource).toLowerCase(), 
                      date: new Date(session.deductedAt).toLocaleString('pt-PT')
                    }
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Non-deduction information */}
          {!session.wasDeducted && ['cancelled', 'no_show', 'rescheduled'].includes(session.status) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <p className="font-medium">{t('sessions.notDeducted', 'Sessão Não Deduzida')}</p>
                <p>
                  {session.status === 'cancelled' && t('sessions.cancellationsNoCharge', 'Cancelamentos não consomem sessões da sua quota.')}
                  {session.status === 'no_show' && t('sessions.absencesNoCharge', 'Faltas não consomem sessões da sua quota.')}
                  {session.status === 'rescheduled' && t('sessions.reschedulesNoCharge', 'Reagendamentos não consomem sessões da sua quota.')}
                </p>
              </div>
            </div>
          )}

          {/* Meeting Link - Only show 5 minutes before session */}
          {showMeetingLink && session.meetingLink && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">{t('sessions.meetingLinkAvailable', 'Link da Reunião Disponível')}</p>
                  <p className="text-xs text-blue-600">{getMeetingPlatformDisplay(session.meetingPlatform)}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.open(session.meetingLink, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('sessions.actions.join', 'Entrar na Reunião')}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onViewDetails && (
              <Button size="sm" variant="outline" onClick={() => onViewDetails(session.id)}>
                {t('sessions.actions.viewDetails')}
              </Button>
            )}
            
            {canReschedule && onReschedule && (
              <Button size="sm" variant="outline" onClick={() => onReschedule(session.id)}>
                {t('sessions.actions.reschedule')}
              </Button>
            )}
            
            {canCancel && onCancel && (
              <Button size="sm" variant="destructive" onClick={() => onCancel(session.id)}>
                {t('sessions.actions.cancel')}
              </Button>
            )}
            
            {session.status === 'completed' && (
              <Button size="sm" variant="secondary">
                {t('sessions.rateSession', 'Avaliar Sessão')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
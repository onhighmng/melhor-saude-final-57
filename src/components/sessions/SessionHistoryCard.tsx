import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Building2, User as UserIcon, ExternalLink } from "lucide-react";
import { Session, getStatusLabel, getPillarLabel, getPayerSourceLabel } from "@/data/sessionMockData";
import { SessionDeductionBadge } from "./SessionDeductionBadge";
import { useState, useEffect } from "react";

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
  const [showMeetingLink, setShowMeetingLink] = useState(false);

  useEffect(() => {
    const checkMeetingLinkAvailability = () => {
      if (!session.meetingLink) {
        setShowMeetingLink(false);
        return;
      }

      const sessionDateTime = new Date(`${session.date} ${session.time}`);
      const now = new Date();
      const minutesUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60);

      // Show link if within 5 minutes before session or if session is in progress/past
      setShowMeetingLink(minutesUntilSession <= 5);
    };

    checkMeetingLinkAvailability();
    const interval = setInterval(checkMeetingLinkAvailability, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [session.date, session.time, session.meetingLink]);

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
              Sessão com {session.prestadorName}
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
              <span>Quota {getPayerSourceLabel(session.payerSource)}</span>
            </div>
          </div>

          {/* Deduction Information */}
          {session.wasDeducted && session.deductedAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-800">
                <p className="font-medium">Sessão Deduzida</p>
                <p>
                  Deduzida da quota {getPayerSourceLabel(session.payerSource).toLowerCase()} em{' '}
                  {new Date(session.deductedAt).toLocaleString('pt-PT')}
                </p>
              </div>
            </div>
          )}

          {/* Non-deduction information */}
          {!session.wasDeducted && ['cancelled', 'no_show', 'rescheduled'].includes(session.status) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <p className="font-medium">Sessão Não Deduzida</p>
                <p>
                  {session.status === 'cancelled' && 'Cancelamentos não consomem sessões da sua quota.'}
                  {session.status === 'no_show' && 'Faltas não consomem sessões da sua quota.'}
                  {session.status === 'rescheduled' && 'Reagendamentos não consomem sessões da sua quota.'}
                </p>
              </div>
            </div>
          )}

          {/* Meeting Link */}
          {showMeetingLink && session.meetingLink && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Link da Reunião Disponível</p>
                <a 
                  href={session.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Entrar na reunião {session.meetingPlatform && `(${session.meetingPlatform})`}
                </a>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onViewDetails && (
              <Button size="sm" variant="outline" onClick={() => onViewDetails(session.id)}>
                Ver Detalhes
              </Button>
            )}
            
            {canReschedule && onReschedule && (
              <Button size="sm" variant="outline" onClick={() => onReschedule(session.id)}>
                Reagendar
              </Button>
            )}
            
            {canCancel && onCancel && (
              <Button size="sm" variant="destructive" onClick={() => onCancel(session.id)}>
                Cancelar
              </Button>
            )}
            
            {session.status === 'completed' && (
              <Button size="sm" variant="secondary">
                Avaliar Sessão
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
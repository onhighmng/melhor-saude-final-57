import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Building2, User as UserIcon, ExternalLink } from "lucide-react";
import { Session, SessionStatus, getStatusLabel, getPillarLabel, getPayerSourceLabel, Pillar } from "@/data/sessionMockData";
import { SessionDeductionBadge } from "./SessionDeductionBadge";
import { SessionRatingDialog } from "./SessionRatingDialog";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  title: string;
  type: 'past' | 'future';
  onViewDetails?: (sessionId: string) => void;
  onReschedule?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
}

export function SessionModal({ 
  isOpen, 
  onClose, 
  sessions, 
  title, 
  type,
  onViewDetails,
  onReschedule,
  onCancel
}: SessionModalProps) {
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedSessionForRating, setSelectedSessionForRating] = useState<Session | null>(null);

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getMeetingPlatformDisplay = (platform: 'zoom' | 'google_meet' | 'teams') => {
    const platformMap = {
      'zoom': 'Zoom',
      'google_meet': 'Google Meet',
      'teams': 'Microsoft Teams'
    };
    return platformMap[platform];
  };

  const canReschedule = (status: string) => ['scheduled', 'confirmed'].includes(status);
  const canCancel = (status: string) => ['scheduled', 'confirmed'].includes(status);

  const getPillarColors = (pillar: Pillar) => {
    const colorMap: Record<Pillar, { light: string; dark: string; border: string }> = {
      'saude_mental': {
        light: 'bg-blue-50',
        dark: 'text-blue-700',
        border: 'border-blue-200'
      },
      'bem_estar_fisico': {
        light: 'bg-yellow-50',
        dark: 'text-yellow-700',
        border: 'border-yellow-200'
      },
      'assistencia_financeira': {
        light: 'bg-green-50',
        dark: 'text-green-700',
        border: 'border-green-200'
      },
      'assistencia_juridica': {
        light: 'bg-purple-50',
        dark: 'text-purple-700',
        border: 'border-purple-200'
      }
    };
    return colorMap[pillar];
  };

  const handleRatingClick = (session: Session) => {
    setSelectedSessionForRating(session);
    setShowRatingDialog(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {type === 'past' ? 'Nenhuma sessão passada encontrada' : 'Nenhuma sessão futura agendada'}
                </p>
              </div>
            ) : (
              sessions.map((session) => {
                const pillarColors = getPillarColors(session.pillar);
                return (
                  <Card key={session.id} className={cn("w-full", pillarColors.light, pillarColors.border)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className={cn("text-lg font-semibold", pillarColors.dark)}>
                            {getPillarLabel(session.pillar)}
                          </CardTitle>
                          <CardDescription className={cn("text-sm", pillarColors.dark.replace('text-', 'text-').replace('-700', '-600'))}>
                            Sessão com nosso especialista
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
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="text-sm text-red-800">
                            <p className="font-medium">Sessão Deduzida</p>
                            <p>
                              Deduzida da quota {getPayerSourceLabel(session.payerSource).toLowerCase()} em {new Date(session.deductedAt).toLocaleString('pt-PT')}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Non-deduction information */}
                      {!session.wasDeducted && ['cancelled', 'no_show', 'rescheduled'].includes(session.status) && (
                        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                          <div className="text-sm text-gray-800">
                            <p className="font-medium">Sessão Não Deduzida</p>
                            <p>
                              {session.status === 'cancelled' && 'Cancelamentos não consomem sessões da sua quota.'}
                              {session.status === 'no_show' && 'Faltas não consomem sessões da sua quota.'}
                              {session.status === 'rescheduled' && 'Reagendamentos não consomem sessões da sua quota.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Meeting Link - Show for future sessions or completed sessions */}
                      {session.meetingLink && (type === 'future' || session.status === 'completed') && (
                        <div className="bg-cyan-50 border border-cyan-300 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-cyan-800">Link da Reunião</p>
                              <p className="text-xs text-cyan-600">{getMeetingPlatformDisplay(session.meetingPlatform)}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => window.open(session.meetingLink, '_blank')}
                              className="gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              {type === 'future' ? 'Entrar na Reunião' : 'Ver Link'}
                            </Button>
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
                        
                        {canReschedule(session.status) && onReschedule && (
                          <Button size="sm" variant="outline" onClick={() => onReschedule(session.id)}>
                            Reagendar
                          </Button>
                        )}
                        
                        {canCancel(session.status) && onCancel && (
                          <Button size="sm" variant="destructive" onClick={() => onCancel(session.id)}>
                            Cancelar
                          </Button>
                        )}
                        
                        {session.status === 'completed' && (
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleRatingClick(session)}
                          >
                            Avaliar Sessão
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      {selectedSessionForRating && (
        <SessionRatingDialog
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          sessionId={selectedSessionForRating.id}
          pillarName={getPillarLabel(selectedSessionForRating.pillar)}
        />
      )}
    </>
  );
}

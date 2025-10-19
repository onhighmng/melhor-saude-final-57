import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Building2, User as UserIcon, ExternalLink } from "lucide-react";
import { Session, SessionStatus, getStatusLabel, getPillarLabel, getPayerSourceLabel, Pillar } from "@/data/sessionMockData";
import { SessionDeductionBadge } from "./SessionDeductionBadge";
import { SessionRatingDialog } from "./SessionRatingDialog";
import { SessionCard, SessionCardData, HistorySessionCard } from "@/components/ui/session-card";
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

  // Handler functions for the three action buttons
  const handleRescheduleSession = (sessionId: string) => {
    console.log('Reschedule session:', sessionId);
    if (onReschedule) {
      onReschedule(sessionId);
    }
  };

  const handleJoinSession = (sessionId: string) => {
    console.log('Join session:', sessionId);
    // Find the session and open meeting link if available
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    }
  };

  const handleCancelSession = (sessionId: string) => {
    console.log('Cancel session:', sessionId);
    if (onCancel) {
      onCancel(sessionId);
    }
  };

  // Transform Session data to SessionCardData
  const transformSessionToSessionCardData = (session: Session): SessionCardData => {
    // Determine meeting type based on available data
    let meetingType: 'virtual' | 'presencial' | 'phone' = 'virtual';
    
    if (session.meetingPlatform || session.meetingLink) {
      meetingType = 'virtual';
    } else {
      // Default to virtual if we have meeting platform info, otherwise we'd need more data to determine
      meetingType = 'virtual';
    }

    return {
      id: session.id,
      pillar: session.pillar,
      date: session.date,
      time: session.time,
      duration: session.minutes || 60,
      prestador: session.prestadorName,
      meetingType: meetingType,
      meetingPlatform: session.meetingPlatform,
      meetingLink: session.meetingLink,
      status: session.status === 'confirmed' || session.status === 'scheduled' ? 'confirmed' : 'pending',
      quota: session.payerSource === 'company' ? 'Quota Empresa' : 'Quota Pessoal'
    };
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {type === 'past' ? 'Nenhuma sessão passada encontrada' : 'Nenhuma sessão futura agendada'}
                </p>
              </div>
            ) : type === 'future' ? (
              // Use SessionCard components for future sessions to show all requested information
              sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={transformSessionToSessionCardData(session)}
                  onReschedule={handleRescheduleSession}
                  onJoin={handleJoinSession}
                  onCancel={handleCancelSession}
                  className="w-full"
                />
              ))
            ) : (
              // Use HistorySessionCard for past sessions
              sessions.map((session) => (
                <HistorySessionCard
                  key={session.id}
                  session={{
                    id: session.id,
                    pillar: session.pillar,
                    date: session.date,
                    time: session.time,
                    prestadorName: session.prestadorName,
                    meetingPlatform: session.meetingPlatform,
                    meetingType: 'virtual', // Default to virtual since we have meetingPlatform
                    status: session.status
                  }}
                  onRate={(sessionId) => {
                    const sessionToRate = sessions.find(s => s.id === sessionId);
                    if (sessionToRate) {
                      handleRatingClick(sessionToRate);
                    }
                  }}
                  className="w-full"
                />
              ))
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

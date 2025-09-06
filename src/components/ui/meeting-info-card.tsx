import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Clock, ExternalLink, Send, CheckCircle2 } from 'lucide-react';
import { getMeetingPlatformLabel, getTimeUntilLinkSent } from '@/data/sessionMockData';

interface MeetingInfoCardProps {
  session: {
    id: string;
    date: string;
    time: string;
    status: string;
    meetingPlatform: 'zoom' | 'google_meet' | 'teams';
    meetingLink?: string;
    meetingId?: string;
    linkSentAt?: string;
    sessionType: 'individual';
  };
  userRole?: 'user' | 'prestador';
}

export function MeetingInfoCard({ session, userRole = 'user' }: MeetingInfoCardProps) {
  const platformLabel = getMeetingPlatformLabel(session.meetingPlatform);
  const timeUntilLink = getTimeUntilLinkSent(session.date, session.time);
  const linkWasSent = !!session.linkSentAt;
  
  const getPlatformIcon = () => {
    switch (session.meetingPlatform) {
      case 'zoom':
        return '📹';
      case 'google_meet':
        return '📱';
      case 'teams':
        return '💼';
      default:
        return '🎥';
    }
  };

  const sessionDateTime = new Date(`${session.date}T${session.time}`);
  const now = new Date();
  const isUpcoming = sessionDateTime > now;
  const isToday = sessionDateTime.toDateString() === now.toDateString();

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Video className="h-5 w-5 text-primary" />
          Sessão Individual Online
          <Badge variant="secondary" className="ml-auto">
            {session.sessionType}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Platform Information */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getPlatformIcon()}</span>
            <div>
              <p className="font-medium">{platformLabel}</p>
              {session.meetingId && (
                <p className="text-sm text-muted-foreground">ID: {session.meetingId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Link Distribution Status */}
        {userRole === 'prestador' && (
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">Sistema de Envio Automático</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              O link da sessão será enviado automaticamente 5 minutos antes do início.
            </p>
            {isUpcoming && (
              <div className="flex items-center gap-2">
                {linkWasSent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Link enviado aos utilizadores</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">{timeUntilLink}</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* User View - Meeting Link */}
        {userRole === 'user' && (
          <div className="space-y-3">
            {linkWasSent && session.meetingLink ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-700">Link da sessão disponível</span>
                </div>
                <Button asChild className="w-full">
                  <a 
                    href={session.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Entrar na Sessão ({platformLabel})
                  </a>
                </Button>
              </div>
            ) : isUpcoming ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-700">Link em preparação</span>
                </div>
                <p className="text-sm text-blue-600">{timeUntilLink}</p>
                {isToday && (
                  <p className="text-xs text-blue-500 mt-1">
                    Receberá uma notificação quando o link estiver disponível
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Sessão já realizada</p>
              </div>
            )}
          </div>
        )}

        {/* System Notes */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          <p>ℹ️ <strong>Sistema automatizado:</strong> Links são gerados e enviados automaticamente. Não há sessões em grupo - todas as consultas são individuais.</p>
        </div>
      </CardContent>
    </Card>
  );
}
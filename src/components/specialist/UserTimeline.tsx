import { MessageSquare, Calendar, ArrowRight, FileText, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimelineEvent {
  id: string;
  type: 'chat' | 'session' | 'referral' | 'note' | 'call';
  date: string;
  title: string;
  description: string;
  pillar?: string;
  status?: string;
}

interface UserTimelineProps {
  userId: string;
  events: TimelineEvent[];
}

export const UserTimeline = ({ userId, events }: UserTimelineProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'session':
        return <Calendar className="h-4 w-4" />;
      case 'referral':
        return <ArrowRight className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'chat':
        return 'text-blue-600 bg-blue-50';
      case 'session':
        return 'text-green-600 bg-green-50';
      case 'referral':
        return 'text-purple-600 bg-purple-50';
      case 'note':
        return 'text-gray-600 bg-gray-50';
      case 'call':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPillarLabel = (pillar?: string) => {
    if (!pillar) return null;
    const labels = {
      psychological: 'Saúde Mental',
      physical: 'Bem-Estar Físico',
      financial: 'Assistência Financeira',
      legal: 'Assistência Jurídica'
    };
    return labels[pillar as keyof typeof labels] || pillar;
  };

  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">Timeline de Atividades</h4>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

          {/* Timeline Events */}
          <div className="space-y-6">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative pl-10">
                {/* Icon */}
                <div
                  className={`absolute left-0 top-0 p-2 rounded-full ${getIconColor(
                    event.type
                  )}`}
                >
                  {getIcon(event.type)}
                </div>

                {/* Content */}
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-medium">{event.title}</h5>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(event.date).toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">{event.description}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {event.pillar && (
                      <Badge variant="secondary" className="text-xs">
                        {getPillarLabel(event.pillar)}
                      </Badge>
                    )}
                    {event.status && (
                      <Badge variant="outline" className="text-xs">
                        {event.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {sortedEvents.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Sem atividades registadas</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

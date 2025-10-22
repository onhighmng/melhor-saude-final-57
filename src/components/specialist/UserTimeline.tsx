import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, 
  Calendar, 
  MessageSquare, 
  FileText,
  ArrowRight,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface TimelineEvent {
  id: string;
  type: 'chat' | 'call' | 'session' | 'referral' | 'note';
  title: string;
  description: string;
  date: string;
  pillar?: string;
  outcome?: string;
  specialist?: string;
}

interface UserTimelineProps {
  events: TimelineEvent[];
}

const pillarLabels: Record<string, string> = {
  psychological: 'Psicológico',
  financial: 'Financeiro',
  legal: 'Jurídico',
  physical: 'Físico',
};

const eventIcons = {
  chat: MessageSquare,
  call: Phone,
  session: Calendar,
  referral: ArrowRight,
  note: FileText,
};

const eventColors = {
  chat: 'text-blue-600 bg-blue-50',
  call: 'text-green-600 bg-green-50',
  session: 'text-purple-600 bg-purple-50',
  referral: 'text-orange-600 bg-orange-50',
  note: 'text-gray-600 bg-gray-50',
};

export const UserTimeline: React.FC<UserTimelineProps> = ({ events }) => {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Histórico de Interações</h3>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {sortedEvents.map((event, index) => {
              const Icon = eventIcons[event.type];
              const colorClass = eventColors[event.type];

              return (
                <div key={event.id} className="relative pl-8 pb-4">
                  {/* Timeline line */}
                  {index < sortedEvents.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-border" />
                  )}

                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon className="h-3 w-3" />
                  </div>

                  {/* Event content */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {event.description}
                        </p>
                      </div>
                      {event.pillar && (
                        <Badge variant="outline" className="text-xs">
                          {pillarLabels[event.pillar] || event.pillar}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.date), "dd MMM yyyy 'às' HH:mm", { locale: pt })}
                      {event.specialist && (
                        <>
                          <span>•</span>
                          <span>{event.specialist}</span>
                        </>
                      )}
                    </div>

                    {event.outcome && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <span className="font-medium">Resultado: </span>
                        {event.outcome}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {sortedEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Nenhuma interação registada</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

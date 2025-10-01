import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Video, X } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data for demonstration
const mockSessions = [
  {
    id: '1',
    date: new Date().toISOString(),
    time: '14:30',
    pillar: 'Saúde Mental',
    provider: 'Dr. Ana Silva',
    status: 'confirmed',
    isToday: true
  },
  {
    id: '2',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00',
    pillar: 'Assistência Financeira',
    provider: 'Carlos Santos',
    status: 'confirmed',
    isToday: false
  },
  {
    id: '3',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: '16:00',
    pillar: 'Saúde Mental',
    provider: 'Dr. Ana Silva',
    status: 'cancelled',
    isToday: false
  }
];

const getStatusBadge = (status: string, isSessionToday: boolean) => {
  if (isSessionToday) {
    return <Badge className="bg-gradient-to-r from-emerald-green to-mint-green text-white font-medium shadow-custom-sm">Hoje</Badge>;
  }
  
  switch (status) {
    case 'confirmed':
      return <Badge variant="outline" className="border-emerald-green/40 text-emerald-green bg-emerald-green/5 font-medium">Confirmada</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/5 font-medium">Cancelada</Badge>;
    case 'completed':
      return <Badge variant="outline" className="border-slate-grey text-muted-foreground bg-slate-grey/10 font-medium">Concluída</Badge>;
    default:
      return <Badge variant="outline" className="font-medium">Agendada</Badge>;
  }
};

const getActionButton = (status: string, isSessionToday: boolean) => {
  if (status === 'cancelled') return null;
  
  if (isSessionToday && status === 'confirmed') {
    return (
      <Button size="sm" className="bg-gradient-to-r from-emerald-green to-mint-green hover:from-emerald-green/90 hover:to-mint-green/90 shadow-custom-sm font-medium">
        <Video className="w-4 h-4 mr-2" />
        Entrar
      </Button>
    );
  }
  
  if (status === 'confirmed') {
    return (
      <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5 font-medium">
        <X className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
    );
  }
  
  return null;
};

export const UpcomingSessions = () => {
  const hasSessions = mockSessions.length > 0;

  if (!hasSessions) {
    return (
      <Card className="border-0 shadow-custom-lg bg-gradient-to-br from-white to-slate-grey/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-foreground">
            <div className="p-2 rounded-lg bg-gradient-to-br from-vibrant-blue to-bright-royal">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">Próximas Sessões</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-16 space-y-6">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-grey/10 to-slate-grey/20 rounded-2xl flex items-center justify-center">
              <Calendar className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-green to-accent-sage rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">
              Ainda não tem sessões agendadas
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Marque já a sua próxima sessão e comece a cuidar do seu bem-estar!
            </p>
          </div>
          <Button className="bg-gradient-to-r from-bright-royal to-vibrant-blue hover:from-bright-royal/90 hover:to-vibrant-blue/90 shadow-custom-md hover:shadow-custom-lg transition-all duration-300">
            <Calendar className="w-4 h-4 mr-2" />
            Marcar Nova Sessão
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-custom-sm bg-gradient-to-br from-white to-slate-grey/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-foreground">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-vibrant-blue to-bright-royal">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold">Próximas Sessões</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {mockSessions.map((session) => {
          const sessionDate = parseISO(session.date);
          const isSessionToday = isToday(sessionDate);
          
          return (
            <Card 
              key={session.id} 
              className={`border-0 shadow-custom-sm hover:shadow-custom-md transition-all duration-300 ${
                isSessionToday 
                  ? 'bg-gradient-to-r from-emerald-green/10 to-mint-green/20 border-l-2 border-l-emerald-green' 
                  : 'bg-white/80 backdrop-blur-sm border-l-2 border-l-vibrant-blue/30'
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between space-x-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <div className="text-sm font-semibold text-foreground">
                        {format(sessionDate, "d 'de' MMM", { locale: ptBR })}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground bg-slate-grey/10 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 mr-1" />
                        {session.time}
                      </div>
                      {getStatusBadge(session.status, isSessionToday)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-bright-royal">
                        {session.pillar}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="w-3 h-3 mr-1" />
                        {session.provider}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {getActionButton(session.status, isSessionToday)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};
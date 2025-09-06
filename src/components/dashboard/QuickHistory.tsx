import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { History, ExternalLink, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FullscreenModal from '@/components/admin/FullscreenModal';

// Mock data for demonstration
const mockCompletedSessions = [
  {
    id: '1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    pillar: 'Saúde Mental',
    provider: {
      name: 'Dr. Ana Silva',
      avatar: '/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png'
    }
  },
  {
    id: '2',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    pillar: 'Assistência Financeira',
    provider: {
      name: 'Carlos Santos',
      avatar: '/lovable-uploads/085a608e-3a3e-45e5-898b-2f9b4c0f7f67.png'
    }
  },
  {
    id: '3',
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    pillar: 'Saúde Mental',
    provider: {
      name: 'Dr. Ana Silva',
      avatar: '/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png'
    }
  }
];

export const QuickHistory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasHistory = mockCompletedSessions.length > 0;

  if (!hasHistory) {
    return (
      <>
        <Card 
          className="group relative overflow-hidden border-0 shadow-custom-sm hover:shadow-custom-md transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-grey/5 opacity-80"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-green/5 to-accent-sage/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <CardHeader className="relative">
            <CardTitle className="flex items-center space-x-3 text-foreground">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-green to-accent-sage">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">Histórico Rápido</span>
                <p className="text-sm text-muted-foreground font-normal">
                  Ainda não há sessões concluídas
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <FullscreenModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Histórico de Sessões"
          description="Suas sessões concluídas aparecerão aqui"
        >
          <div className="text-center py-16 space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-grey/10 to-slate-grey/20 rounded-2xl flex items-center justify-center">
              <History className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Ainda não tem sessões concluídas
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                O seu histórico aparecerá aqui após as primeiras sessões.
              </p>
            </div>
          </div>
        </FullscreenModal>
      </>
    );
  }

  return (
    <>
      <Card 
        className="group relative overflow-hidden border-0 shadow-custom-sm hover:shadow-custom-md transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-grey/5 opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-green/5 to-accent-sage/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <CardHeader className="relative pb-2 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-green to-accent-sage">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Histórico Rápido
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {mockCompletedSessions.length} sessões concluídas
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative pt-0 pb-4">
          <div className="space-y-3">
            {/* Preview of last 2 sessions */}
            {mockCompletedSessions.slice(0, 2).map((session, index) => {
              const sessionDate = parseISO(session.date);
              
              return (
                <div 
                  key={session.id} 
                  className="flex items-center space-x-3 p-2 rounded-lg bg-gradient-to-r from-slate-grey/5 to-slate-grey/10 border border-slate-grey/10"
                >
                  <Avatar className="w-8 h-8 border border-white shadow-sm">
                    <AvatarImage 
                      src={session.provider.avatar} 
                      alt={session.provider.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-bright-royal to-vibrant-blue text-white text-xs font-semibold">
                      {session.provider.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {session.pillar}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.provider.name}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {format(sessionDate, "dd/MM", { locale: ptBR })}
                  </div>
                </div>
              );
            })}
            
            {mockCompletedSessions.length > 2 && (
              <div className="text-center pt-2">
                <div className="text-xs text-muted-foreground flex items-center justify-center space-x-1">
                  <span>+{mockCompletedSessions.length - 2} mais</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <FullscreenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Histórico de Sessões"
        description="Todas as suas sessões concluídas"
      >
        <div className="space-y-4">
          {mockCompletedSessions.map((session) => {
            const sessionDate = parseISO(session.date);
            
            return (
              <div 
                key={session.id} 
                className="group flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-white to-slate-grey/5 border border-slate-grey/10 hover:shadow-custom-sm transition-all duration-300 hover:border-bright-royal/20"
              >
                <Avatar className="w-12 h-12 border border-white shadow-custom-sm">
                  <AvatarImage 
                    src={session.provider.avatar} 
                    alt={session.provider.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-bright-royal to-vibrant-blue text-white text-sm font-semibold">
                    {session.provider.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-base font-semibold text-foreground">
                    {session.pillar}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session.provider.name}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-slate-grey/10 px-3 py-2 rounded-full group-hover:bg-bright-royal/10 group-hover:text-bright-royal transition-colors duration-300">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">
                    {format(sessionDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </FullscreenModal>
    </>
  );
};
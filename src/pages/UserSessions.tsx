import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, CalendarDays } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockSessions, mockUserBalance, Session, SessionStatus } from "@/data/sessionMockData";
import { mockBookings, getMockBookings } from "@/data/mockData";
import { AppleActivityCard } from "@/components/ui/apple-activity-ring";
import { Progress } from "@/components/ui/progress";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { SessionModal } from "@/components/sessions/SessionModal";
import { GoalsPieChart } from "@/components/ui/goals-pie-chart";
import { cn } from "@/lib/utils";

export default function UserSessions() {
  const navigate = useNavigate();
  const [userBalance] = useState(mockUserBalance);
  const [isPastSessionsModalOpen, setIsPastSessionsModalOpen] = useState(false);
  const [isFutureSessionsModalOpen, setIsFutureSessionsModalOpen] = useState(false);
  
  // Mock user goals data - based on onboarding choices
  const [userGoals] = useState([
    {
      id: '1',
      title: 'Gerir melhor o stress e a ansiedade',
      pillar: 'saude_mental',
      targetSessions: 6,
      completedSessions: 4,
      progressPercentage: 70,
      progressEmojis: ['😟', '🙂', '😄']
    },
    {
      id: '2',
      title: 'Sentir-me mais seguro juridicamente',
      pillar: 'assistencia_juridica',
      targetSessions: 4,
      completedSessions: 2,
      progressPercentage: 45,
      progressEmojis: ['⚪', '⚪', '🔵', '⚪']
    },
    {
      id: '3',
      title: 'Organizar melhor as minhas finanças',
      pillar: 'assistencia_financeira',
      targetSessions: 3,
      completedSessions: 1,
      progressPercentage: 30,
      progressEmojis: ['💸', '💸', '⚪', '⚪']
    },
    {
      id: '4',
      title: 'Melhorar o meu bem-estar físico',
      pillar: 'bem_estar_fisico',
      targetSessions: 5,
      completedSessions: 0,
      progressPercentage: 0,
      progressEmojis: ['⚪', '⚪', '⚪', '⚪', '⚪']
    }
  ]);
  
  // Convert mockBookings to Session format
  const [sessions] = useState<Session[]>(
    getMockBookings().map(booking => ({
      id: booking.id,
      userId: 'user123',
      prestadorId: 'prest123',
      date: booking.date,
      time: booking.time,
      prestadorName: booking.provider_name,
      pillar: booking.pillar as 'saude_mental' | 'assistencia_juridica' | 'assistencia_financeira' | 'bem_estar_fisico',
      status: booking.status as SessionStatus,
      minutes: 60,
      wasDeducted: booking.status === 'completed',
      payerSource: 'company' as const,
      deductedAt: booking.status === 'completed' ? booking.booking_date : undefined,
      createdAt: booking.booking_date,
      updatedAt: booking.booking_date,
      sessionType: 'individual' as const,
      meetingPlatform: (booking.meeting_platform?.includes('Zoom') ? 'zoom' : booking.meeting_platform?.includes('Teams') ? 'teams' : 'google_meet') as 'zoom' | 'google_meet' | 'teams',
      meetingLink: booking.meeting_link
    }))
  );

  // Separate past and future sessions
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
  const pastSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate < now || session.status === 'completed' || session.status === 'cancelled' || session.status === 'no_show';
  });
  
  const futureSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= now && (session.status === 'scheduled' || session.status === 'confirmed');
  });

  // Get summary stats
  const pastSessionsCount = pastSessions.length;
  const futureSessionsCount = futureSessions.length;
  const completedSessionsCount = pastSessions.filter(s => s.status === 'completed').length;


  const handleViewDetails = (sessionId: string) => {
    navigate(`/user/sessions`);
  };

  const handleReschedule = (sessionId: string) => {
    navigate('/user/book');
  };

  const handleCancel = (sessionId: string) => {
    console.log('Cancel session:', sessionId);
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Background that covers main content area */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1600 900\'%3E%3Cdefs%3E%3ClinearGradient id=\'blueGrad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23F0F9FF;stop-opacity:1\' /%3E%3Cstop offset=\'20%25\' style=\'stop-color:%23E0F2FE;stop-opacity:1\' /%3E%3Cstop offset=\'40%25\' style=\'stop-color:%23BAE6FD;stop-opacity:1\' /%3E%3Cstop offset=\'60%25\' style=\'stop-color:%237DD3FC;stop-opacity:1\' /%3E%3Cstop offset=\'80%25\' style=\'stop-color:%2338BDF8;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%230EA5E9;stop-opacity:1\' /%3E%3C/linearGradient%3E%3CradialGradient id=\'highlight\' cx=\'50%25\' cy=\'20%25\' r=\'60%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23FFFFFF;stop-opacity:0.3\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23FFFFFF;stop-opacity:0\' /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width=\'1600\' height=\'900\' fill=\'url(%23blueGrad)\'/%3E%3Crect width=\'1600\' height=\'900\' fill=\'url(%23highlight)\'/%3E%3C/svg%3E")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Percurso</h1>
          <p className="text-muted-foreground">Acompanhe as suas sessões, objetivos e progresso</p>
        </div>

        {/* Goals Pie Chart */}
        <GoalsPieChart goals={userGoals} />

        {/* Quota Display */}
        <AppleActivityCard balance={userBalance} />

            {/* Session Summary Cards */}
        <div className="space-y-4">
              <h2 className="text-xl font-semibold">Resumo das Sessões</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BentoCard
                  name="Sessões Passadas"
                  description=""
                  href="#"
                  cta=""
                  className="aspect-[16/9]"
                  Icon={History}
                  onClick={() => setIsPastSessionsModalOpen(true)}
                  background={
                    <div className="absolute inset-0 flex items-start justify-start p-8">
                      {/* Red gradient image background for past sessions */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
                        style={{
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 300\'%3E%3Cdefs%3E%3ClinearGradient id=\'redGrad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23dc2626;stop-opacity:1\' /%3E%3Cstop offset=\'50%25\' style=\'stop-color:%23ef4444;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23fca5a5;stop-opacity:1\' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'400\' height=\'300\' fill=\'url(%23redGrad)\'/%3E%3C/svg%3E")'
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl"></div>
                      
                      {/* Two-Column Layout - Number Top Left, Content Right */}
                      <div className="relative z-10 flex flex-row justify-between w-full h-full">
                        {/* Left Column - Large Number at Top Left */}
                        <div className="flex items-start justify-start -mt-6">
                          <div className="text-8xl font-bold text-white drop-shadow-lg">{completedSessionsCount}</div>
                        </div>
                        
                        {/* Right Column - All Text Content */}
                        <div className="flex flex-col justify-between h-full flex-1 ml-8">
                          {/* Top Section - Description and Date */}
                          <div className="space-y-4">
                            <p className="text-xl text-white/80 drop-shadow-sm leading-relaxed">
                              {completedSessionsCount > 0 
                                ? 'Veja todas as suas conquistas e o progresso alcançado'
                                : 'Primeira sessão te espera'
                              }
                            </p>
                            
                            {completedSessionsCount > 0 && (
                              <div className="text-xl text-white/90 font-medium">
                                Última conquista: <span className="text-white font-semibold">
                                  {pastSessions.length > 0 ? new Date(pastSessions[0].date).toLocaleDateString('pt-PT') : 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Bottom Section - Single CTA Button */}
                          <div className="flex justify-end">
                            <button className="rounded-full px-6 py-3 text-base font-medium bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-[1.02]">
                              Ver Histórico
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                />
                <BentoCard
                  name="Próximas Sessões"
                  description=""
                  href="#"
                  cta=""
                  className="aspect-[16/9]"
                  Icon={CalendarDays}
                  onClick={() => setIsFutureSessionsModalOpen(true)}
                  background={
                    <div className="absolute inset-0 flex items-start justify-start p-8">
                      {/* Teal/Green gradient image background for future sessions */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
                        style={{
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 300\'%3E%3Cdefs%3E%3ClinearGradient id=\'tealGrad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%230d9488;stop-opacity:1\' /%3E%3Cstop offset=\'50%25\' style=\'stop-color:%2306b6d4;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%2310b981;stop-opacity:1\' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'400\' height=\'300\' fill=\'url(%23tealGrad)\'/%3E%3C/svg%3E")'
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl"></div>
                      
                      {/* Two-Column Layout - Number Top Left, Content Right */}
                      <div className="relative z-10 flex flex-row justify-between w-full h-full">
                        {/* Left Column - Large Number at Top Left */}
                        <div className="flex items-start justify-start -mt-6">
                          <div className="text-8xl font-bold text-white drop-shadow-lg">{futureSessionsCount}</div>
        </div>

                        {/* Right Column - All Text Content */}
                        <div className="flex flex-col justify-between h-full flex-1 ml-8">
                          {/* Top Section - Description and Date */}
                          <div className="space-y-4">
                            <p className="text-xl text-white/80 drop-shadow-sm leading-relaxed">
                              {futureSessionsCount > 0 
                                ? 'Gerencie seus compromissos e continue evoluindo'
                                : 'Dê o primeiro passo rumo ao seu bem-estar'
                              }
                            </p>
                            
                            {futureSessionsCount > 0 && (
                              <div className="text-xl text-white/90 font-medium">
                                Próxima sessão: <span className="text-white font-semibold">
                                  {futureSessions.length > 0 ? new Date(futureSessions[0].date).toLocaleDateString('pt-PT') : 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Bottom Section - Single CTA Button */}
                          <div className="flex justify-end">
                            <button className="rounded-full px-6 py-3 text-base font-medium bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-[1.02]">
                              Ver Sessões
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>


        {/* Motivational Tagline */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground italic">
              Pequenos passos, grandes resultados. O seu bem-estar cresce com cada conquista 💙
            </p>
          </CardContent>
        </Card>

        {/* Session Modals */}
        <SessionModal
          isOpen={isPastSessionsModalOpen}
          onClose={() => setIsPastSessionsModalOpen(false)}
          sessions={pastSessions}
          title="Histórico de Sessões Passadas"
          type="past"
          onViewDetails={handleViewDetails}
        />
        <SessionModal
          isOpen={isFutureSessionsModalOpen}
          onClose={() => setIsFutureSessionsModalOpen(false)}
          sessions={futureSessions}
          title="Próximas Sessões Agendadas"
          type="future"
          onViewDetails={handleViewDetails}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
        />
        </div>
      </div>
    </div>
  );
}
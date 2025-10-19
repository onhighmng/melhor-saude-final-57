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
import { StatisticsCard2 } from "@/components/ui/statistics-card-2";
import { GoalsDisplay } from "@/components/ui/goals-display";
import { QuotaDisplay } from "@/components/ui/quota-display";
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
    <div className="relative w-full min-h-screen bg-gray-50">
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto p-6 pb-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Percurso</h1>
          <p className="text-muted-foreground">Acompanhe as suas sessões, objetivos e progresso</p>
        </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="container mx-auto p-6">
          <div className="space-y-4">
            {/* Top row - Goals (Full Width) */}
            <BentoCard
              name=""
              description=""
              href="#"
              cta=""
              className="w-full"
              background={<div className="absolute inset-0 bg-white" />}
              textColor="text-gray-900"
              descriptionColor="text-gray-600"
              onClick={() => {}}
            >
              <div className="p-4">
                <GoalsDisplay goals={userGoals} />
              </div>
            </BentoCard>

            {/* Middle row - Three equal square cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="aspect-square">
                <BentoCard
                  name="Suas Quotas de Sessões"
                  description="Acompanhe o uso das suas quotas"
                  href="#"
                  cta="Ver detalhes"
                  className="w-full h-full"
                  background={<div className="absolute inset-0 bg-white" />}
                  textColor="text-gray-900"
                  descriptionColor="text-gray-600"
                  onClick={() => {}}
                >
                  <div className="p-4">
                    <QuotaDisplay balance={userBalance} />
                  </div>
                </BentoCard>
              </div>

              <div className="aspect-square">
                <BentoCard
                  name="Histórico de Sessões"
                  description={`${completedSessionsCount} sessões concluídas`}
                  href="#"
                  cta="Ver histórico"
                  className="w-full h-full"
                  Icon={History}
                  background={<div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50" />}
                  iconColor="text-orange-600"
                  textColor="text-gray-900"
                  descriptionColor="text-gray-600"
                  onClick={() => setIsPastSessionsModalOpen(true)}
                />
              </div>

              <div className="aspect-square">
                <BentoCard
                  name="Próximas Sessões"
                  description={`${futureSessionsCount} sessões agendadas`}
                  href="#"
                  cta="Ver sessões"
                  className="w-full h-full"
                  Icon={CalendarDays}
                  background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-sky-50" />}
                  iconColor="text-blue-600"
                  textColor="text-gray-900"
                  descriptionColor="text-gray-600"
                  onClick={() => setIsFutureSessionsModalOpen(true)}
                />
              </div>
            </div>

            {/* Bottom - Quote Card */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="pt-6">
                <p className="text-center text-gray-700 italic">
                  Pequenos passos, grandes resultados. O seu bem-estar cresce com cada conquista 💙
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

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
  );
}
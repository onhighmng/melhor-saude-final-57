import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockSessions, mockUserBalance, Session, SessionStatus } from "@/data/sessionMockData";
import { mockBookings, getMockBookings } from "@/data/mockData";
import { QuotaDisplayCard } from "@/components/sessions/QuotaDisplayCard";
import { SessionHistoryCard } from "@/components/sessions/SessionHistoryCard";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function UserSessions() {
  const navigate = useNavigate();
  const [userBalance] = useState(mockUserBalance);
  
  // Mock user goals data
  const [userGoals] = useState([
    {
      id: '1',
      title: 'Melhorar saúde mental',
      pillar: 'saude_mental',
      targetSessions: 5,
      completedSessions: 3,
      progressPercentage: 60
    },
    {
      id: '2',
      title: 'Resolver questão jurídica',
      pillar: 'assistencia_juridica',
      targetSessions: 3,
      completedSessions: 2,
      progressPercentage: 67
    },
    {
      id: '3',
      title: 'Planeamento financeiro',
      pillar: 'assistencia_financeira',
      targetSessions: 4,
      completedSessions: 1,
      progressPercentage: 25
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

  // Helper function to render skull progress
  const renderSkullProgress = (completed: number, total: number) => {
    return (
      <div className="flex gap-1 items-center">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              index < completed 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            )}
          >
            💀
          </div>
        ))}
      </div>
    );
  };

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
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Percurso</h1>
          <p className="text-muted-foreground">Acompanhe as suas sessões, objetivos e progresso</p>
        </div>

        {/* Goals Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              🎯 Meus Objetivos
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso dos seus objetivos de bem-estar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userGoals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{goal.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {goal.progressPercentage}% alcançado
                  </span>
                </div>
                
                {/* Progress Bar */}
                <Progress value={goal.progressPercentage} className="h-2" />
                
                {/* Skull Icons */}
                <div className="flex items-center justify-between">
                  {renderSkullProgress(goal.completedSessions, goal.targetSessions)}
                  <span className="text-sm text-muted-foreground">
                    {goal.completedSessions}/{goal.targetSessions} sessões completadas
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quota Display */}
        <QuotaDisplayCard balance={userBalance} />

        {/* Sessions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico de Sessões</h2>
          
          {sessions.map((session) => (
            <SessionHistoryCard
              key={session.id}
              session={session}
              onViewDetails={handleViewDetails}
              onReschedule={handleReschedule}
              onCancel={handleCancel}
            />
          ))}
        </div>

        {sessions.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Ainda não tem sessões agendadas
                </p>
                <Button onClick={() => navigate('/user/book')}>Marcar Primeira Sessão</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
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
                
                {/* Session Stats and Emoji Progress */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {goal.completedSessions}/{goal.targetSessions} sessões completadas
                  </span>
                  <div className="flex gap-1">
                    {goal.progressEmojis.map((emoji, index) => (
                      <span key={index} className="text-lg">
                        {emoji}
                      </span>
                    ))}
                  </div>
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

        {/* Motivational Tagline */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground italic">
              Pequenos passos, grandes resultados. O seu bem-estar cresce com cada conquista 💙
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
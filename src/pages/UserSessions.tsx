import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockSessions, mockUserBalance, Session, SessionStatus } from "@/data/sessionMockData";
import { mockBookings } from "@/data/mockData";
import { QuotaDisplayCard } from "@/components/sessions/QuotaDisplayCard";
import { SessionHistoryCard } from "@/components/sessions/SessionHistoryCard";
import { userUIcopy } from "@/data/userUIcopy";

export default function UserSessions() {
  const navigate = useNavigate();
  const [userBalance] = useState(mockUserBalance);
  
  // Convert mockBookings to Session format
  const [sessions] = useState<Session[]>(
    mockBookings.map(booking => ({
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
          <h1 className="text-3xl font-bold text-foreground">{userUIcopy.sessions.title}</h1>
          <p className="text-muted-foreground">{userUIcopy.sessions.subtitle}</p>
        </div>

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
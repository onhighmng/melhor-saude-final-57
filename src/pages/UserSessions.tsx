import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockUserBalance, Session } from "@/data/sessionMockData";
import { QuotaDisplayCard } from "@/components/sessions/QuotaDisplayCard";
import { SessionHistoryCard } from "@/components/sessions/SessionHistoryCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function UserSessions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userBalance] = useState(mockUserBalance);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) return;

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          notes,
          status,
          meeting_link,
          meeting_platform,
          prestador_id,
          prestadores (
            name
          )
        `)
        .eq('user_id', userData.user.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;

      const formattedSessions: Session[] = (bookings || []).map(booking => {
        const bookingDate = new Date(booking.booking_date);
        return {
          id: booking.id,
          userId: userData.user.id,
          prestadorId: booking.prestador_id || '',
          prestadorName: booking.prestadores?.name || 'Prestador',
          date: bookingDate.toISOString().split('T')[0],
          time: bookingDate.toTimeString().slice(0, 5),
          minutes: 50,
          pillar: 'assistencia_juridica',
          status: (booking.status as any) || 'scheduled',
          payerSource: 'personal',
          wasDeducted: booking.status === 'completed',
          deductedAt: booking.status === 'completed' ? bookingDate.toISOString() : undefined,
          createdAt: bookingDate.toISOString(),
          updatedAt: bookingDate.toISOString(),
          meetingPlatform: (booking.meeting_platform as any) || 'zoom',
          meetingLink: booking.meeting_link || undefined,
          sessionType: 'individual',
        };
      });

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Erro ao carregar sessões",
        description: "Não foi possível carregar as sessões.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (sessionId: string) => {
    console.log('View details for session:', sessionId);
  };

  const handleReschedule = (sessionId: string) => {
    console.log('Reschedule session:', sessionId);
  };

  const handleCancel = (sessionId: string) => {
    console.log('Cancel session:', sessionId);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Sessões</h1>
          <p className="text-muted-foreground">
            Histórico e próximas sessões agendadas
          </p>
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
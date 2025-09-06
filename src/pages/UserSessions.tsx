import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { useState } from "react";
import { mockSessions, mockUserBalance } from "@/data/sessionMockData";
import { QuotaDisplayCard } from "@/components/sessions/QuotaDisplayCard";
import { SessionHistoryCard } from "@/components/sessions/SessionHistoryCard";

export default function UserSessions() {
  const [sessions] = useState(mockSessions);
  const [userBalance] = useState(mockUserBalance);

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
                <Button>Marcar Primeira Sessão</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
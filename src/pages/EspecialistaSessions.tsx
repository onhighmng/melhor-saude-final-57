import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Play, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EmptyState } from '@/components/ui/empty-state';

const EspecialistaSessions = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      try {
        // First get the prestador ID for this specialist
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) {
          console.log('[EspecialistaSessions] No prestador found for this user');
          setFilteredSessions([]);
          setLoading(false);
          return;
        }

        // Get ALL bookings for this prestador (not just 'scheduled')
        const { data: sessions } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles(name, email),
            companies(company_name),
            prestadores(name, specialties)
          `)
          .eq('prestador_id', prestador.id)
          .order('booking_date', { ascending: true });

        console.log('[EspecialistaSessions] Loaded sessions:', sessions?.length || 0);
        setFilteredSessions(sessions || []);
      } catch (error) {
        console.error('Error loading sessions:', error);
        setFilteredSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [profile?.id]);

  const handleStartSession = (sessionId: string) => {
    toast({
      title: 'Sessão iniciada',
      description: 'A sessão foi iniciada com sucesso.',
    });
  };

  const handleEndSession = (sessionId: string) => {
    toast({
      title: 'Sessão finalizada',
      description: 'A sessão foi finalizada e a avaliação foi coletada.',
    });
  };

  const getPillarLabel = (pillar: string) => {
    const labels = {
      'psychological': 'Saúde Mental',
      'physical': 'Bem-Estar Físico', 
      'financial': 'Assistência Financeira',
      'legal': 'Assistência Jurídica'
    };
    return labels[pillar as keyof typeof labels] || pillar;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">A carregar sessões...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no sessions
  if (filteredSessions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Sessões Agendadas
          </h1>
          <p className="text-muted-foreground mt-1">Acompanhar sessões agendadas pelos colaboradores</p>
        </div>
        <EmptyState
          icon={Calendar}
          title="Nenhuma sessão agendada"
          description="As sessões agendadas pelos colaboradores que necessitem de acompanhamento aparecerão aqui."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Sessões Agendadas
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir as suas sessões agendadas com utilizadores das empresas atribuídas
        </p>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sessões Agendadas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {filteredSessions.length} sessões agendadas
          </p>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Não há sessões agendadas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div key={session.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h4 className="font-semibold">{session.user_name}</h4>
                      <Badge variant="outline">{session.company_name}</Badge>
                      <Badge variant="secondary">{getPillarLabel(session.pillar)}</Badge>
                      <Badge variant={session.status === 'scheduled' ? 'default' : 'destructive'}>
                        {session.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Data:</strong> {session.date}</p>
                      <p><strong>Horário:</strong> {session.time}</p>
                      <p><strong>Tipo:</strong> {session.type}</p>
                      {session.notes && <p><strong>Notas:</strong> {session.notes}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => handleStartSession(session.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Iniciar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEndSession(session.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Finalizar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EspecialistaSessions;

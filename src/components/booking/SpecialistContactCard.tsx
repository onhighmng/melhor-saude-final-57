import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SpecialistContactCardProps {
  pillar: string;
  context: string;
  sessionId: string;
}

export const SpecialistContactCard = ({ pillar, context, sessionId }: SpecialistContactCardProps) => {
  const { user } = useAuth();

  const phoneNumber = '+351 123 456 789'; // Replace with actual phone number

  const handleCallClick = async () => {
    // Log that user initiated phone escalation
    if (user) {
      await supabase.from('chat_sessions').update({
        status: 'phone_escalated',
        phone_escalation_reason: context
      }).eq('id', sessionId);

      await supabase.from('specialist_call_logs').insert({
        chat_session_id: sessionId,
        user_id: user.id,
        call_status: 'pending'
      });
    }

    // Open phone dialer
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <Card className="p-6 border-primary/20 bg-primary/5 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Consulta Telefónica Detalhada</h3>
            <p className="text-sm text-muted-foreground mb-4">{context}</p>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-primary/20 mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Contacto Direto dos Especialistas
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-primary">{phoneNumber}</p>
                <Button onClick={handleCallClick} size="lg" className="gap-2">
                  <Phone className="h-5 w-5" />
                  Ligar Agora
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-medium">Disponível 24 horas por dia, 7 dias por semana</span>
            </div>
            
            <p className="text-xs text-muted-foreground mt-3 italic">
              Os nossos especialistas irão avaliar a sua situação e, se necessário, agendar uma sessão de vídeo personalizada.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

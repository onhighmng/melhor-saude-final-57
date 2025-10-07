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
    <Card className="p-6 border-primary/20 bg-primary/5">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Phone Consultation Recommended</h3>
            <p className="text-sm text-muted-foreground mb-4">{context}</p>
            <div className="space-y-3">
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-xs text-muted-foreground mb-1">Contact Number</p>
                <p className="text-lg font-semibold">{phoneNumber}</p>
              </div>
              <Button onClick={handleCallClick} className="w-full" size="lg">
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Available 24 hours a day, 7 days a week
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

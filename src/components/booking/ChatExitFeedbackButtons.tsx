import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
interface ChatExitFeedbackButtonsProps {
  sessionId: string;
  pillar: string | null;
  onClose: () => void;
}
export const ChatExitFeedbackButtons = ({
  sessionId,
  pillar,
  onClose
}: ChatExitFeedbackButtonsProps) => {
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleFeedback = async (satisfied: boolean) => {
    setIsSubmitting(true);
    try {
      // 1. Update chat session satisfaction
      await supabase.from('chat_sessions').update({
        satisfaction_rating: satisfied ? 'satisfied' : 'unsatisfied',
        status: 'resolved',
        ended_at: new Date().toISOString()
      }).eq('id', sessionId);

      // 2. If unsatisfied, create specialist notification
      if (!satisfied && pillar) {
        // Find specialist assigned to this pillar
        const {
          data: specialists
        } = await supabase.from('prestadores').select('user_id').contains('pillar_specialties', [pillar]).eq('is_active', true).limit(1);
        if (specialists && specialists.length > 0) {
          await supabase.from('notifications').insert({
            user_id: specialists[0].user_id,
            type: 'chat_escalation',
            title: 'Escalação de Chat',
            message: 'Um utilizador precisa de assistência especializada',
            metadata: {
              chat_session_id: sessionId,
              pillar,
              reason: 'user_unsatisfied'
            }
          });
        }
      }
      toast({
        title: 'Feedback Enviado',
        description: satisfied ? 'Obrigado pelo seu feedback!' : 'Um especialista entrará em contato consigo em breve'
      });
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Erro ao enviar feedback',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Foi orientado para o pilar certo do bem-estar?</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 py-4">
          <Button onClick={() => handleFeedback(true)} disabled={isSubmitting} className="w-full h-auto py-6 text-lg" variant="default">
            😊 Fiquei satisfeito
          </Button>
          
          <Button onClick={() => handleFeedback(false)} disabled={isSubmitting} className="w-full h-auto py-6 text-lg" variant="outline">
            😞 Preciso de mais ajuda
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};
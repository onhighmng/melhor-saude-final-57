import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('user');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (satisfied: boolean) => {
    setIsSubmitting(true);
    
    try {
      // 1. Update chat session satisfaction
      await supabase
        .from('chat_sessions')
        .update({ 
          satisfaction_rating: satisfied ? 'satisfied' : 'unsatisfied',
          status: 'resolved',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      // 2. If unsatisfied, create specialist notification
      if (!satisfied && pillar) {
        // Find specialist assigned to this pillar
        const { data: specialists } = await supabase
          .from('prestadores')
          .select('user_id')
          .contains('pillar_specialties', [pillar])
          .eq('is_active', true)
          .limit(1);

        if (specialists && specialists.length > 0) {
          await supabase.from('notifications').insert({
            user_id: specialists[0].user_id,
            type: 'chat_escalation',
            title: t('notifications.chatEscalation.title'),
            message: t('notifications.chatEscalation.message'),
            metadata: { 
              chat_session_id: sessionId, 
              pillar,
              reason: 'user_unsatisfied'
            }
          });
        }
      }

      toast({
        title: t('toasts.feedbackSubmitted'),
        description: satisfied 
          ? t('toasts.thankYouFeedback') 
          : t('toasts.specialistNotified')
      });

      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: t('errors.feedbackFailed'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('universalChat.exit.title')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Button
            onClick={() => handleFeedback(true)}
            disabled={isSubmitting}
            className="w-full h-auto py-6 text-lg"
            variant="default"
          >
            😊 Sim
          </Button>
          
          <Button
            onClick={() => handleFeedback(false)}
            disabled={isSubmitting}
            className="w-full h-auto py-6 text-lg"
            variant="outline"
          >
            😞 Não
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

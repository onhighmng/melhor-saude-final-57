import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SmilePlus, Frown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ChatExitFeedbackProps {
  sessionId: string;
  onClose: () => void;
}

export const ChatExitFeedback = ({ sessionId, onClose }: ChatExitFeedbackProps) => {
  const [selectedRating, setSelectedRating] = useState<'satisfied' | 'unsatisfied' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (!selectedRating) return;

    setIsSubmitting(true);

    try {
      // Update session with satisfaction rating
      await supabase
        .from('chat_sessions')
        .update({
          satisfaction_rating: selectedRating,
          status: 'resolved',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      // If unsatisfied, create a specialist alert
      if (selectedRating === 'unsatisfied') {
        const { data: session } = await supabase
          .from('chat_sessions')
          .select('user_id, pillar')
          .eq('id', sessionId)
          .single();

        if (session) {
          await supabase.from('specialist_call_logs').insert({
            chat_session_id: sessionId,
            user_id: session.user_id,
            call_status: 'pending'
          });

          toast({
            title: 'Feedback Recebido',
            description: 'Um especialista irá contactá-lo em breve para fornecer apoio adicional.',
          });
        }
      } else {
        toast({
          title: 'Obrigado!',
          description: 'Agradecemos o seu feedback!',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível submeter o feedback. Por favor, tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Como foi a sua experiência?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedRating === 'satisfied' ? 'default' : 'outline'}
              size="lg"
              className="h-32 flex flex-col gap-2"
              onClick={() => setSelectedRating('satisfied')}
            >
              <SmilePlus className="h-12 w-12" />
              <span className="text-lg">{t('user:universalChat.exit.satisfied')}</span>
            </Button>

            <Button
              variant={selectedRating === 'unsatisfied' ? 'default' : 'outline'}
              size="lg"
              className="h-32 flex flex-col gap-2"
              onClick={() => setSelectedRating('unsatisfied')}
            >
              <Frown className="h-12 w-12" />
              <span className="text-lg">{t('user:universalChat.exit.unsatisfied')}</span>
            </Button>
          </div>

          {selectedRating === 'unsatisfied' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('user:universalChat.exit.improvementLabel')}
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t('user:universalChat.exit.improvementPlaceholder')}
                rows={3}
              />
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedRating || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'A submeter...' : 'Submeter Feedback'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

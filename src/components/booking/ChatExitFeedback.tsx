import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SmilePlus, Frown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatExitFeedbackProps {
  sessionId: string;
  onClose: () => void;
}

export const ChatExitFeedback = ({ sessionId, onClose }: ChatExitFeedbackProps) => {
  const [selectedRating, setSelectedRating] = useState<'satisfied' | 'unsatisfied' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedRating) return;

    setIsSubmitting(true);

    try {
      // Get current session status first
      const { data: currentSession } = await supabase
        .from('chat_sessions')
        .select('status')
        .eq('id', sessionId)
        .single();

      // Update session with satisfaction rating
      // IMPORTANT: Don't override phone_escalated status - keep it so specialists can see it
      await supabase
        .from('chat_sessions')
        .update({
          satisfaction_rating: selectedRating,
          // Only set to resolved if it wasn't escalated
          status: currentSession?.status === 'phone_escalated' ? 'phone_escalated' : 'resolved',
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
          // Create call log entry using direct insert (bypasses type checking for missing table definition)
          const { error: callLogError } = await supabase
            .from('specialist_call_logs' as any)
            .insert({
              chat_session_id: sessionId,
              user_id: session.user_id,
              call_status: 'pending'
            });

          if (callLogError) {
            console.error('Failed to create call log:', callLogError);
          }

          toast({
            title: 'Feedback Recebido',
            description: 'Um especialista entrará em contacto consigo em breve',
          });
        }
      } else {
        toast({
          title: 'Obrigado!',
          description: 'O seu feedback foi enviado com sucesso',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o feedback. Tente novamente.',
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
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={selectedRating === 'satisfied' ? 'default' : 'outline'}
              className="h-24 flex flex-col gap-2"
              onClick={() => setSelectedRating('satisfied')}
            >
              <SmilePlus className="h-8 w-8" />
              <span>Satisfeito</span>
            </Button>

            <Button
              variant={selectedRating === 'unsatisfied' ? 'default' : 'outline'}
              className="h-24 flex flex-col gap-2"
              onClick={() => setSelectedRating('unsatisfied')}
            >
              <Frown className="h-8 w-8" />
              <span>Preciso de ajuda</span>
            </Button>
          </div>

          {selectedRating === 'unsatisfied' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Diga-nos mais sobre o que precisa (opcional)
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Descreva brevemente como podemos ajudar..."
                rows={4}
              />
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedRating || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                A enviar...
              </>
            ) : (
              'Enviar Feedback'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

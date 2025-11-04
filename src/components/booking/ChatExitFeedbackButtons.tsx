import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFeedback = async (satisfied: boolean) => {
    setIsSubmitting(true);
    try {
      // Get session details first (including current status)
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('user_id, pillar, status')
        .eq('id', sessionId)
        .single();

      // Update chat session
      // IMPORTANT: Don't override phone_escalated status - keep it so specialists can see it
      await supabase.from('chat_sessions').update({
        satisfaction_rating: satisfied ? 'satisfied' : 'unsatisfied',
        // Only set to resolved if it wasn't escalated
        status: session?.status === 'phone_escalated' ? 'phone_escalated' : 'resolved',
        ended_at: new Date().toISOString()
      }).eq('id', sessionId);

      if (!satisfied && session) {
        // AUTOMATICALLY create call request in specialist_call_logs
        await supabase.from('specialist_call_logs').insert({
          chat_session_id: sessionId,
          user_id: session.user_id,
          call_status: 'pending'
        });

        // Also create notification for specialist
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
            title: 'Escalação de Chat',
            message: 'Um utilizador precisa de assistência especializada',
            metadata: {
              chat_session_id: sessionId,
              pillar,
              reason: 'user_unsatisfied'
            }
          });
        }

        toast({
          title: 'Pedido Registado',
          description: 'Um especialista entrará em contacto consigo em breve'
        });
      } else {
        toast({
          title: 'Obrigado pelo seu feedback!',
          description: 'Esperamos ter ajudado'
        });
      }

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
  
  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-full w-full h-screen max-h-screen border-0 p-0 flex items-center justify-center bg-black/90"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center gap-8 p-8 max-w-2xl w-full">
          {/* Title */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Como foi a sua experiência?
            </h2>
            <p className="text-lg md:text-xl text-gray-300">
              O seu feedback ajuda-nos a melhorar
            </p>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Button
              onClick={() => handleFeedback(true)}
              disabled={isSubmitting}
              className="h-auto py-12 px-8 flex flex-col items-center gap-4 bg-green-600 hover:bg-green-700 text-white border-0 rounded-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              variant="default"
            >
              {isSubmitting ? (
                <Loader2 className="w-24 h-24 animate-spin" />
              ) : (
                <>
                  <span className="text-8xl">😊</span>
                  <span className="text-2xl font-semibold">Sim, resolvido!</span>
                </>
              )}
            </Button>

            <Button
              onClick={() => handleFeedback(false)}
              disabled={isSubmitting}
              className="h-auto py-12 px-8 flex flex-col items-center gap-4 bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              variant="default"
            >
              {isSubmitting ? (
                <Loader2 className="w-24 h-24 animate-spin" />
              ) : (
                <>
                  <span className="text-8xl">😞</span>
                  <span className="text-2xl font-semibold">Preciso de ajuda</span>
                </>
              )}
            </Button>
          </div>

          {/* Info text */}
          {!isSubmitting && (
            <p className="text-center text-sm text-gray-400 max-w-md">
              Ao clicar em "Preciso de ajuda", um especialista entrará automaticamente em contacto consigo
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
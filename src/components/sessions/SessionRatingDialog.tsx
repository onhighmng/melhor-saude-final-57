import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RatingScaleGroup, RatingScaleItem } from "@/components/ui/rating-scale-group";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { userToastMessages } from "@/data/userToastMessages";
import { supabase } from "@/integrations/supabase/client";

interface SessionRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  pillarName: string;
}

export function SessionRatingDialog({ 
  open, 
  onOpenChange, 
  sessionId,
  pillarName 
}: SessionRatingDialogProps) {
  const [rating, setRating] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: "Avaliação incompleta",
        description: "Por favor, selecione uma classificação",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get booking to get user_id
      const { data: booking, error: bookingFetchError } = await supabase
        .from('bookings')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (bookingFetchError || !booking) throw bookingFetchError;

      // Convert 10-point scale to 5-point scale for database
      const convertedRating = Math.ceil(parseInt(rating) / 2);

      // Update booking with rating and feedback
      const { error } = await supabase
        .from('bookings')
        .update({
          rating: convertedRating,
          feedback: comments || null
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Also insert feedback record for tracking
      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert({
          user_id: booking.user_id,
          booking_id: sessionId,
          rating: convertedRating,
          message: comments || 'Sem comentários adicionais',
          status: 'new',
          category: 'session_rating'
        });

      if (feedbackError) throw feedbackError;

      toast({
        title: userToastMessages.success.feedbackSubmitted,
        description: `Classificação: ${rating}/10`
      });

      onOpenChange(false);
      
      // Reset form
      setRating("");
      setComments("");
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Avaliar Sessão - {pillarName}</DialogTitle>
          <DialogDescription>
            A sua opinião ajuda-nos a melhorar continuamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Numa escala de 1 a 10, até que ponto sente que compreende melhor os seus direitos e se sente mais seguro juridicamente após esta sessão?
            </Label>
            
            <RatingScaleGroup value={rating} onValueChange={setRating}>
              {Array.from({ length: 10 }).map((_, i) => (
                <RatingScaleItem 
                  key={i} 
                  value={(i + 1).toString()} 
                  label={(i + 1).toString()} 
                />
              ))}
            </RatingScaleGroup>

            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Pouco seguro 😞</span>
              <span>Muito seguro 🤩</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">
              Comentários adicionais (opcional)
            </Label>
            <Textarea
              id="comments"
              placeholder="Partilhe a sua experiência com mais detalhes..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !rating}
          >
            {isSubmitting ? "A enviar..." : "Enviar Avaliação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

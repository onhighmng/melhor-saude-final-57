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
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { userToastMessages } from "@/data/userToastMessages";

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
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Avaliação incompleta",
        description: "Por favor, selecione uma classificação",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Session rating submitted:', {
      sessionId,
      rating,
      comments
    });

    toast({
      title: userToastMessages.success.feedbackSubmitted,
      description: `Classificação: ${rating}/10`
    });

    setIsSubmitting(false);
    onOpenChange(false);
    
    // Reset form
    setRating(0);
    setComments("");
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
            
            <div className="flex items-center justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      star <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Classificação: {rating}/10
              </p>
            )}
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
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "A enviar..." : "Enviar Avaliação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

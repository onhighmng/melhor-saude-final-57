import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/dateFormatting';

interface RatingProps {
  sessionId: string;
  prestadorId: string;
  prestadorName: string;
  sessionDate: string;
  onRatingSubmit?: (rating: number, comment: string) => void;
  onClose?: () => void;
  existingRating?: number;
  existingComment?: string;
  disabled?: boolean;
}

export const Rating = ({ 
  sessionId, 
  prestadorId, 
  prestadorName, 
  sessionDate, 
  onRatingSubmit,
  onClose,
  existingRating,
  existingComment,
  disabled = false
}: RatingProps) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(existingRating || 0);
  const [comment, setComment] = useState(existingComment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleStarClick = (rating: number) => {
    if (disabled) return;
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      toast({
        title: 'Classificação Obrigatória',
        description: 'Por favor, selecione uma classificação',
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onRatingSubmit?.(selectedRating, comment);
      toast({
        title: 'Avaliação Enviada',
        description: 'Obrigado pelo seu feedback',
      });
      // Close the rating component after successful submission
      onClose?.();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao submeter avaliação',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white/50 backdrop-blur-sm">
      <div>
        <h4 className="font-medium text-navy-blue mb-2">
          Avalie a sessão com {prestadorName}
        </h4>
        <p className="text-sm text-navy-blue/70">
          Data: {formatDate(sessionDate)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              star <= (hoveredStar || selectedRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            } ${disabled ? 'cursor-not-allowed' : ''}`}
            onMouseEnter={() => !disabled && setHoveredStar(star)}
            onMouseLeave={() => !disabled && setHoveredStar(0)}
            onClick={() => handleStarClick(star)}
          />
        ))}
        {selectedRating > 0 && (
          <span className="ml-2 text-sm font-medium text-navy-blue">
            {selectedRating} {selectedRating !== 1 ? 'estrelas' : 'estrela'}
          </span>
        )}
      </div>

      <div>
        <Textarea
          placeholder="Adicione um comentário (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={disabled}
          className="min-h-[80px]"
        />
      </div>

      {!disabled && (
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedRating === 0}
            className="bg-emerald-green hover:bg-emerald-green/90 hover:text-white text-white"
          >
            {isSubmitting ? 'A enviar...' : 'Enviar Avaliação'}
          </Button>
          {existingRating && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRating(existingRating);
                setComment(existingComment || '');
              }}
            >
              Cancelar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
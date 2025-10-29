import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('user');

  const handleStarClick = (rating: number) => {
    if (disabled) return;
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      toast({
        title: t('rating.required'),
        description: t('rating.requiredDescription'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onRatingSubmit?.(selectedRating, comment);
      toast({
        title: t('rating.submitted'),
        description: t('rating.submittedDescription'),
      });
      // Close the rating component after successful submission
      onClose?.();
    } catch (error) {
      toast({
        title: t('rating.error'),
        description: t('rating.errorDescription'),
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
          {t('rating.rateSession')} {prestadorName}
        </h4>
        <p className="text-sm text-navy-blue/70">
          {t('rating.date')} {formatDate(sessionDate)}
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
            {selectedRating} {selectedRating !== 1 ? t('rating.stars') : t('rating.star')}
          </span>
        )}
      </div>

      <div>
        <Textarea
          placeholder={t('rating.commentPlaceholder')}
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
            {isSubmitting ? t('rating.submitting') : t('rating.submitRating')}
          </Button>
          {existingRating && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRating(existingRating);
                setComment(existingComment || '');
              }}
            >
              {t('rating.cancel')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
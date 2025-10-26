import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { TagSelector } from "./TagSelector";
import { useTranslation } from 'react-i18next';
import { Session } from "@/data/sessionMockData";

interface FeedbackFormProps {
  session: Session;
  onSubmit: (feedback: FeedbackData) => void;
  onSkip: () => void;
}

export interface FeedbackData {
  rating: number;
  comment: string;
  tags: string[];
  category?: string;
}

export function FeedbackForm({ session, onSubmit, onSkip }: FeedbackFormProps) {
  const { t } = useTranslation('user');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };
  
  const handleSubmit = () => {
    if (rating === 0) {
      alert(t('feedback.ratingRequired'));
      return;
    }
    
    onSubmit({
      rating,
      comment,
      tags: selectedTags,
    });
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('feedback.title')}</CardTitle>
        <CardDescription>{t('feedback.subtitle')}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Session Details */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-1">{session.prestadorName}</h4>
          <p className="text-sm text-muted-foreground">
            {new Date(session.date).toLocaleDateString('pt-PT')} • {session.time}
          </p>
        </div>
        
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('feedback.ratingLabel')}</label>
          <div className="flex justify-center py-2">
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>
        </div>
        
        {/* Tags */}
        <TagSelector selectedTags={selectedTags} onTagToggle={handleTagToggle} />
        
        {/* Comment */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('feedback.commentLabel')}</label>
          <Textarea
            placeholder={t('feedback.placeholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSubmit} className="flex-1" disabled={rating === 0}>
            {t('feedback.ctaSubmit')}
          </Button>
          <Button onClick={onSkip} variant="ghost">
            {t('feedback.ctaSkip')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

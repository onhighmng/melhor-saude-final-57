import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { FeedbackForm, FeedbackData } from "@/components/feedback/FeedbackForm";
import { useTranslation } from 'react-i18next';
import { userToastMessages } from "@/data/userToastMessages";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeInput } from '@/utils/sanitize';
import { logErrorSecurely, getGenericErrorMessage } from '@/utils/errorHandling';

export default function UserFeedback() {
  const { t } = useTranslation('user');
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Find the session from real bookings
  const [session, setSession] = useState<any>(null);
  
  useEffect(() => {
    if (sessionId && user) {
      supabase.from('bookings')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => setSession(data));
    }
  }, [sessionId, user]);
  
  const handleSubmit = async (feedback: FeedbackData) => {
    try {
      await supabase.from('feedback').insert({
        user_id: user?.id,
        booking_id: sessionId,
        category: feedback.category,
        message: sanitizeInput(feedback.comment),
        rating: feedback.rating
      });

      // Track feedback in user_progress
      if (user?.id && session?.pillar) {
        await supabase.from('user_progress').insert({
          user_id: user.id,
          pillar: session.pillar,
          action_type: 'feedback_given',
          action_date: new Date().toISOString(),
          metadata: {
            booking_id: sessionId,
            rating: feedback.rating,
            category: feedback.category
          }
        });
      }
      
      toast.success(userToastMessages.success.feedbackSubmitted);
      
      setTimeout(() => {
        navigate('/user/sessions');
      }, 2000);
    } catch (error: any) {
      logErrorSecurely(error, 'submitting_feedback');
      toast.error(getGenericErrorMessage('creating'));
    }
  };
  
  const handleSkip = () => {
    navigate('/user/dashboard');
  };
  
  if (!session) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('feedback.title')}
          icon={Star}
          showBackButton
          backUrl="/user/sessions"

        />
        
        <div className="max-w-2xl mx-auto px-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Sessão não encontrada</p>
              <Button onClick={() => navigate('/user/sessions')}>
                {t('feedback.ctaViewSessions')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('feedback.title')}
        subtitle={t('feedback.subtitle')}
        icon={Star}
        showBackButton
        backUrl="/user/sessions"

      />
      
      <div className="max-w-2xl mx-auto px-6">
        <FeedbackForm
          session={session}
          onSubmit={handleSubmit}
          onSkip={handleSkip}

        />
      </div>
    </div>
  );
}

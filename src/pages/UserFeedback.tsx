import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { FeedbackForm, FeedbackData } from "@/components/feedback/FeedbackForm";
import { useTranslation } from 'react-i18next';
import { userToastMessages } from "@/data/userToastMessages";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { mockSessions } from "@/data/sessionMockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function UserFeedback() {
  const { t } = useTranslation('user');
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  // Find the session
  const session = mockSessions.find(s => s.id === sessionId);
  
  const handleSubmit = (feedback: FeedbackData) => {
    console.log('Feedback submitted:', feedback);
    toast.success(userToastMessages.success.feedbackSubmitted);
    
    // Show success screen
    setTimeout(() => {
      navigate('/user/sessions');
    }, 2000);
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

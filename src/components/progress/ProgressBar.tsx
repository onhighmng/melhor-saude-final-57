import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, MessageSquare, BookOpen, Calendar, Star } from 'lucide-react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useAuth } from '@/contexts/AuthContext';
import { useUserMilestones } from '@/hooks/useUserMilestones';
import { MilestoneBadge } from './MilestoneBadge';
import { useTranslation } from 'react-i18next';

export const ProgressBar = () => {
  const { user } = useAuth();
  const { metrics, isLoading } = useUserProgress(user?.id);
  const { milestones: feedbackMilestones } = useUserMilestones(user?.id);
  const { t } = useTranslation('user');

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-2 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  const totalActions = metrics.totalSessions + metrics.chatInteractions + metrics.resourcesViewed;
  const progressPercent = Math.min((totalActions / 10) * 100, 100);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t('progress.title')}
          </h3>
          <span className="text-sm text-muted-foreground">
            {totalActions} {t('progress.actions')}
          </span>
        </div>

        <Progress value={progressPercent} className="h-2" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{t('progress.metrics.sessions')}</p>
              <p className="text-lg font-semibold">{metrics.totalSessions}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{t('progress.metrics.chats')}</p>
              <p className="text-lg font-semibold">{metrics.chatInteractions}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{t('progress.metrics.resources')}</p>
              <p className="text-lg font-semibold">{metrics.resourcesViewed}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{t('progress.metrics.activeDays')}</p>
              <p className="text-lg font-semibold">{metrics.activeDays}</p>
            </div>
          </div>
        </div>

        {metrics.pillars.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">{t('progress.metrics.activePillars')}</p>
            <div className="flex flex-wrap gap-2">
              {metrics.pillars.map((pillar) => (
                <span
                  key={pillar}
                  className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs capitalize"
                >
                  {pillar.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Milestones */}
        <div className="pt-4 border-t">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            {t('milestones.feedbackMilestones.title')}
          </p>
          
          <div className="space-y-2">
            <MilestoneBadge
              label={t('milestones.feedbackMilestones.firstFeedback')}
              completed={feedbackMilestones.firstFeedbackGiven}
            />
            <MilestoneBadge
              label={t('milestones.feedbackMilestones.improvement')}
              completed={feedbackMilestones.feedbackImprovement}
            />
          </div>
          
          <Progress value={feedbackMilestones.feedbackProgress} className="h-2 mt-3" />
        </div>
      </div>
    </Card>
  );
};

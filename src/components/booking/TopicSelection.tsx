import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { getTopicsForPillar, Topic } from '@/data/topicsData';
import * as LucideIcons from 'lucide-react';

interface TopicSelectionProps {
  pillar: string;
  selectedTopic: string | null;
  onTopicSelect: (topicId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const TopicSelection = ({ 
  pillar, 
  selectedTopic, 
  onTopicSelect, 
  onBack, 
  onNext 
}: TopicSelectionProps) => {
  const { t } = useTranslation(['user', 'common']);
  const topics = getTopicsForPillar(pillar);

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-6 w-6" /> : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('common:actions.back')}
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{t('user:booking.directFlow.selectTopic')}</h2>
          <p className="text-sm text-muted-foreground">{t('user:booking.directFlow.topicSubtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic: Topic) => (
          <Card
            key={topic.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTopic === topic.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onTopicSelect(topic.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  {getIcon(topic.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {t(`user:topics.${pillar}.${topic.id}.name`)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`user:topics.${pillar}.${topic.id}.description`)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          onClick={onNext}
          disabled={!selectedTopic}
          size="lg"
        >
          {t('common:actions.continue')}
        </Button>
      </div>
    </div>
  );
};

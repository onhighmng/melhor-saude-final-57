import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { legalTopics } from '@/types/legalAssessment';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TopicSelectionProps {
  selectedTopics: string[];
  onTopicToggle: (topicId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const TopicSelection: React.FC<TopicSelectionProps> = ({
  selectedTopics,
  onTopicToggle,
  onNext,
  onBack
}) => {
  const { t } = useTranslation(['common', 'user']);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('common:actions.back')}
          </Button>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              {t('user:legal.topicSelection.title')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('user:legal.topicSelection.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {legalTopics.map((topic) => (
              <Card
                key={topic.id}
                className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTopics.includes(topic.id)
                    ? 'border-primary border-2 bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onTopicToggle(topic.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-6xl leading-none">{topic.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-2 text-foreground">{t(`user:legal.topics.${topic.id}.title`)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(`user:legal.topics.${topic.id}.description`)}</p>
                  </div>
                  {selectedTopics.includes(topic.id) && (
                    <div className="flex-shrink-0 text-primary text-2xl font-bold">✓</div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={onNext}
              disabled={selectedTopics.length === 0}
              size="lg"
              className="min-w-[200px] text-base"
            >
              {t('common:actions.continue')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicSelection;

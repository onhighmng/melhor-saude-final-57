import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { legalTopics } from '@/types/legalAssessment';

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
  return (
    <div className="min-h-screen bg-soft-white">
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6"
          >
            ← Voltar
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy-blue mb-3">
              Qual área jurídica você precisa de ajuda?
            </h1>
            <p className="text-royal-blue">
              Selecione uma ou mais áreas relacionadas à sua situação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {legalTopics.map((topic) => (
              <Card
                key={topic.id}
                className={`p-6 cursor-pointer transition-all duration-200 ${
                  selectedTopics.includes(topic.id)
                    ? 'border-primary border-2 bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onTopicToggle(topic.id)}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{topic.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </div>
                  {selectedTopics.includes(topic.id) && (
                    <div className="text-primary text-xl">✓</div>
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
              className="min-w-[200px]"
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicSelection;

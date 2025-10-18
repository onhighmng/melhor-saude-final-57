import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { getTopicsForPillar, Topic } from '@/data/topicsData';
import { BookingPillar } from './BookingFlow';
import { getTopicPillarId } from '@/utils/pillarMapping';
import * as LucideIcons from 'lucide-react';

interface TopicSelectionProps {
  pillar: BookingPillar;
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
  // Convert BookingPillar to topic pillar ID for data lookup
  const topicPillarId = getTopicPillarId(pillar);
  const topics = getTopicsForPillar(topicPillarId);

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
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Selecione o Tópico</h2>
          <p className="text-sm text-muted-foreground">O que gostaria de abordar na sessão?</p>
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
                    {topic.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {topic.description}
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
          className="hover:text-white"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

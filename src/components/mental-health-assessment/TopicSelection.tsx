import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
interface TopicSelectionProps {
  selectedTopics: string[];
  onTopicToggle: (topicId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const mentalHealthTopicsData = [
  {
    id: 'anxiety',
    emoji: '😰',
    title: 'Ansiedade',
    description: 'Preocupação excessiva, nervosismo, tensão constante'
  },
  {
    id: 'depression',
    emoji: '😔',
    title: 'Depressão',
    description: 'Tristeza profunda, falta de motivação, desânimo'
  },
  {
    id: 'stress',
    emoji: '😫',
    title: 'Estresse',
    description: 'Pressão no trabalho, sobrecarga, esgotamento'
  },
  {
    id: 'relationships',
    emoji: '💔',
    title: 'Relacionamentos',
    description: 'Conflitos familiares, problemas amorosos, isolamento social'
  },
  {
    id: 'self-esteem',
    emoji: '🪞',
    title: 'Autoestima',
    description: 'Insegurança, baixa confiança, autocrítica'
  },
  {
    id: 'trauma',
    emoji: '🌪️',
    title: 'Trauma',
    description: 'Experiências difíceis do passado, luto, perdas'
  }
];

const TopicSelection: React.FC<TopicSelectionProps> = ({
  selectedTopics,
  onTopicToggle,
  onNext,
  onBack
}) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
      
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          O que gostaria de abordar?
        </h1>
        <p className="text-lg text-muted-foreground">
          Selecione uma ou mais áreas que gostaria de trabalhar
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {mentalHealthTopicsData.map((topic) => {
          const isSelected = selectedTopics.includes(topic.id);
          
          return (
            <Card
              key={topic.id}
              className={`p-6 cursor-pointer transition-all border-2 ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onTopicToggle(topic.id)}
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl flex-shrink-0">
                  {topic.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-serif font-semibold text-xl mb-2">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={onNext}
          disabled={selectedTopics.length === 0}
          size="lg"
          className="min-w-[200px] bg-primary hover:bg-primary/90 hover:text-white text-white rounded-lg"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default TopicSelection;

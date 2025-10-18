import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
interface TopicSelectionProps {
  selectedTopics: string[];
  onTopicToggle: (topicId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const physicalWellnessTopicsData = [
  {
    id: 'nutrition',
    emoji: '🥗',
    title: 'Nutrição',
    description: 'Alimentação saudável, dietas, controle de peso'
  },
  {
    id: 'exercise',
    emoji: '🏃',
    title: 'Exercício Físico',
    description: 'Treino, atividade física, condicionamento'
  },
  {
    id: 'sleep',
    emoji: '😴',
    title: 'Sono',
    description: 'Qualidade do sono, insónia, rotina de descanso'
  },
  {
    id: 'chronic-pain',
    emoji: '🩹',
    title: 'Dor Crónica',
    description: 'Dores persistentes, lesões, reabilitação'
  },
  {
    id: 'preventive-health',
    emoji: '🏥',
    title: 'Saúde Preventiva',
    description: 'Check-ups, exames, prevenção de doenças'
  },
  {
    id: 'lifestyle',
    emoji: '🌱',
    title: 'Estilo de Vida',
    description: 'Hábitos saudáveis, tabagismo, álcool'
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
        <Button variant="ghost" onClick={onBack}>
          Voltar
        </Button>
      </div>
      
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          O que gostaria de melhorar?
        </h1>
        <p className="text-lg text-muted-foreground">
          Selecione uma ou mais áreas de bem-estar físico
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {physicalWellnessTopicsData.map((topic) => {
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

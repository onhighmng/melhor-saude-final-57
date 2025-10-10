import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TopicSelectionProps {
  selectedTopics: string[];
  onTopicToggle: (topicId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const financialAssistanceTopicsData = [
  {
    id: 'budgeting',
    emoji: '💰',
    title: 'Orçamento Pessoal',
    description: 'Gestão de despesas, poupança, controlo financeiro'
  },
  {
    id: 'debt',
    emoji: '💳',
    title: 'Gestão de Dívidas',
    description: 'Créditos, empréstimos, renegociação de dívidas'
  },
  {
    id: 'investments',
    emoji: '📈',
    title: 'Investimentos',
    description: 'Como começar a investir, fundos, ações'
  },
  {
    id: 'retirement',
    emoji: '🏖️',
    title: 'Reforma',
    description: 'Planeamento de reforma, pensões, poupança a longo prazo'
  },
  {
    id: 'taxes',
    emoji: '🧾',
    title: 'Impostos',
    description: 'IRS, declarações, otimização fiscal'
  },
  {
    id: 'emergency-fund',
    emoji: '🛡️',
    title: 'Fundo de Emergência',
    description: 'Criar reserva financeira, segurança financeira'
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
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          Como podemos ajudar com suas finanças?
        </h1>
        <p className="text-lg text-muted-foreground">
          Selecione uma ou mais áreas que você gostaria de melhorar
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {financialAssistanceTopicsData.map((topic) => {
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
          className="min-w-[200px] bg-primary hover:bg-primary/90 text-white rounded-lg"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default TopicSelection;

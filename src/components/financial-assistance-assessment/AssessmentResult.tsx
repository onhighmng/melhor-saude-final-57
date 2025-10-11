import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AssessmentResultProps {
  selectedTopics: string[];
  selectedSymptoms: string[];
  additionalNotes?: string;
  onStartChat: () => void;
  onBack: () => void;
}

const topicLabels: Record<string, { emoji: string; title: string }> = {
  'budgeting': { emoji: '💰', title: 'Orçamento Pessoal' },
  'debt': { emoji: '💳', title: 'Gestão de Dívidas' },
  'investments': { emoji: '💵', title: 'Poupança e Investimentos' },
  'housing': { emoji: '🏠', title: 'Financiamento Imobiliário' },
  'education': { emoji: '🎓', title: 'Planeamento de Educação' },
  'credit': { emoji: '🔄', title: 'Crédito e Empréstimos' }
};

const symptomLabels: Record<string, string> = {
  'spending-control': 'Dificuldade em controlar gastos mensais',
  'growing-debt': 'Endividamento crescente',
  'no-savings': 'Falta de poupança ou reserva de emergência',
  'credit-confusion': 'Não entendo minhas opções de crédito',
  'financial-worry': 'Preocupação com o futuro financeiro',
  'bad-credit': 'Problemas com negativação ou score baixo',
  'investment-desire': 'Desejo de investir mas não sei por onde começar',
  'impulsive-spending': 'Gastos impulsivos frequentes'
};

const AssessmentResult: React.FC<AssessmentResultProps> = ({
  selectedTopics,
  selectedSymptoms,
  additionalNotes,
  onStartChat,
  onBack
}) => {
  const { t } = useTranslation('user');
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="flex items-center gap-2 text-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('booking.back')}
      </Button>

      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          {t('booking.financialAssistance.result.title')}
        </h1>
        <p className="text-lg text-primary">
          {t('booking.financialAssistance.result.subtitle')}
        </p>
      </div>

      <Card className="p-8 border-2">
        <h2 className="text-xl font-serif font-semibold mb-6 text-foreground">
          {t('booking.financialAssistance.result.areasTitle')}
        </h2>
        <div className="flex flex-wrap gap-3">
          {selectedTopics.map((topicId) => {
            const topic = topicLabels[topicId];
            if (!topic) return null;
            
            return (
              <div
                key={topicId}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-foreground rounded-full"
              >
                <span className="text-xl">{topic.emoji}</span>
                <span className="font-medium">{topic.title}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-8 border-2">
        <h2 className="text-xl font-serif font-semibold mb-6 text-foreground">
          {t('booking.financialAssistance.result.challengesTitle')}
        </h2>
        <ul className="space-y-3">
          {selectedSymptoms.map((symptomId) => {
            const symptomText = symptomLabels[symptomId];
            if (!symptomText) return null;
            
            return (
              <li key={symptomId} className="flex items-start gap-3">
                <span className="text-primary mt-1 font-bold">•</span>
                <span className="text-foreground">{symptomText}</span>
              </li>
            );
          })}
        </ul>
      </Card>

      {additionalNotes && additionalNotes.trim() && (
        <Card className="p-8 border-2">
          <h2 className="text-xl font-serif font-semibold mb-6 text-foreground">
            {t('booking.financialAssistance.result.additionalInfoTitle')}
          </h2>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {additionalNotes}
          </p>
        </Card>
      )}

      <div className="flex justify-center pt-4">
        <Button 
          onClick={onStartChat}
          size="lg"
          className="min-w-[240px] bg-primary hover:bg-primary/90 text-white rounded-lg"
        >
          {t('booking.startChatButton')}
        </Button>
      </div>
    </div>
  );
};

export default AssessmentResult;

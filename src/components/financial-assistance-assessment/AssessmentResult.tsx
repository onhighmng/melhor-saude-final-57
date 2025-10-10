import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

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
  'investments': { emoji: '📈', title: 'Investimentos' },
  'retirement': { emoji: '🏖️', title: 'Reforma' },
  'taxes': { emoji: '🧾', title: 'Impostos' },
  'emergency-fund': { emoji: '🛡️', title: 'Fundo de Emergência' }
};

const symptomLabels: Record<string, string> = {
  'debt-stress': 'Stress relacionado com dívidas',
  'overspending': 'Dificuldade em controlar gastos',
  'no-savings': 'Falta de poupança ou reserva financeira',
  'unclear-finances': 'Falta de clareza sobre a situação financeira',
  'low-income': 'Rendimento insuficiente',
  'no-plan': 'Sem plano financeiro a longo prazo',
  'credit-issues': 'Problemas com crédito ou histórico financeiro',
  'investment-fear': 'Medo ou insegurança em investir'
};

const AssessmentResult: React.FC<AssessmentResultProps> = ({
  selectedTopics,
  selectedSymptoms,
  additionalNotes,
  onStartChat,
  onBack
}) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="flex items-center gap-2 text-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          Resumo da sua situação
        </h1>
        <p className="text-lg text-primary">
          Com base nas informações fornecidas, nosso assistente está pronto para ajudar
        </p>
      </div>

      <Card className="p-8 border-2">
        <h2 className="text-xl font-serif font-semibold mb-6 text-foreground">
          Áreas Selecionadas
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
          Desafios Identificados
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
            Informações Adicionais
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
          Iniciar Conversa
        </Button>
      </div>
    </div>
  );
};

export default AssessmentResult;

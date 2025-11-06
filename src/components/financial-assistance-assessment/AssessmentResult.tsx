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
  'investments': { emoji: '💵', title: 'Poupança e Investimentos' },
  'retirement': { emoji: '👴', title: 'Planeamento de Reforma' },
  'insurance': { emoji: '🛡️', title: 'Seguros' },
  'financial-education': { emoji: '📚', title: 'Educação Financeira' },
  'estate-planning': { emoji: '📋', title: 'Planeamento Sucessório' },
  'housing': { emoji: '🏠', title: 'Crédito Habitação' },
  'taxes': { emoji: '🧾', title: 'Impostos e Declarações' },
  'debt-negotiation': { emoji: '🤝', title: 'Negociação de Dívidas' },
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
  'impulsive-spending': 'Gastos impulsivos frequentes',
  'no-emergency-fund': 'Não tenho fundo de emergência',
  'paycheck-to-paycheck': 'Vivo de ordenado em ordenado',
  'multiple-debts': 'Tenho múltiplas dívidas ativas',
  'cannot-save': 'Não consigo poupar mensalmente',
  'job-loss-fear': 'Receio perder o emprego',
  'money-tracking': 'Não sei onde vai o meu dinheiro',
  'family-conflicts': 'Tenho conflitos financeiros na família',
  'bill-anxiety': 'Sinto ansiedade ao pagar contas',
  'bank-statements': 'Não entendo extratos bancários',
  'no-financial-goals': 'Não tenho objetivos financeiros claros',
  'late-payments': 'Atrasos frequentes em pagamentos',
  'credit-card-maxed': 'Cartões de crédito no limite'
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
        onClick={onBack}
        variant="outline"
        className="flex items-center gap-2 hover:bg-green-600 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          Resultado do Pré-Diagnóstico
        </h1>
        <p className="text-lg text-primary">
          Preparamos uma análise com base nas suas respostas
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
          Falar com Especialista
        </Button>
      </div>
    </div>
  );
};

export default AssessmentResult;

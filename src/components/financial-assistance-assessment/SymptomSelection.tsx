import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface SymptomSelectionProps {
  selectedTopics: string[];
  selectedSymptoms: string[];
  onSymptomToggle: (symptomId: string) => void;
  additionalNotes: string;
  onNotesChange: (notes: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const financialAssistanceSymptoms = [
  { id: 'debt-stress', text: 'Stress relacionado com dívidas' },
  { id: 'overspending', text: 'Dificuldade em controlar gastos' },
  { id: 'no-savings', text: 'Falta de poupança ou reserva financeira' },
  { id: 'unclear-finances', text: 'Falta de clareza sobre a situação financeira' },
  { id: 'low-income', text: 'Rendimento insuficiente' },
  { id: 'no-plan', text: 'Sem plano financeiro a longo prazo' },
  { id: 'credit-issues', text: 'Problemas com crédito ou histórico financeiro' },
  { id: 'investment-fear', text: 'Medo ou insegurança em investir' }
];

const SymptomSelection: React.FC<SymptomSelectionProps> = ({
  selectedTopics,
  selectedSymptoms,
  onSymptomToggle,
  additionalNotes,
  onNotesChange,
  onNext,
  onBack
}) => {
  const totalSymptoms = financialAssistanceSymptoms.length;
  const selectedCount = selectedSymptoms.length;
  const progressPercentage = totalSymptoms > 0 ? Math.round((selectedCount / totalSymptoms) * 100) : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          Descreva sua situação financeira
        </h1>
        <p className="text-lg text-primary">
          Selecione os desafios que você está a enfrentar
        </p>
      </div>

      <div className="space-y-3">
        {financialAssistanceSymptoms.map((symptom) => {
          const isSelected = selectedSymptoms.includes(symptom.id);
          
          return (
            <Card
              key={symptom.id}
              className={`p-5 cursor-pointer transition-all border-2 ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onSymptomToggle(symptom.id)}
            >
              <p className="text-base text-foreground">{symptom.text}</p>
            </Card>
          );
        })}
      </div>

      {selectedCount > 0 && (
        <div className="flex justify-end">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-0.5 bg-primary rounded-full" />
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="text-base font-medium text-foreground">
          Informações adicionais (opcional)
        </label>
        <Textarea
          value={additionalNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Adicione qualquer detalhe relevante sobre sua situação financeira..."
          className="min-h-[150px] border-2 resize-none"
        />
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={onNext}
          disabled={selectedSymptoms.length === 0}
          size="lg"
          className="min-w-[200px] bg-primary hover:bg-primary/90 text-white rounded-lg"
        >
          Ver Resultado
        </Button>
      </div>
    </div>
  );
};

export default SymptomSelection;

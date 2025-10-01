import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { legalSymptoms } from '@/types/legalAssessment';

interface SymptomSelectionProps {
  selectedTopics: string[];
  selectedSymptoms: string[];
  onSymptomToggle: (symptomId: string) => void;
  additionalNotes: string;
  onNotesChange: (notes: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const SymptomSelection: React.FC<SymptomSelectionProps> = ({
  selectedTopics,
  selectedSymptoms,
  onSymptomToggle,
  additionalNotes,
  onNotesChange,
  onNext,
  onBack
}) => {
  const relevantSymptoms = legalSymptoms.filter(symptom => 
    selectedTopics.includes(symptom.topicId)
  );

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
              Descreva sua situação
            </h1>
            <p className="text-royal-blue">
              Selecione os pontos que melhor descrevem o seu caso
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {relevantSymptoms.map((symptom) => (
              <Card
                key={symptom.id}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  selectedSymptoms.includes(symptom.id)
                    ? 'border-primary border-2 bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onSymptomToggle(symptom.id)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{symptom.text}</p>
                  {selectedSymptoms.includes(symptom.id) && (
                    <div className="text-primary text-xl ml-4">✓</div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">
              Informações adicionais (opcional)
            </label>
            <Textarea
              placeholder="Adicione qualquer detalhe que possa ser relevante para o seu caso..."
              value={additionalNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={onNext}
              disabled={selectedSymptoms.length === 0}
              size="lg"
              className="min-w-[200px]"
            >
              Ver Resultado
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomSelection;

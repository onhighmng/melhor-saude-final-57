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

const physicalWellnessSymptoms = [
  { id: 'low-energy', text: 'Baixa energia ou fadiga constante' },
  { id: 'poor-diet', text: 'Dificuldade em manter uma alimentação saudável' },
  { id: 'sedentary', text: 'Estilo de vida sedentário' },
  { id: 'weight-concerns', text: 'Preocupações com o peso' },
  { id: 'muscle-pain', text: 'Dores musculares ou articulares' },
  { id: 'poor-sleep-quality', text: 'Má qualidade de sono' },
  { id: 'stress-physical', text: 'Sintomas físicos de estresse' },
  { id: 'lack-motivation', text: 'Falta de motivação para exercício' }
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
  const totalSymptoms = physicalWellnessSymptoms.length;
  const selectedCount = selectedSymptoms.length;
  const progressPercentage = totalSymptoms > 0 ? Math.round((selectedCount / totalSymptoms) * 100) : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          Quais são os seus sintomas?
        </h1>
        <p className="text-lg text-primary">
          Selecione os sintomas ou condições que enfrenta
        </p>
      </div>

      <div className="space-y-3">
        {physicalWellnessSymptoms.map((symptom) => {
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
          Informações Adicionais (Opcional)
        </label>
        <Textarea
          value={additionalNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Partilhe mais detalhes sobre a sua condição física..."
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

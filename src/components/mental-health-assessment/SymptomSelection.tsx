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

const mentalHealthSymptoms = [
  { id: 'sleep-problems', text: 'Dificuldade para dormir ou sono excessivo' },
  { id: 'lack-energy', text: 'Falta de energia ou cansaço constante' },
  { id: 'concentration', text: 'Dificuldade de concentração' },
  { id: 'mood-swings', text: 'Mudanças repentinas de humor' },
  { id: 'loss-interest', text: 'Perda de interesse em atividades que gostava' },
  { id: 'social-withdrawal', text: 'Evitar contato social' },
  { id: 'physical-symptoms', text: 'Sintomas físicos (dor de cabeça, tensão muscular)' },
  { id: 'negative-thoughts', text: 'Pensamentos negativos recorrentes' }
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
  const totalSymptoms = mentalHealthSymptoms.length;
  const selectedCount = selectedSymptoms.length;
  const progressPercentage = totalSymptoms > 0 ? Math.round((selectedCount / totalSymptoms) * 100) : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          Como se tem sentido?
        </h1>
        <p className="text-lg text-primary">
          Selecione os sintomas que tem experimentado
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center items-center px-4">
        {mentalHealthSymptoms.map((symptom, index) => {
          const isSelected = selectedSymptoms.includes(symptom.id);
          const isBlue = index % 3 === 0 || index % 5 === 0;
          
          return (
            <button
              key={symptom.id}
              className={`px-6 py-4 rounded-full text-base cursor-pointer transition-all border-2 font-medium ${
                isSelected 
                  ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-105' 
                  : isBlue
                  ? 'border-sky-200 bg-sky-100 hover:border-sky-300 hover:shadow-md text-foreground'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md text-foreground'
              }`}
              onClick={() => onSymptomToggle(symptom.id)}
              style={{
                transform: `rotate(${(index % 2 === 0 ? 1 : -1) * (index % 3)}deg)`
              }}
            >
              {symptom.text}
            </button>
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
          placeholder="Partilhe mais detalhes sobre como se sente..."
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

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('user');
  const totalSymptoms = mentalHealthSymptoms.length;
  const selectedCount = selectedSymptoms.length;
  const progressPercentage = totalSymptoms > 0 ? Math.round((selectedCount / totalSymptoms) * 100) : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          {t('booking.mentalHealth.symptomSelection.title')}
        </h1>
        <p className="text-lg text-primary">
          {t('booking.mentalHealth.symptomSelection.subtitle')}
        </p>
      </div>

      <div className="space-y-3">
        {mentalHealthSymptoms.map((symptom) => {
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
          {t('booking.mentalHealth.symptomSelection.additionalNotesLabel')}
        </label>
        <Textarea
          value={additionalNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t('booking.mentalHealth.symptomSelection.additionalNotesPlaceholder')}
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
          {t('booking.viewResultButton')}
        </Button>
      </div>
    </div>
  );
};

export default SymptomSelection;

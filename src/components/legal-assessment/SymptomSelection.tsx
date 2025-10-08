import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { legalSymptoms } from '@/types/legalAssessment';
import { ChevronLeft } from 'lucide-react';
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

const SymptomSelection: React.FC<SymptomSelectionProps> = ({
  selectedTopics,
  selectedSymptoms,
  onSymptomToggle,
  additionalNotes,
  onNotesChange,
  onNext,
  onBack
}) => {
  const { t } = useTranslation(['common', 'user']);
  
  const relevantSymptoms = legalSymptoms.filter(symptom => 
    selectedTopics.includes(symptom.topicId)
  );

  const progressPercentage = relevantSymptoms.length > 0 
    ? Math.round((selectedSymptoms.length / relevantSymptoms.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('common:actions.back')}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16">
                <svg className="transform -rotate-90 w-16 h-16">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-muted"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
                    className="text-primary transition-all duration-300"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-foreground">{progressPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              {t('user:legal.symptomSelection.title')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('user:legal.symptomSelection.subtitle')}
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {relevantSymptoms.map((symptom) => (
              <Card
                key={symptom.id}
                className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedSymptoms.includes(symptom.id)
                    ? 'border-primary border-2 bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onSymptomToggle(symptom.id)}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-foreground flex-1">{t(`user:legal.symptoms.${symptom.id}.text`)}</p>
                  {selectedSymptoms.includes(symptom.id) && (
                    <div className="text-primary text-2xl font-bold flex-shrink-0">✓</div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium mb-2 text-foreground">
              {t('user:legal.symptomSelection.additionalInfo')}
            </label>
            <Textarea
              placeholder={t('user:legal.symptomSelection.placeholder')}
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
              className="min-w-[200px] text-base"
            >
              {t('user:legal.symptomSelection.viewResult')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomSelection;

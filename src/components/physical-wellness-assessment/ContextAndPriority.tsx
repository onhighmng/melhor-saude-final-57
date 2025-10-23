import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

export interface ContextData {
  urgency: string;
  impactLevel: number;
  previousAttempts: string;
  supportSystem: string[];
}

interface ContextAndPriorityProps {
  contextData: ContextData;
  onContextChange: (data: ContextData) => void;
  onNext: () => void;
  onBack: () => void;
}

const urgencyOptions = [
  { value: 'immediate', label: 'Imediato (próximos dias)' },
  { value: 'weeks', label: 'Próximas semanas' },
  { value: 'month', label: 'Próximo mês' },
  { value: 'flexible', label: 'Não tenho pressa' }
];

const previousAttemptsOptions = [
  { value: 'alone', label: 'Sim, sozinho' },
  { value: 'professional', label: 'Sim, com ajuda profissional' },
  { value: 'first-time', label: 'Não, é a primeira vez' }
];

const supportSystemOptions = [
  { value: 'family', label: 'Sim, familiares' },
  { value: 'friends', label: 'Sim, amigos' },
  { value: 'colleagues', label: 'Sim, colegas' },
  { value: 'none', label: 'Não tenho apoio' }
];

const ContextAndPriority: React.FC<ContextAndPriorityProps> = ({
  contextData,
  onContextChange,
  onNext,
  onBack
}) => {
  const handleUrgencyChange = (urgency: string) => {
    onContextChange({ ...contextData, urgency });
  };

  const handleImpactChange = (value: number[]) => {
    onContextChange({ ...contextData, impactLevel: value[0] });
  };

  const handlePreviousAttemptsChange = (attempts: string) => {
    onContextChange({ ...contextData, previousAttempts: attempts });
  };

  const handleSupportToggle = (value: string) => {
    const newSupport = contextData.supportSystem.includes(value)
      ? contextData.supportSystem.filter(s => s !== value)
      : [...contextData.supportSystem, value];
    onContextChange({ ...contextData, supportSystem: newSupport });
  };

  const canProceed = contextData.urgency && contextData.previousAttempts && contextData.supportSystem.length > 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack}>
          Voltar
        </Button>
      </div>
      
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          Contexto e Prioridade
        </h1>
        <p className="text-lg text-muted-foreground">
          Ajude-nos a entender melhor a sua situação física
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Urgency */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-foreground">
            Quando precisa de apoio?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {urgencyOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleUrgencyChange(option.value)}
                className={`px-6 py-4 rounded-lg border-2 transition-all text-sm font-medium ${
                  contextData.urgency === option.value
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border hover:border-primary/50 text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Impact Level */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-foreground">
            Como esta situação afeta o seu dia a dia?
          </label>
          <div className="space-y-3">
            <Slider
              value={[contextData.impactLevel]}
              onValueChange={handleImpactChange}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pouco impacto (1)</span>
              <span className="text-primary font-semibold">{contextData.impactLevel}</span>
              <span>Muito impacto (10)</span>
            </div>
          </div>
        </div>

        {/* Previous Attempts */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-foreground">
            Já tentou resolver esta situação antes?
          </label>
          <div className="grid grid-cols-1 gap-3">
            {previousAttemptsOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handlePreviousAttemptsChange(option.value)}
                className={`px-6 py-4 rounded-lg border-2 transition-all text-sm font-medium text-left ${
                  contextData.previousAttempts === option.value
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border hover:border-primary/50 text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Support System */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-foreground">
            Tem alguém que o/a apoia nesta situação?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {supportSystemOptions.map(option => (
              <div
                key={option.value}
                onClick={() => handleSupportToggle(option.value)}
                className={`px-6 py-4 rounded-lg border-2 transition-all cursor-pointer ${
                  contextData.supportSystem.includes(option.value)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={contextData.supportSystem.includes(option.value)}
                    onCheckedChange={() => handleSupportToggle(option.value)}
                  />
                  <span className="text-sm font-medium text-foreground">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
          className="min-w-[200px] bg-primary hover:bg-primary/90 text-white rounded-lg"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default ContextAndPriority;

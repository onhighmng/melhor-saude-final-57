import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

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

const ContextAndPriority: React.FC<ContextAndPriorityProps> = ({ contextData, onContextChange, onNext, onBack }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack}>Voltar</Button>
      <div className="text-center"><h1 className="text-4xl font-serif font-bold mb-4">Contexto Jurídico</h1></div>
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <label className="text-base font-semibold">Urgência da situação?</label>
          <div className="grid grid-cols-2 gap-3">
            {['immediate', 'weeks', 'month', 'flexible'].map(val => (
              <button key={val} onClick={() => onContextChange({...contextData, urgency: val})} 
                className={`px-6 py-4 rounded-lg border-2 ${contextData.urgency === val ? 'border-primary bg-primary/5' : 'border-border'}`}>
                {val === 'immediate' ? 'Urgente' : val === 'weeks' ? 'Semanas' : val === 'month' ? 'Mês' : 'Flexível'}
              </button>
            ))}
          </div>
        </div>
        <Slider value={[contextData.impactLevel]} onValueChange={(v) => onContextChange({...contextData, impactLevel: v[0]})} min={1} max={10} />
      </Card>
      <Button onClick={onNext} disabled={!contextData.urgency} size="lg">Continuar</Button>
    </div>
  );
};

export default ContextAndPriority;

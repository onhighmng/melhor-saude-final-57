import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export interface PreferencesData {
  sessionFormat: string;
  schedulePreference: string;
  providerCharacteristics: string[];
  successDescription: string;
}

interface PreferencesAndExpectationsProps {
  preferencesData: PreferencesData;
  onPreferencesChange: (data: PreferencesData) => void;
  onNext: () => void;
  onBack: () => void;
}

const PreferencesAndExpectations: React.FC<PreferencesAndExpectationsProps> = ({
  preferencesData,
  onPreferencesChange,
  onNext,
  onBack
}) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack}>Voltar</Button>
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4">Preferências</h1>
      </div>
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <label className="text-base font-semibold">Como prefere as sessões?</label>
          <div className="grid grid-cols-2 gap-3">
            {['in-person', 'online', 'phone', 'no-preference'].map(val => (
              <button key={val} onClick={() => onPreferencesChange({...preferencesData, sessionFormat: val})}
                className={`px-6 py-4 rounded-lg border-2 ${preferencesData.sessionFormat === val ? 'border-primary bg-primary/5' : 'border-border'}`}>
                {val === 'in-person' ? 'Presencial' : val === 'online' ? 'Online' : val === 'phone' ? 'Telefone' : 'Sem preferência'}
              </button>
            ))}
          </div>
        </div>
        <Textarea value={preferencesData.successDescription} onChange={(e) => onPreferencesChange({...preferencesData, successDescription: e.target.value})} 
          placeholder="O que seria sucesso para si?" className="min-h-[120px]" />
      </Card>
      <Button onClick={onNext} disabled={!preferencesData.sessionFormat} size="lg">Ver Resultado</Button>
    </div>
  );
};

export default PreferencesAndExpectations;

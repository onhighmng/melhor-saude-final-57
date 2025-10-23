import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

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

const sessionFormatOptions = [
  { value: 'in-person', label: 'Presencial' },
  { value: 'online', label: 'Online (vídeo)' },
  { value: 'phone', label: 'Telefone' },
  { value: 'no-preference', label: 'Sem preferência' }
];

const scheduleOptions = [
  { value: 'morning', label: 'Manhã (08h-12h)' },
  { value: 'lunch', label: 'Almoço (12h-14h)' },
  { value: 'afternoon', label: 'Tarde (14h-18h)' },
  { value: 'evening', label: 'Fim do dia (18h-20h)' },
  { value: 'flexible', label: 'Flexível' }
];

const characteristicsOptions = [
  { value: 'experience', label: 'Experiência com casos semelhantes' },
  { value: 'empathy', label: 'Empatia e escuta ativa' },
  { value: 'practical', label: 'Abordagem prática e objetiva' },
  { value: 'availability', label: 'Disponibilidade rápida' },
  { value: 'specialization', label: 'Especialização específica' }
];

const PreferencesAndExpectations: React.FC<PreferencesAndExpectationsProps> = ({
  preferencesData,
  onPreferencesChange,
  onNext,
  onBack
}) => {
  const handleFormatChange = (format: string) => {
    onPreferencesChange({ ...preferencesData, sessionFormat: format });
  };

  const handleScheduleChange = (schedule: string) => {
    onPreferencesChange({ ...preferencesData, schedulePreference: schedule });
  };

  const handleCharacteristicToggle = (value: string) => {
    const newCharacteristics = preferencesData.providerCharacteristics.includes(value)
      ? preferencesData.providerCharacteristics.filter(c => c !== value)
      : [...preferencesData.providerCharacteristics, value];
    onPreferencesChange({ ...preferencesData, providerCharacteristics: newCharacteristics });
  };

  const handleSuccessChange = (description: string) => {
    onPreferencesChange({ ...preferencesData, successDescription: description });
  };

  const canProceed = preferencesData.sessionFormat && preferencesData.schedulePreference && preferencesData.providerCharacteristics.length > 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack}>
          Voltar
        </Button>
      </div>
      
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          Preferências e Expectativas
        </h1>
        <p className="text-lg text-muted-foreground">
          Personalize a sua experiência de bem-estar
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Session Format */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-foreground">
            Como prefere ter as suas sessões?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sessionFormatOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleFormatChange(option.value)}
                className={`px-6 py-4 rounded-lg border-2 transition-all text-sm font-medium ${
                  preferencesData.sessionFormat === option.value
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border hover:border-primary/50 text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Preference */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-foreground">
            Qual o melhor horário para si?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scheduleOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleScheduleChange(option.value)}
                className={`px-6 py-4 rounded-lg border-2 transition-all text-sm font-medium ${
                  preferencesData.schedulePreference === option.value
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border hover:border-primary/50 text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Provider Characteristics */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-foreground">
            O que é importante para si no profissional?
          </label>
          <div className="grid grid-cols-1 gap-3">
            {characteristicsOptions.map(option => (
              <div
                key={option.value}
                onClick={() => handleCharacteristicToggle(option.value)}
                className={`px-6 py-4 rounded-lg border-2 transition-all cursor-pointer ${
                  preferencesData.providerCharacteristics.includes(option.value)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={preferencesData.providerCharacteristics.includes(option.value)}
                    onCheckedChange={() => handleCharacteristicToggle(option.value)}
                  />
                  <span className="text-sm font-medium text-foreground">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Description */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-foreground">
            O que seria um resultado positivo para si? (Opcional)
          </label>
          <Textarea
            value={preferencesData.successDescription}
            onChange={(e) => handleSuccessChange(e.target.value)}
            placeholder="Descreva o que significaria sucesso para si neste processo..."
            className="min-h-[120px] border-2 resize-none"
          />
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
          className="min-w-[200px] bg-primary hover:bg-primary/90 text-white rounded-lg"
        >
          Ver Resultado
        </Button>
      </div>
    </div>
  );
};

export default PreferencesAndExpectations;

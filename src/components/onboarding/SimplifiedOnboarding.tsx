import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Target, Clock } from 'lucide-react';

interface SimplifiedOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  feeling: string;
  goals: string[];
  frequency: string;
}

export const SimplifiedOnboarding = ({ onComplete }: SimplifiedOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [feeling, setFeeling] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('');

  const feelings = [
    { value: 'bem', label: 'Estou bem, mas quero melhorar alguns hábitos' },
    { value: 'cansado', label: 'Sinto-me cansado(a) ou stressado(a)' },
    { value: 'desafios', label: 'Tenho desafios financeiros ou emocionais' },
    { value: 'orientacao', label: 'Preciso de orientação prática ou jurídica' },
  ];

  const goals = [
    { value: 'stress', label: 'Gerir melhor o stress e a ansiedade' },
    { value: 'fisica', label: 'Melhorar a forma física' },
    { value: 'financas', label: 'Organizar melhor as minhas finanças' },
    { value: 'juridico', label: 'Sentir-me mais seguro juridicamente' },
    { value: 'equilibrio', label: 'Equilibrar trabalho e vida pessoal' },
    { value: 'sono', label: 'Dormir melhor' },
    { value: 'energia', label: 'Ter mais energia no dia a dia' },
    { value: 'produtividade', label: 'Aumentar a produtividade' },
    { value: 'alimentacao', label: 'Melhorar a alimentação' },
  ];

  const frequencies = [
    { value: '1-2', label: '1–2 vezes por mês' },
    { value: '3-4', label: '3–4 vezes por mês' },
    { value: 'quando-precisar', label: 'Sempre que precisar' },
    { value: 'lembretes', label: 'Prefiro receber lembretes personalizados' },
  ];

  const handleGoalToggle = (goalValue: string) => {
    if (selectedGoals.includes(goalValue)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goalValue));
    } else {
      if (selectedGoals.length < 3) {
        setSelectedGoals([...selectedGoals, goalValue]);
      }
    }
  };

  const handleNext = () => {
    if (step === 1 && !feeling) return;
    if (step === 2 && selectedGoals.length === 0) return;
    if (step === 3 && !frequency) return;

    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({
        feeling,
        goals: selectedGoals,
        frequency,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 1) return feeling !== '';
    if (step === 2) return selectedGoals.length > 0;
    if (step === 3) return frequency !== '';
    return false;
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl shadow-2xl my-8">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            {step === 1 && <Sparkles className="w-8 h-8 text-white" />}
            {step === 2 && <Target className="w-8 h-8 text-white" />}
            {step === 3 && <Clock className="w-8 h-8 text-white" />}
          </div>
          
          {step === 1 && (
            <>
              <CardTitle className="text-3xl mb-2">Bem-vindo à Melhor Saúde!</CardTitle>
              <CardDescription className="text-base">
                Queremos ajudá-lo a alcançar o seu melhor bem-estar — físico, mental, financeiro e jurídico.
                Para começarmos, diga-nos um pouco mais sobre si e sobre o que gostaria de melhorar.
              </CardDescription>
            </>
          )}
          
          {step === 2 && (
            <>
              <CardTitle className="text-3xl">Objetivos Pessoais</CardTitle>
              <CardDescription className="text-base">
                Quais são as suas principais metas neste momento? (Escolha até 3)
              </CardDescription>
            </>
          )}
          
          {step === 3 && (
            <>
              <CardTitle className="text-3xl">Frequência</CardTitle>
              <CardDescription className="text-base">
                Com que frequência gostaria de cuidar do seu bem-estar?
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Como se sente */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Como se sente neste momento?</h3>
              <RadioGroup value={feeling} onValueChange={setFeeling}>
                {feelings.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer text-base">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Objetivos */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center">
                {selectedGoals.length}/3 selecionados
              </div>
              <div className="space-y-3">
                {goals.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.value);
                  const isDisabled = !isSelected && selectedGoals.length >= 3;
                  
                  return (
                    <div
                      key={goal.value}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer'
                      }`}
                      onClick={() => !isDisabled && handleGoalToggle(goal.value)}
                    >
                      <Checkbox
                        id={goal.value}
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => handleGoalToggle(goal.value)}
                      />
                      <Label
                        htmlFor={goal.value}
                        className={`flex-1 text-base ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {goal.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Frequência */}
          {step === 3 && (
            <div className="space-y-4">
              <RadioGroup value={frequency} onValueChange={setFrequency}>
                {frequencies.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer text-base">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1"
              size="lg"
              disabled={!canProceed()}
            >
              {step === 3 ? 'Começar Jornada' : 'Próximo'}
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2 pt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === step ? 'bg-primary' : i < step ? 'bg-primary/50' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

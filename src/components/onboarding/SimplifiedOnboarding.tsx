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
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl my-8 px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          {step === 1 && (
            <>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Bem-vindo à Melhor Saúde!
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Queremos ajudá-lo a alcançar o seu melhor bem-estar — físico, mental, financeiro e jurídico.
                Para começarmos, diga-nos um pouco mais sobre si e sobre o que gostaria de melhorar.
              </p>
            </>
          )}
          
          {step === 2 && (
            <>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Objetivos Pessoais
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Quais são as suas principais metas neste momento? (Escolha até 3)
              </p>
            </>
          )}
          
          {step === 3 && (
            <>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Frequência
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Com que frequência gostaria de cuidar do seu bem-estar?
              </p>
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Step 1: Como se sente */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-2xl mb-6 text-foreground">Como se sente neste momento?</h3>
              <RadioGroup value={feeling} onValueChange={setFeeling} className="space-y-3">
                {feelings.map((option) => (
                  <div 
                    key={option.value} 
                    className={`relative flex items-center p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                      feeling === option.value 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                    onClick={() => setFeeling(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mr-4" />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer text-lg font-medium">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Objetivos */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium text-primary">
                    {selectedGoals.length}/3 selecionados
                  </span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {goals.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.value);
                  const isDisabled = !isSelected && selectedGoals.length >= 3;
                  
                  return (
                    <div
                      key={goal.value}
                      className={`relative flex items-center p-5 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : isDisabled 
                            ? 'border-gray-200 opacity-40 cursor-not-allowed' 
                            : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50 cursor-pointer'
                      }`}
                      onClick={() => !isDisabled && handleGoalToggle(goal.value)}
                    >
                      <Checkbox
                        id={goal.value}
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => handleGoalToggle(goal.value)}
                        className="mr-4"
                      />
                      <Label
                        htmlFor={goal.value}
                        className={`flex-1 text-base font-medium ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
              <RadioGroup value={frequency} onValueChange={setFrequency} className="space-y-3">
                {frequencies.map((option) => (
                  <div 
                    key={option.value} 
                    className={`relative flex items-center p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                      frequency === option.value 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                    onClick={() => setFrequency(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mr-4" />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer text-lg font-medium">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-10">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={handleBack} 
                className="flex-1 h-14 text-base rounded-2xl border-2"
                size="lg"
              >
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 h-14 text-base rounded-2xl shadow-lg bg-foreground hover:bg-foreground/90 text-background"
              size="lg"
              disabled={!canProceed()}
            >
              {step === 3 ? 'Começar Jornada →' : 'Próximo →'}
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-3 mt-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-3 rounded-full transition-all duration-300 ${
                  i === step 
                    ? 'bg-primary w-12' 
                    : i < step 
                      ? 'bg-primary/50 w-3' 
                      : 'bg-gray-300 w-3'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

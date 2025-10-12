import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Target, Clock } from 'lucide-react';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';

interface SimplifiedOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  feeling: string;
  goals: string[];
  frequency: string;
}

export const SimplifiedOnboarding = ({ onComplete }: SimplifiedOnboardingProps) => {
  const [step, setStep] = useState(0); // Start at 0 for welcome screen
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
    { value: 'confianca', label: 'Aumentar a autoconfiança' },
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
    if (step > 0) setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 0) return true; // Welcome screen can always proceed
    if (step === 1) return feeling !== '';
    if (step === 2) return selectedGoals.length > 0;
    if (step === 3) return frequency !== '';
    return false;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="w-full max-w-2xl my-2">
        {/* Header Section */}
        <div className="text-center mb-6 flex flex-col items-center justify-center">
          {step === 0 && (
            <>
              <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tight whitespace-nowrap text-center mx-auto">Bem-vindo à Melhor Saúde!</h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
                Queremos ajudá-lo a alcançar o seu melhor bem-estar — físico, mental, financeiro e jurídico.
                Para começarmos, diga-nos um pouco mais sobre si e sobre o que gostaria de melhorar.
              </p>
            </>
          )}
          
          {step === 1 && (
            <>
              <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tight">
                Passo 1: Como se sente hoje?
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
                Conte-nos sobre o seu estado atual de bem-estar
              </p>
            </>
          )}
          
          {step === 2 && (
            <>
              <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tight">
                Passo 2: Defina os seus objetivos
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
                Escolha até 3 áreas onde gostaria de melhorar
              </p>
            </>
          )}
          
          {step === 3 && (
            <>
              <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tight">
                Passo 3: Planeie a sua jornada
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
                Com que frequência deseja trabalhar no seu bem-estar?
              </p>
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6">
          {/* Step 0: Welcome Screen */}
          {step === 0 && (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 w-20 h-20 flex items-center justify-center">
                <img src={melhorSaudeLogo} alt="Melhor Saúde" className="w-full h-full object-contain" />
              </div>
              <p className="text-base text-muted-foreground max-w-lg mx-auto">
                Estamos aqui para o apoiar na sua jornada de bem-estar completo
              </p>
            </div>
          )}
          
          {/* Step 1: Como se sente */}
          {step === 1 && (
            <div className="space-y-2">
              <RadioGroup value={feeling} onValueChange={setFeeling} className="space-y-2">
                {feelings.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={option.value}
                    className={`relative flex items-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      feeling === option.value 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mr-3" />
                    <span className="flex-1 text-sm md:text-base font-medium">
                      {option.label}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}


          {/* Step 2: Objetivos */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="text-center mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                  <span className="text-xs font-medium text-primary">
                    {selectedGoals.length}/3 selecionados
                  </span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {goals.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.value);
                  const isDisabled = !isSelected && selectedGoals.length >= 3;
                  
                  return (
                    <Label
                      key={goal.value}
                      htmlFor={goal.value}
                      className={`relative flex items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : isDisabled 
                            ? 'border-gray-200 opacity-40 cursor-not-allowed' 
                            : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <Checkbox
                        id={goal.value}
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => handleGoalToggle(goal.value)}
                        className="mr-3"
                      />
                      <span className={`flex-1 text-sm font-medium ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        {goal.label}
                      </span>
                    </Label>
                  );
                })}
              </div>
            </div>
          )}


          {/* Step 3: Frequência */}
          {step === 3 && (
            <div className="space-y-2">
              <RadioGroup value={frequency} onValueChange={setFrequency} className="space-y-2">
                {frequencies.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={option.value}
                    className={`relative flex items-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      frequency === option.value 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mr-3" />
                    <span className="flex-1 text-sm md:text-base font-medium">
                      {option.label}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}


          {/* Navigation */}
          <div className="flex gap-2 mt-4">
            {step > 0 && (
              <Button 
                variant="outline" 
                onClick={handleBack} 
                className="flex-1 h-11 text-sm rounded-lg border-2"
              >
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 h-11 text-sm rounded-lg shadow-lg bg-sky-blue hover:bg-sky-blue/90 text-white"
              disabled={!canProceed()}
            >
              {step === 0 ? 'Começar →' : step === 3 ? 'Começar Jornada →' : 'Próximo →'}
            </Button>
          </div>

          {/* Progress indicator */}
          {step > 0 && (
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step 
                      ? 'bg-primary w-8' 
                      : i < step 
                        ? 'bg-primary/50 w-1.5' 
                        : 'bg-gray-300 w-1.5'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

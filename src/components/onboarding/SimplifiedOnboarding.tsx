import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Target, Clock, CheckCircle2 } from 'lucide-react';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';
interface SimplifiedOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}
export interface OnboardingData {
  wellbeingScore: number;
  difficultyAreas: string[];
  mainGoals: string[];
  improvementSigns: string[];
  frequency: string;
}
export const SimplifiedOnboarding = ({
  onComplete
}: SimplifiedOnboardingProps) => {
  const [step, setStep] = useState(0);
  const [wellbeingScore, setWellbeingScore] = useState<number | null>(null);
  const [difficultyAreas, setDifficultyAreas] = useState<string[]>([]);
  const [mainGoals, setMainGoals] = useState<string[]>([]);
  const [improvementSigns, setImprovementSigns] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('');
  const difficultyOptions = [{
    value: 'mental',
    label: 'Saúde mental / stress / ansiedade'
  }, {
    value: 'fisica',
    label: 'Bem-estar físico / energia / forma'
  }, {
    value: 'financeira',
    label: 'Organização financeira / estabilidade'
  }, {
    value: 'legal',
    label: 'Questões legais / incertezas profissionais'
  }, {
    value: 'equilibrio',
    label: 'Equilíbrio entre vida pessoal e trabalho'
  }];
  const goals = [{
    value: 'stress',
    label: 'Reduzir o stress e sentir-me mais calmo(a)'
  }, {
    value: 'fisica',
    label: 'Melhorar a minha forma física'
  }, {
    value: 'energia',
    label: 'Ter mais energia no dia a dia'
  }, {
    value: 'financas',
    label: 'Organizar melhor as minhas finanças'
  }, {
    value: 'juridico',
    label: 'Sentir-me mais seguro(a) juridicamente'
  }, {
    value: 'sono',
    label: 'Dormir melhor e descansar mais'
  }, {
    value: 'equilibrio',
    label: 'Melhorar o equilíbrio entre vida pessoal e trabalho'
  }, {
    value: 'produtividade',
    label: 'Aumentar a produtividade'
  }, {
    value: 'alimentacao',
    label: 'Comer de forma mais saudável'
  }];
  const improvementSignsOptions = [{
    value: 'menos-stress',
    label: 'Sentir menos stress ou ansiedade'
  }, {
    value: 'dormir',
    label: 'Dormir melhor'
  }, {
    value: 'poupar',
    label: 'Poupar ou gerir melhor o dinheiro'
  }, {
    value: 'energia',
    label: 'Ter mais energia no trabalho'
  }, {
    value: 'motivado',
    label: 'Sentir-me mais motivado(a)'
  }, {
    value: 'juridico',
    label: 'Resolver um problema jurídico pendente'
  }];
  const frequencies = [{
    value: '1-2',
    label: '1–2 vezes por mês'
  }, {
    value: '3-4',
    label: '3–4 vezes por mês'
  }, {
    value: 'quando-precisar',
    label: 'Sempre que precisar'
  }, {
    value: 'lembretes',
    label: 'Prefiro receber lembretes personalizados'
  }];
  const handleGoalToggle = (goalValue: string) => {
    if (mainGoals.includes(goalValue)) {
      setMainGoals(mainGoals.filter(g => g !== goalValue));
    } else {
      if (mainGoals.length < 3) {
        setMainGoals([...mainGoals, goalValue]);
      }
    }
  };
  const handleDifficultyToggle = (value: string) => {
    if (difficultyAreas.includes(value)) {
      setDifficultyAreas(difficultyAreas.filter(d => d !== value));
    } else {
      if (difficultyAreas.length < 2) {
        setDifficultyAreas([...difficultyAreas, value]);
      }
    }
  };
  const handleImprovementSignToggle = (value: string) => {
    if (improvementSigns.includes(value)) {
      setImprovementSigns(improvementSigns.filter(s => s !== value));
    } else {
      setImprovementSigns([...improvementSigns, value]);
    }
  };
  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      // Step 6 is completion screen, complete onboarding
      onComplete({
        wellbeingScore: wellbeingScore!,
        difficultyAreas,
        mainGoals,
        improvementSigns,
        frequency
      });
    }
  };
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };
  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return wellbeingScore !== null && wellbeingScore >= 1 && wellbeingScore <= 10;
    if (step === 2) return difficultyAreas.length >= 1 && difficultyAreas.length <= 2;
    if (step === 3) return mainGoals.length > 0 && mainGoals.length <= 3;
    if (step === 4) return improvementSigns.length > 0;
    if (step === 5) return frequency !== '';
    if (step === 6) return true; // Completion screen
    return false;
  };
  const stepHeaders = [{
    title: '',
    subtitle: ''
  }, {
    title: 'Numa escala de 1 a 10, como avalia o seu bem-estar geral hoje?',
    subtitle: 'Criar uma linha de base para medir a sua evolução'
  }, {
    title: 'Em quais destas áreas sente atualmente mais dificuldade?',
    subtitle: 'Escolha até 2 áreas'
  }, {
    title: 'Quais são as suas principais metas neste momento?',
    subtitle: 'Escolha até 3 metas'
  }, {
    title: 'O que seria um sinal claro de que está a melhorar?',
    subtitle: 'Selecione todas as que se aplicam'
  }, {
    title: 'Com que frequência gostaria de cuidar do seu bem-estar?',
    subtitle: 'Personalize o seu ritmo'
  }, {
    title: '',
    subtitle: ''
  } // Completion screen
  ];
  return <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="w-full max-w-2xl my-2">
        {/* Header Section */}
        <div className="text-center mb-6 flex flex-col items-center justify-center">
          {step === 0 && <>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-center whitespace-nowrap mx-auto">Bem-vindo à Melhor Saúde!</h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">Queremos ajudá-lo a alcançar o seu melhor bem-estar — físico, mental, financeiro e jurídico. </p>
            </>}
          {step > 0 && step < 6 && <>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 max-w-2xl">
                {stepHeaders[step].title}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl">
                {stepHeaders[step].subtitle}
              </p>
            </>}
        </div>

        {/* Content Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6">
          {/* Step 0: Welcome Screen */}
          {step === 0 && <div className="text-center py-4">
              <div className="mx-auto mb-4 w-20 h-20 flex items-center justify-center">
                <img src={melhorSaudeLogo} alt="Melhor Saúde" className="w-full h-full object-contain" />
              </div>
              <p className="text-base text-muted-foreground max-w-lg mx-auto">Para começarmos, diga-nos um pouco mais sobre si e sobre o que gostaria de melhorar.</p>
            </div>}

          {/* Step 1: Wellbeing Score (1-10) */}
          {step === 1 && <div className="space-y-6">
              <p className="text-center text-base text-muted-foreground mb-4">
                1 = Muito em baixo, 10 = Excelente
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => <button key={num} type="button" onClick={() => setWellbeingScore(num)} className={`w-14 h-14 rounded-full border-2 transition-all font-semibold text-lg ${wellbeingScore === num ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg' : 'border-muted-foreground/30 hover:border-primary hover:scale-105 hover:shadow-md'}`}>
                    {num}
                  </button>)}
              </div>
            </div>}

          {/* Step 2: Difficulty Areas (max 2) */}
          {step === 2 && <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium text-primary">
                    {difficultyAreas.length}/2 selecionados
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {difficultyOptions.map(option => {
              const isSelected = difficultyAreas.includes(option.value);
              const isDisabled = !isSelected && difficultyAreas.length >= 2;
              return <button key={option.value} type="button" onClick={() => !isDisabled && handleDifficultyToggle(option.value)} disabled={isDisabled} className={`px-6 py-4 rounded-full border-2 transition-all duration-200 text-sm md:text-base font-medium ${isSelected ? 'border-primary bg-amber-50 text-foreground shadow-md scale-[1.02]' : isDisabled ? 'border-gray-200 bg-white text-muted-foreground opacity-40 cursor-not-allowed' : 'border-gray-200 bg-white text-foreground hover:border-primary/50 hover:shadow-sm cursor-pointer'}`}>
                      {option.label}
                    </button>;
            })}
              </div>
            </div>}

          {/* Step 3: Main Goals (up to 3) */}
          {step === 3 && <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium text-primary">
                    {mainGoals.length}/3 selecionados
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {goals.map(goal => {
              const isSelected = mainGoals.includes(goal.value);
              const isDisabled = !isSelected && mainGoals.length >= 3;
              return <button key={goal.value} type="button" onClick={() => !isDisabled && handleGoalToggle(goal.value)} disabled={isDisabled} className={`px-6 py-4 rounded-full border-2 transition-all duration-200 text-sm md:text-base font-medium ${isSelected ? 'border-primary bg-amber-50 text-foreground shadow-md scale-[1.02]' : isDisabled ? 'border-gray-200 bg-white text-muted-foreground opacity-40 cursor-not-allowed' : 'border-gray-200 bg-white text-foreground hover:border-primary/50 hover:shadow-sm cursor-pointer'}`}>
                      {goal.label}
                    </button>;
            })}
              </div>
            </div>}

          {/* Step 4: Improvement Signs (multiple choice) */}
          {step === 4 && <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {improvementSignsOptions.map(option => {
              const isSelected = improvementSigns.includes(option.value);
              return <button key={option.value} type="button" onClick={() => handleImprovementSignToggle(option.value)} className={`px-6 py-4 rounded-full border-2 transition-all duration-200 text-sm md:text-base font-medium ${isSelected ? 'border-primary bg-amber-50 text-foreground shadow-md scale-[1.02]' : 'border-gray-200 bg-white text-foreground hover:border-primary/50 hover:shadow-sm cursor-pointer'}`}>
                      {option.label}
                    </button>;
            })}
              </div>
            </div>}

          {/* Step 5: Frequency */}
          {step === 5 && <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {frequencies.map(option => <button key={option.value} type="button" onClick={() => setFrequency(option.value)} className={`px-6 py-4 rounded-full border-2 transition-all duration-200 text-sm md:text-base font-medium ${frequency === option.value ? 'border-primary bg-amber-50 text-foreground shadow-md scale-[1.02]' : 'border-gray-200 bg-white text-foreground hover:border-primary/50 hover:shadow-sm cursor-pointer'}`}>
                    {option.label}
                  </button>)}
              </div>
            </div>}

          {/* Step 6: Completion Screen */}
          {step === 6 && <div className="text-center py-8 space-y-6">
              <div className="mx-auto w-32 h-32 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-4xl font-bold">Perfeito!</h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Criámos um plano inicial com base nas suas respostas.
                </p>
                <p className="text-base text-muted-foreground max-w-md mx-auto">
                  Pode atualizá-las a qualquer momento nas suas definições.
                </p>
                <p className="text-base text-muted-foreground max-w-md mx-auto">
                  O seu progresso será acompanhado automaticamente — cada passo conta 💚
                </p>
              </div>
              
              <div className="mt-6 max-w-md mx-auto">
                <Progress value={10} className="h-3" />
                <p className="text-sm text-sky-blue font-medium mt-2">Progresso: 10%</p>
              </div>
              
              <p className="text-xl font-medium text-sky-blue mt-4">
                O seu bem-estar começa aqui ✨
              </p>
            </div>}

          {/* Navigation */}
          <div className="flex gap-2 mt-4">
            {step > 0 && step < 6 && <Button variant="outline" onClick={handleBack} className="flex-1 h-11 text-sm rounded-lg border-2">
                Voltar
              </Button>}
            <Button onClick={handleNext} className="flex-1 h-11 text-sm rounded-lg shadow-lg bg-sky-blue hover:bg-sky-blue/90 text-white" disabled={!canProceed()}>
              {step === 0 ? 'Começar →' : step === 6 ? 'Continuar para Dashboard →' : step === 5 ? 'Concluir →' : 'Próximo →'}
            </Button>
          </div>

          {/* Progress indicator */}
          {step > 0 && step < 6 && <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'bg-primary w-8' : i < step ? 'bg-primary/50 w-1.5' : 'bg-gray-300 w-1.5'}`} />)}
            </div>}
        </div>
      </div>
    </div>;
};
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Target, Clock, CheckCircle2 } from 'lucide-react';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
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
  }, {
    value: 'relacionamentos',
    label: 'Relacionamentos interpessoais'
  }, {
    value: 'gestao-tempo',
    label: 'Gestão do tempo'
  }, {
    value: 'carreira',
    label: 'Objetivos de carreira'
  }];
  const goals = [{
    value: 'stress',
    label: 'Reduzir o stress e ansiedade'
  }, {
    value: 'fisica',
    label: 'Melhorar a forma física'
  }, {
    value: 'financas',
    label: 'Organizar melhor as finanças'
  }, {
    value: 'juridico',
    label: 'Resolver questões legais'
  }, {
    value: 'equilibrio',
    label: 'Melhorar equilíbrio vida-trabalho'
  }, {
    value: 'autoconfianca',
    label: 'Melhorar autoconfiança'
  }];
  const improvementSignsOptions = [{
    value: 'menos-stress',
    label: 'Sentir menos stress'
  }, {
    value: 'poupar',
    label: 'Gerir melhor o dinheiro'
  }, {
    value: 'energia',
    label: 'Ter mais energia'
  }, {
    value: 'confiante',
    label: 'Sentir-me mais confiante'
  }, {
    value: 'relacoes-saudaveis',
    label: 'Melhorar relações'
  }, {
    value: 'juridico',
    label: 'Resolver questões legais'
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
      setMainGoals([...mainGoals, goalValue]);
    }
  };
  const handleDifficultyToggle = (value: string) => {
    if (difficultyAreas.includes(value)) {
      setDifficultyAreas(difficultyAreas.filter(d => d !== value));
    } else {
      setDifficultyAreas([...difficultyAreas, value]);
    }
  };
  const handleImprovementSignToggle = (value: string) => {
    if (improvementSigns.includes(value)) {
      setImprovementSigns(improvementSigns.filter(s => s !== value));
    } else {
      setImprovementSigns([...improvementSigns, value]);
    }
  };
  const handleNext = async () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      // Step 6 is completion screen, complete onboarding
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      const onboardingData = {
        wellbeingScore: wellbeingScore!,
        difficultyAreas,
        mainGoals,
        improvementSigns,
        frequency
      };

      // Save to onboarding_data table (legacy)
      const { error: onboardingError } = await supabase
        .from('onboarding_data')
        .upsert({
          user_id: user?.id,
          wellbeing_score: onboardingData.wellbeingScore,
          difficulty_areas: onboardingData.difficultyAreas,
          main_goals: onboardingData.mainGoals,
          improvement_signs: onboardingData.improvementSigns,
          frequency: onboardingData.frequency,
          completed_at: new Date().toISOString()
        });

      if (onboardingError) throw onboardingError;

      // Save structured goals to user_goals table
      const goalsToCreate = [];

      // Create wellbeing score goal
      goalsToCreate.push({
        user_id: user?.id,
        goal_type: 'wellbeing_score',
        target_value: { target_score: onboardingData.wellbeingScore },
        current_value: { current_score: onboardingData.wellbeingScore },
        pillar: null,
        status: 'completed',
        priority: 1
      });

      // Create difficulty area goals
      onboardingData.difficultyAreas.forEach((area, index) => {
        const pillar = mapDifficultyAreaToPillar(area);
        goalsToCreate.push({
          user_id: user?.id,
          goal_type: 'difficulty_area',
          target_value: { area, target_status: 'improved' },
          current_value: { area, current_status: 'needs_work' },
          pillar,
          status: 'active',
          priority: index + 2
        });
      });

      // Create main goal targets
      onboardingData.mainGoals.forEach((goal, index) => {
        const pillar = mapMainGoalToPillar(goal);
        goalsToCreate.push({
          user_id: user?.id,
          goal_type: 'main_goal',
          target_value: { goal, target_status: 'achieved' },
          current_value: { goal, current_status: 'in_progress' },
          pillar,
          status: 'active',
          priority: index + 2 + onboardingData.difficultyAreas.length
        });
      });

      // Create improvement sign goals
      onboardingData.improvementSigns.forEach((sign, index) => {
        const pillar = mapImprovementSignToPillar(sign);
        goalsToCreate.push({
          user_id: user?.id,
          goal_type: 'improvement_sign',
          target_value: { sign, target_status: 'achieved' },
          current_value: { sign, current_status: 'not_yet' },
          pillar,
          status: 'active',
          priority: index + 2 + onboardingData.difficultyAreas.length + onboardingData.mainGoals.length
        });
      });

      // Insert all goals (user_goals table not implemented)
      if (goalsToCreate.length > 0) {
        console.warn('[Onboarding] user_goals table not implemented, skipping goal creation');
      }

      // Update user progress
      await supabase
        .from('user_progress')
        .insert({
          user_id: user?.id,
          action_type: 'milestone_achieved',
          metadata: {
            milestone: 'onboarding_completed',
            wellbeing_score: onboardingData.wellbeingScore,
            goals_set: goalsToCreate.length
          }
        });

      // Call the original completion handler
      onComplete(onboardingData);

    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still call onComplete to not block the user
      onComplete({
        wellbeingScore: wellbeingScore!,
        difficultyAreas,
        mainGoals,
        improvementSigns,
        frequency
      });
    }
  };

  const mapDifficultyAreaToPillar = (area: string): string | null => {
    const mapping: Record<string, string> = {
      'stress': 'saude_mental',
      'ansiedade': 'saude_mental',
      'depressao': 'saude_mental',
      'relacionamentos': 'saude_mental',
      'energia': 'bem_estar_fisico',
      'sono': 'bem_estar_fisico',
      'exercicio': 'bem_estar_fisico',
      'alimentacao': 'bem_estar_fisico',
      'dinheiro': 'assistencia_financeira',
      'poupancas': 'assistencia_financeira',
      'dividas': 'assistencia_financeira',
      'investimentos': 'assistencia_financeira',
      'contratos': 'assistencia_juridica',
      'direitos': 'assistencia_juridica',
      'trabalho': 'assistencia_juridica',
      'familia': 'assistencia_juridica'
    };
    return mapping[area] || null;
  };

  const mapMainGoalToPillar = (goal: string): string | null => {
    const mapping: Record<string, string> = {
      'autoconfianca': 'saude_mental',
      'relacionamentos': 'saude_mental',
      'stress': 'saude_mental',
      'energia': 'bem_estar_fisico',
      'exercicio': 'bem_estar_fisico',
      'saude': 'bem_estar_fisico',
      'poupar': 'assistencia_financeira',
      'dinheiro': 'assistencia_financeira',
      'investir': 'assistencia_financeira',
      'juridico': 'assistencia_juridica',
      'direitos': 'assistencia_juridica',
      'contratos': 'assistencia_juridica'
    };
    return mapping[goal] || null;
  };

  const mapImprovementSignToPillar = (sign: string): string | null => {
    const mapping: Record<string, string> = {
      'menos-stress': 'saude_mental',
      'confiante': 'saude_mental',
      'relacoes-saudaveis': 'saude_mental',
      'energia': 'bem_estar_fisico',
      'poupar': 'assistencia_financeira',
      'juridico': 'assistencia_juridica'
    };
    return mapping[sign] || null;
  };
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };
  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return wellbeingScore !== null && wellbeingScore >= 1 && wellbeingScore <= 10;
    if (step === 2) return difficultyAreas.length > 0;
    if (step === 3) return mainGoals.length > 0;
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
    subtitle: 'Selecione todas as que se aplicam'
  }, {
    title: 'Quais são as suas principais metas neste momento?',
    subtitle: 'Selecione todas as que se aplicam'
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
  return <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-50 flex items-center justify-center p-2 overflow-hidden">
      <div className="w-full max-w-6xl my-1 scale-105 origin-center">
        {/* Header Section */}
        <div className="text-center mb-3 flex flex-col items-center justify-center">
          {step === 0 && <>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-center whitespace-nowrap mx-auto">Bem-vindo à Melhor Saúde!</h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">Queremos ajudá-lo a alcançar o seu melhor bem-estar <span className="text-sky-blue font-semibold">físico, mental, financeiro e jurídico</span>.</p>
            </>}
          {step > 0 && step < 6 && <>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 max-w-4xl whitespace-nowrap">
                {stepHeaders[step].title}
              </h2>
              
            </>}
        </div>

        {/* Content Section */}
        <div className="p-3 md:p-4">
          {/* Step 0: Welcome Screen */}
          {step === 0 && <div className="text-center py-4">
              <div className="mx-auto mb-4 w-28 h-28 flex items-center justify-center">
                <img src={melhorSaudeLogo} alt="Melhor Saúde" className="w-full h-full object-contain" />
              </div>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">Para começarmos, diga-nos um pouco mais sobre si e sobre o que gostaria de melhorar.</p>
            </div>}

          {/* Step 1: Wellbeing Score (1-10) */}
          {step === 1 && <div className="space-y-6">
              
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => <button key={num} type="button" onClick={() => setWellbeingScore(num)} className={`w-14 h-14 rounded-full border-2 transition-all font-semibold text-lg ${wellbeingScore === num ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg' : 'border-muted-foreground/30 hover:border-primary hover:scale-105 hover:shadow-md'}`}>
                    {num}
                  </button>)}
              </div>
            </div>}

          {/* Step 2: Difficulty Areas (unlimited) */}
          {step === 2 && <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium text-primary">
                    {difficultyAreas.length} selecionados
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {difficultyOptions.map(option => {
              const isSelected = difficultyAreas.includes(option.value);
              return <button key={option.value} type="button" onClick={() => handleDifficultyToggle(option.value)} className={`px-4 py-4 rounded-full border-2 transition-all duration-200 text-base font-medium whitespace-nowrap ${isSelected ? 'border-primary bg-amber-50 text-foreground shadow-md scale-[1.02]' : 'border-gray-200 bg-white text-foreground hover:border-primary/50 hover:shadow-sm cursor-pointer'}`}>
                      {option.label}
                    </button>;
            })}
              </div>
            </div>}

          {/* Step 3: Main Goals (unlimited) */}
          {step === 3 && <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium text-primary">
                    {mainGoals.length} selecionados
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {goals.map(goal => {
              const isSelected = mainGoals.includes(goal.value);
              return <button key={goal.value} type="button" onClick={() => handleGoalToggle(goal.value)} className={`px-4 py-4 rounded-full border-2 transition-all duration-200 text-base font-medium whitespace-nowrap ${isSelected ? 'border-primary bg-amber-50 text-foreground shadow-md scale-[1.02]' : 'border-gray-200 bg-white text-foreground hover:border-primary/50 hover:shadow-sm cursor-pointer'}`}>
                      {goal.label}
                    </button>;
            })}
              </div>
            </div>}

          {/* Step 4: Improvement Signs (multiple choice) */}
          {step === 4 && <div className="space-y-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {improvementSignsOptions.map(option => {
              const isSelected = improvementSigns.includes(option.value);
              return <button key={option.value} type="button" onClick={() => handleImprovementSignToggle(option.value)} className={`px-4 py-4 rounded-full border-2 transition-all duration-200 text-base font-medium whitespace-nowrap ${isSelected ? 'border-primary bg-amber-50 text-foreground shadow-md scale-[1.02]' : 'border-gray-200 bg-white text-foreground hover:border-primary/50 hover:shadow-sm cursor-pointer'}`}>
                      {option.label}
                    </button>;
            })}
              </div>
            </div>}

          {/* Step 5: Frequency */}
          {step === 5 && <div className="space-y-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {frequencies.map(option => <button key={option.value} type="button" onClick={() => setFrequency(option.value)} className={`px-4 py-4 rounded-full border-2 transition-all duration-200 text-base font-medium whitespace-nowrap ${frequency === option.value ? 'border-primary bg-amber-50 text-foreground shadow-md scale-[1.02]' : 'border-gray-200 bg-white text-foreground hover:border-primary/50 hover:shadow-sm cursor-pointer'}`}>
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
              
              <p className="text-6xl font-medium text-sky-blue mt-4">
                O seu bem-estar começa aqui ✨
              </p>
            </div>}

          {/* Navigation */}
          <div className="flex gap-2 mt-4 justify-center">
            {step > 0 && step < 6 && (
              <InteractiveHoverButton 
                onClick={handleBack} 
                text="Voltar"
                className="w-32 h-11 text-sm rounded-lg shadow-lg bg-white text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
              />
            )}
            {step === 0 ? (
              <InteractiveHoverButton 
                onClick={handleNext} 
                text="Começar"
                className="w-32 h-11 text-sm rounded-lg shadow-lg bg-white text-sky-blue border-sky-blue hover:bg-sky-blue hover:text-white"
                disabled={!canProceed()}
              />
            ) : (
              <InteractiveHoverButton 
                onClick={handleNext} 
                text={step === 6 ? 'Continuar para Início' : step === 5 ? 'Concluir' : 'Próximo'}
                className={`${step === 6 ? 'w-48' : 'w-32'} h-11 text-sm rounded-lg shadow-lg bg-white text-sky-blue border-sky-blue hover:bg-sky-blue hover:text-white`}
                disabled={!canProceed()}
              />
            )}
          </div>

          {/* Progress indicator */}
          {step > 0 && step < 6 && <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'bg-primary w-8' : i < step ? 'bg-primary/50 w-1.5' : 'bg-gray-300 w-1.5'}`} />)}
            </div>}
        </div>
      </div>
    </div>;
};
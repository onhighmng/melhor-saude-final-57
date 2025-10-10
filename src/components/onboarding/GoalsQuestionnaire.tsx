import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Target, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoalsQuestionnaireProps {
  onComplete: (goals: UserGoals) => void;
}

export interface UserGoals {
  mainGoal: string;
  wantToAchieve: string[];
  wantToAvoid: string[];
}

export const GoalsQuestionnaire = ({ onComplete }: GoalsQuestionnaireProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [mainGoal, setMainGoal] = useState('');
  const [achieveInput, setAchieveInput] = useState('');
  const [avoidInput, setAvoidInput] = useState('');
  const [wantToAchieve, setWantToAchieve] = useState<string[]>([]);
  const [wantToAvoid, setWantToAvoid] = useState<string[]>([]);

  const handleAddAchieve = () => {
    if (achieveInput.trim()) {
      setWantToAchieve([...wantToAchieve, achieveInput.trim()]);
      setAchieveInput('');
    }
  };

  const handleAddAvoid = () => {
    if (avoidInput.trim()) {
      setWantToAvoid([...wantToAvoid, avoidInput.trim()]);
      setAvoidInput('');
    }
  };

  const handleRemoveAchieve = (index: number) => {
    setWantToAchieve(wantToAchieve.filter((_, i) => i !== index));
  };

  const handleRemoveAvoid = (index: number) => {
    setWantToAvoid(wantToAvoid.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1 && !mainGoal.trim()) {
      toast({
        title: "Por favor, descreva o seu objetivo principal",
        variant: 'destructive',
      });
      return;
    }
    if (step === 2 && wantToAchieve.length === 0) {
      toast({
        title: "Adicione pelo menos uma coisa que quer alcançar",
        variant: 'destructive',
      });
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({
        mainGoal,
        wantToAchieve,
        wantToAvoid,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">
            {step === 1 && "Qual é o seu objetivo principal?"}
            {step === 2 && "O que quer alcançar?"}
            {step === 3 && "O que quer evitar?"}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1 && "Queremos ajudá-lo a alcançar os seus objetivos de bem-estar"}
            {step === 2 && "Liste as coisas específicas que quer conquistar"}
            {step === 3 && "Identifique comportamentos ou situações que quer evitar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Main Goal */}
          {step === 1 && (
            <div className="space-y-4">
              <Textarea
                placeholder="Ex: Melhorar a minha saúde mental, reduzir o stress, ter mais energia..."
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                className="min-h-[150px] text-base"
              />
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Seja específico. Quanto mais detalhado for, melhor poderemos ajudá-lo.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: What to Achieve */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ex: Dormir melhor, fazer exercício 3x por semana, aprender a meditar..."
                  value={achieveInput}
                  onChange={(e) => setAchieveInput(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddAchieve();
                    }
                  }}
                />
                <Button onClick={handleAddAchieve} size="lg">
                  Adicionar
                </Button>
              </div>

              {wantToAchieve.length > 0 && (
                <div className="space-y-2">
                  {wantToAchieve.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="flex-1 text-sm">{item}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAchieve(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: What to Avoid */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ex: Procrastinação, ansiedade antes de reuniões, comer tarde da noite..."
                  value={avoidInput}
                  onChange={(e) => setAvoidInput(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddAvoid();
                    }
                  }}
                />
                <Button onClick={handleAddAvoid} size="lg">
                  Adicionar
                </Button>
              </div>

              {wantToAvoid.length > 0 && (
                <div className="space-y-2">
                  {wantToAvoid.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <span className="flex-1 text-sm">{item}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAvoid(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Opcional: Isto ajuda-nos a criar um plano mais personalizado
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Voltar
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1" size="lg">
              {step === 3 ? "Começar Jornada" : "Próximo"}
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2 pt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
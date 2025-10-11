import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Target, CheckCircle2, XCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface UserGoals {
  mainGoal: string;
  wantToAchieve: string[];
  wantToAvoid: string[];
}

interface GoalsEditorProps {
  initialGoals?: UserGoals | null;
  onSave: (goals: UserGoals) => void;
  onCancel: () => void;
}

export const GoalsEditor = ({ initialGoals, onSave, onCancel }: GoalsEditorProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('user');
  const [step, setStep] = useState(1);
  const [mainGoal, setMainGoal] = useState(initialGoals?.mainGoal || '');
  const [achieveInput, setAchieveInput] = useState('');
  const [avoidInput, setAvoidInput] = useState('');
  const [wantToAchieve, setWantToAchieve] = useState<string[]>(initialGoals?.wantToAchieve || []);
  const [wantToAvoid, setWantToAvoid] = useState<string[]>(initialGoals?.wantToAvoid || []);

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
        title: t('goals.editor.validations.mainGoalRequired'),
        variant: 'destructive',
      });
      return;
    }
    if (step === 2 && wantToAchieve.length === 0) {
      toast({
        title: t('goals.editor.validations.achieveRequired'),
        variant: 'destructive',
      });
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      onSave({
        mainGoal,
        wantToAchieve,
        wantToAvoid,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  return (
    <Card className="w-full shadow-lg border-2">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? t('goals.editor.actions.cancel') : t('goals.editor.actions.back')}
          </Button>
          <div className="flex-1" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full transition-colors ${
                  i === step ? 'bg-primary' : i < step ? 'bg-primary/50' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && t('goals.editor.step1.title')}
            {step === 2 && t('goals.editor.step2.title')}
            {step === 3 && t('goals.editor.step3.title')}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1 && t('goals.editor.step1.description')}
            {step === 2 && t('goals.editor.step2.description')}
            {step === 3 && t('goals.editor.step3.description')}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Step 1: Main Goal */}
        {step === 1 && (
          <div className="space-y-4">
            <Textarea
              placeholder={t('goals.editor.step1.placeholder')}
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              className="min-h-[120px] text-base"
            />
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 inline mr-1" />
                {t('goals.editor.step1.hint')}
              </p>
            </div>
          </div>
        )}

        {/* Step 2: What to Achieve */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder={t('goals.editor.step2.placeholder')}
                value={achieveInput}
                onChange={(e) => setAchieveInput(e.target.value)}
                className="flex-1"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddAchieve();
                  }
                }}
              />
              <Button onClick={handleAddAchieve} size="lg">
                {t('goals.editor.actions.add')}
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
                placeholder={t('goals.editor.step3.placeholder')}
                value={avoidInput}
                onChange={(e) => setAvoidInput(e.target.value)}
                className="flex-1"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddAvoid();
                  }
                }}
              />
              <Button onClick={handleAddAvoid} size="lg">
                {t('goals.editor.actions.add')}
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
                {t('goals.editor.step3.hint')}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleNext} className="flex-1" size="lg">
            {step === 3 ? t('goals.editor.actions.save') : t('goals.editor.actions.next')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
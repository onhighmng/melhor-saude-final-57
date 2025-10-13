import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Milestone {
  id: string;
  label: string;
  points: number;
  completed: boolean;
}

interface JourneyProgressBarProps {
  onboardingCompleted?: boolean;
}

export const JourneyProgressBar = ({ onboardingCompleted = false }: JourneyProgressBarProps) => {
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const stored = localStorage.getItem('journeyMilestones');
    
    const defaultMilestones = [
      { id: 'onboarding', label: 'Concluiu o onboarding', points: 10, completed: false },
      { id: 'specialist', label: 'Falou com um especialista', points: 20, completed: false },
      { id: 'first_session', label: 'Fez a primeira sessão', points: 25, completed: false },
      { id: 'resources', label: 'Usou recursos da plataforma', points: 15, completed: false },
      { id: 'ratings', label: 'Avaliou 3 sessões efetuadas', points: 20, completed: false },
      { id: 'goal', label: 'Atingiu 1 objetivo pessoal', points: 10, completed: false },
    ];
    
    if (stored) {
      const parsedMilestones = JSON.parse(stored);
      // Update the ratings milestone label if it's outdated
      return parsedMilestones.map((m: Milestone) => {
        if (m.id === 'ratings' && m.label === 'Avaliou 3 sessões') {
          return { ...m, label: 'Avaliou 3 sessões efetuadas' };
        }
        return m;
      });
    }
    
    return defaultMilestones;
  });

  const [showCelebration, setShowCelebration] = useState(false);

  const totalProgress = milestones.reduce((sum, m) => sum + (m.completed ? m.points : 0), 0);

  useEffect(() => {
    // Save milestones to localStorage whenever they change
    localStorage.setItem('journeyMilestones', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    // Handle onboarding completion
    if (onboardingCompleted) {
      const onboardingMilestone = milestones.find(m => m.id === 'onboarding');
      if (onboardingMilestone && !onboardingMilestone.completed) {
        // Mark onboarding as complete
        setMilestones(prev => 
          prev.map(m => m.id === 'onboarding' ? { ...m, completed: true } : m)
        );
        
        // Show celebration
        setShowCelebration(true);
        
        // Trigger confetti
        const duration = 2000;
        const end = Date.now() + duration;

        const colors = ['#22C55E', '#10B981', '#34D399'];

        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        })();

        // Hide celebration message after 4 seconds
        setTimeout(() => setShowCelebration(false), 4000);
      }
    }
  }, [onboardingCompleted]);

  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center z-10 animate-fade-in">
          <div className="text-center space-y-3 animate-scale-in">
            <Heart className="w-16 h-16 text-green-500 mx-auto animate-pulse" fill="currentColor" />
            <p className="text-2xl font-semibold text-green-700 dark:text-green-400">
              O seu bem-estar começa aqui 💚
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Progresso Pessoal</h3>
            <span className="text-2xl font-bold text-primary">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {totalProgress === 100 ? '🎉 Jornada completa!' : 'Continue a sua jornada de bem-estar'}
          </p>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                milestone.completed
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-muted/30 border-border'
              }`}
            >
              {milestone.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${milestone.completed ? 'text-green-700 dark:text-green-400' : ''}`}>
                  {milestone.label}
                </p>
              </div>
              <span className={`text-sm font-semibold ${milestone.completed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                +{milestone.points}%
              </span>
            </div>
          ))}
        </div>

        {totalProgress === 100 && (
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
            <p className="text-green-700 dark:text-green-400 font-semibold">
              🌟 Parabéns! Completou a sua jornada de bem-estar
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

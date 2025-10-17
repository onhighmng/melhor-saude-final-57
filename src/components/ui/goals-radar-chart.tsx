import React, { useState } from 'react';
import { Component } from './radar-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Scale, DollarSign, Heart, Target, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalData {
  id: string;
  title: string;
  pillar: string;
  targetSessions: number;
  completedSessions: number;
  progressPercentage: number;
  progressEmojis: string[];
}

interface GoalsRadarChartProps {
  goals: GoalData[];
  className?: string;
}

// Convert goals data to radar chart format
const convertGoalsToRadarData = (goals: GoalData[]) => {
  return goals.map((goal, index) => ({
    letter: goal.pillar,
    frequency: goal.progressPercentage,
    goal: goal,
    index: index
  }));
};

const getPillarIcon = (pillar: string) => {
  switch (pillar) {
    case 'saude_mental':
      return <Brain className="w-6 h-6" />;
    case 'assistencia_juridica':
      return <Scale className="w-6 h-6" />;
    case 'assistencia_financeira':
      return <DollarSign className="w-6 h-6" />;
    case 'bem_estar_fisico':
      return <Heart className="w-6 h-6" />;
    default:
      return <Target className="w-6 h-6" />;
  }
};

const getPillarLabel = (pillar: string) => {
  switch (pillar) {
    case 'saude_mental':
      return 'Saúde Mental';
    case 'assistencia_juridica':
      return 'Assistência Jurídica';
    case 'assistencia_financeira':
      return 'Assistência Financeira';
    case 'bem_estar_fisico':
      return 'Bem-estar Físico';
    default:
      return pillar;
  }
};

const getPillarColor = (pillar: string) => {
  switch (pillar) {
    case 'saude_mental':
      return 'text-blue-600';
    case 'assistencia_juridica':
      return 'text-purple-600';
    case 'assistencia_financeira':
      return 'text-green-600';
    case 'bem_estar_fisico':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

export function GoalsRadarChart({ goals, className }: GoalsRadarChartProps) {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const radarData = convertGoalsToRadarData(goals);
  const getValue = (d: any) => d.frequency;

  const selectedGoal = selectedPillar ? goals.find(g => g.pillar === selectedPillar) : null;

  return (
    <Card className={cn("bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20", className)}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          🎯 Meus Objetivos
        </CardTitle>
        <CardDescription>
          Clique numa área do radar para ver os detalhes do seu progresso
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Radar Chart - Central Element */}
        <div className="flex justify-center mb-6">
          <div className="relative bg-white rounded-lg p-6 border shadow-sm">
            <Component
              width={500}
              height={500}
              data={radarData}
              getValue={getValue}
              levels={5}
              margin={{ top: 80, right: 80, bottom: 80, left: 80 }}
            />
            
            {/* Pillar Labels around the chart */}
            <div className="absolute inset-0 pointer-events-none">
              {goals.map((goal, index) => {
                const angle = (index * 360) / goals.length;
                const radius = 180;
                const x = Math.cos((angle - 90) * Math.PI / 180) * radius + 250;
                const y = Math.sin((angle - 90) * Math.PI / 180) * radius + 250;
                
                return (
                  <div
                    key={goal.pillar}
                    className="absolute cursor-pointer pointer-events-auto"
                    style={{ left: x - 50, top: y - 30 }}
                    onClick={() => setSelectedPillar(goal.pillar)}
                  >
                    <div className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors border-2",
                      selectedPillar === goal.pillar ? "bg-primary/10 border-primary/20" : "border-transparent hover:border-gray-200"
                    )}>
                      <div className={getPillarColor(goal.pillar)}>
                        {getPillarIcon(goal.pillar)}
                      </div>
                      <span className="text-xs font-medium text-center max-w-20">
                        {getPillarLabel(goal.pillar)}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {goal.progressPercentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {selectedGoal && (
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={getPillarColor(selectedGoal.pillar)}>
                  {getPillarIcon(selectedGoal.pillar)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{getPillarLabel(selectedGoal.pillar)}</h3>
                  <p className="text-sm text-muted-foreground">{selectedGoal.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPillar(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Progress Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedGoal.progressPercentage}%</div>
                  <div className="text-xs text-muted-foreground">Progresso</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedGoal.completedSessions}</div>
                  <div className="text-xs text-muted-foreground">Concluídas</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedGoal.targetSessions}</div>
                  <div className="text-xs text-muted-foreground">Planeadas</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sessões: {selectedGoal.completedSessions}/{selectedGoal.targetSessions}</span>
                  <span>{selectedGoal.progressPercentage}%</span>
                </div>
                <Progress value={selectedGoal.progressPercentage} className="h-3" />
              </div>

              {/* Progress Emojis */}
              <div className="flex justify-center gap-2">
                {selectedGoal.progressEmojis.map((emoji, index) => (
                  <span key={index} className="text-2xl">
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

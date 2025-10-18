import { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  pillar: string;
  targetSessions: number;
  completedSessions: number;
  progressPercentage: number;
  progressEmojis: string[];
}

interface GoalsDisplayProps {
  goals: Goal[];
}

const getPillarColor = (pillar: string) => {
  switch (pillar) {
    case 'saude_mental':
      return 'bg-blue-600';
    case 'assistencia_juridica':
      return 'bg-purple-600';
    case 'assistencia_financeira':
      return 'bg-green-600';
    case 'bem_estar_fisico':
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
};

const getIndicatorColor = (pillar: string) => {
  switch (pillar) {
    case 'saude_mental':
      return 'bg-blue-600';
    case 'assistencia_juridica':
      return 'bg-purple-600';
    case 'assistencia_financeira':
      return 'bg-green-600';
    case 'bem_estar_fisico':
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
};

const renderIndicator = (emoji: string, index: number, pillar: string) => {
  if (emoji === '⚪') {
    return (
      <div
        key={index}
        className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center"
      >
        <span className="text-xs text-gray-500">⚪</span>
      </div>
    );
  } else if (emoji === '🔵') {
    return (
      <div
        key={index}
        className={`w-6 h-6 rounded-full ${getIndicatorColor(pillar)} flex items-center justify-center`}
      >
        <span className="text-xs text-white">🔵</span>
      </div>
    );
  } else {
    // Regular emojis like 😟, 🙂, 😄, 💸
    return (
      <span key={index} className="text-lg">
        {emoji}
      </span>
    );
  }
};

export function GoalsDisplay({ goals }: GoalsDisplayProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-blue-500 flex items-center justify-center">
          <Target className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Meus Objetivos</h3>
          <p className="text-sm text-gray-600">Acompanhe o progresso dos seus objetivos de bem-estar</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-2">
            {/* Goal Title */}
            <h4 className="font-semibold text-gray-900 text-base">{goal.title}</h4>
            
            {/* Progress Section */}
            <div className="flex items-center gap-4">
              {/* Progress Bar */}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{goal.progressPercentage}% alcançado</span>
                </div>
                <Progress 
                  value={goal.progressPercentage} 
                  className="h-3"
                  indicatorClassName={getPillarColor(goal.pillar)}
                />
                <div className="text-sm text-gray-600">
                  {goal.completedSessions}/{goal.targetSessions} sessões completadas
                </div>
              </div>
              
              {/* Visual Indicators (Emojis) */}
              <div className="flex gap-1 justify-end items-center">
                {goal.progressEmojis.map((emoji, index) => 
                  renderIndicator(emoji, index, goal.pillar)
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

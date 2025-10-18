import React, { useState } from 'react';
import { Pie } from '@visx/shape';
import { scaleOrdinal } from '@visx/scale';
import { Group } from '@visx/group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Scale, DollarSign, Heart, Target, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { animated, useTransition, interpolate } from '@react-spring/web';

interface GoalData {
  id: string;
  title: string;
  pillar: string;
  targetSessions: number;
  completedSessions: number;
  progressPercentage: number;
  progressEmojis: string[];
}

interface GoalsPieChartProps {
  goals: GoalData[];
  className?: string;
}

// Convert goals data to pie chart format
const convertGoalsToPieData = (goals: GoalData[]) => {
  return goals.map((goal) => ({
    label: getPillarLabel(goal.pillar), // Use formatted label instead of raw pillar
    value: Math.max(goal.progressPercentage, 1), // Ensure minimum value of 1 for visibility
    goal: goal,
  }));
};

const getPillarIcon = (pillar: string) => {
  switch (pillar) {
    case 'saude_mental':
      return <Brain className="w-5 h-5" />;
    case 'assistencia_juridica':
      return <Scale className="w-5 h-5" />;
    case 'assistencia_financeira':
      return <DollarSign className="w-5 h-5" />;
    case 'bem_estar_fisico':
      return <Heart className="w-5 h-5" />;
    default:
      return <Target className="w-5 h-5" />;
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
      return '#3B82F6'; // Blue
    case 'assistencia_juridica':
      return '#8B5CF6'; // Purple
    case 'assistencia_financeira':
      return '#10B981'; // Green
    case 'bem_estar_fisico':
      return '#F59E0B'; // Yellow
    default:
      return '#6B7280'; // Gray
  }
};

const getPillarColorScale = scaleOrdinal({
  domain: ['Saúde Mental', 'Assistência Jurídica', 'Assistência Financeira', 'Bem-estar Físico'],
  range: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'],
});

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

const fromLeaveTransition = ({ endAngle }: any) => ({
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});
const enterUpdateTransition = ({ startAngle, endAngle }: any) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

type AnimatedPieProps<Datum> = any & {
  animate?: boolean;
  getKey: (d: any) => string;
  getColor: (d: any) => string;
  onClickDatum: (d: any) => void;
  delay?: number;
};

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<any, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });
  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;

    return (
      <g key={key}>
        <animated.path
          d={interpolate([props.startAngle, props.endAngle], (startAngle, endAngle) =>
            path({
              ...arc,
              startAngle,
              endAngle,
            }),
          )}
          fill={getColor(arc)}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
        {hasSpaceForLabel && (
          <animated.g style={{ opacity: props.opacity }}>
            <text
              fill="white"
              x={centroidX}
              y={centroidY}
              dy=".33em"
              fontSize={12}
              fontWeight="bold"
              textAnchor="middle"
              pointerEvents="none"
            >
              {getKey(arc)}
            </text>
          </animated.g>
        )}
      </g>
    );
  });
}

export function GoalsPieChart({ goals, className }: GoalsPieChartProps) {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const pieData = convertGoalsToPieData(goals);
  const getValue = (d: any) => d.value;

  // Debug: Log the pie data to ensure it's correct
  console.log('GoalsPieChart - goals:', goals);
  console.log('GoalsPieChart - pieData:', pieData);

  const selectedGoal = selectedPillar ? goals.find(g => g.pillar === selectedPillar) : null;

  // Make pie chart larger and ensure all 4 pillars are visible
  const width = 400;
  const height = 400;
  const margin = defaultMargin;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;

  return (
    <Card className={cn("w-full relative overflow-hidden", className)}>
      {/* Blue gradient background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1600 600\'%3E%3Cdefs%3E%3ClinearGradient id=\'blueGrad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23F0F9FF;stop-opacity:1\' /%3E%3Cstop offset=\'20%25\' style=\'stop-color:%23E0F2FE;stop-opacity:1\' /%3E%3Cstop offset=\'40%25\' style=\'stop-color:%23BAE6FD;stop-opacity:1\' /%3E%3Cstop offset=\'60%25\' style=\'stop-color:%237DD3FC;stop-opacity:1\' /%3E%3Cstop offset=\'80%25\' style=\'stop-color:%2338BDF8;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%230EA5E9;stop-opacity:1\' /%3E%3C/linearGradient%3E%3CradialGradient id=\'highlight\' cx=\'70%25\' cy=\'20%25\' r=\'40%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23FFFFFF;stop-opacity:0.8\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23FFFFFF;stop-opacity:0\' /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width=\'1600\' height=\'600\' fill=\'url(%23blueGrad)\'/%3E%3Crect width=\'1600\' height=\'600\' fill=\'url(%23highlight)\'/%3E%3C/svg%3E")'
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-2xl flex items-center gap-2 text-black">
          🎯 Meus Objetivos
        </CardTitle>
        <CardDescription className="text-black/80">
          Acompanhe o progresso dos seus objetivos de bem-estar em cada área
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col lg:flex-row gap-8 p-6 relative z-10">
        {/* Left Section: Pie Chart */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <svg width={width} height={height}>
              <rect rx={14} width={width} height={height} fill="#f8fafc" />
              <Group top={centerY + margin.top} left={centerX + margin.left}>
                <Pie
                  data={pieData}
                  pieValue={getValue}
                  outerRadius={radius}
                  innerRadius={radius * 0.4}
                  cornerRadius={3}
                  padAngle={0.01}
                >
                  {(pie) => (
                    <AnimatedPie
                      {...pie}
                      animate={true}
                      getKey={(arc) => arc.data.label}
                      onClickDatum={({ data }) => {
                        const pillarKey = data.goal.pillar;
                        setSelectedPillar(selectedPillar === pillarKey ? null : pillarKey);
                      }}
                      getColor={(arc) => getPillarColorScale(arc.data.label)}
                    />
                  )}
                </Pie>
              </Group>
            </svg>
            
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {goals.map((goal) => (
                <div
                  key={goal.pillar}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    selectedPillar === goal.pillar ? "bg-primary/10" : "hover:bg-gray-50"
                  )}
                  onClick={() => setSelectedPillar(selectedPillar === goal.pillar ? null : goal.pillar)}
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getPillarColor(goal.pillar) }}
                  />
                  <span className="text-sm font-medium">{getPillarLabel(goal.pillar)}</span>
                  <span className="text-sm font-bold text-primary">{goal.progressPercentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Selected Pillar Information or Instructions */}
        <div className="flex-1 flex items-center justify-center">
          {selectedGoal ? (
            <div className="bg-white rounded-lg p-6 border shadow-sm w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: getPillarColor(selectedGoal.pillar) + '20' }}
                  >
                    <div style={{ color: getPillarColor(selectedGoal.pillar) }}>
                      {getPillarIcon(selectedGoal.pillar)}
                    </div>
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
                  <Progress 
                    value={selectedGoal.progressPercentage} 
                    className="h-3"
                    style={{
                      '--progress-background': getPillarColor(selectedGoal.pillar)
                    } as React.CSSProperties}
                  />
                </div>

                {/* Progress Emojis */}
                <div className="flex justify-center gap-2">
                  {selectedGoal.progressEmojis.map((emoji, index) => (
                    <span key={index} className="text-2xl">
                      {emoji}
                    </span>
                  ))}
                </div>

                {/* Motivational Message */}
                <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    {selectedGoal.progressPercentage >= 70 
                      ? "Excelente progresso! Continue assim!" 
                      : selectedGoal.progressPercentage >= 40 
                      ? "Bom progresso! Mantenha o ritmo."
                      : selectedGoal.progressPercentage > 0
                      ? "Cada passo conta. Continue focado!"
                      : "Comece a sua jornada de bem-estar!"
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-lg border shadow-sm w-full max-w-md">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Selecione um Objetivo
                </h3>
                <p className="text-muted-foreground">
                  Clique numa área do gráfico ou no nome de um objetivo para ver os detalhes do seu progresso
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Como usar:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li>• Clique no gráfico circular</li>
                  <li>• Clique nos nomes dos objetivos abaixo</li>
                  <li>• Veja o progresso detalhado</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

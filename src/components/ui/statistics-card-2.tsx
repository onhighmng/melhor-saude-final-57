import { Badge } from '@/components/ui/badge-2';
import { Button } from '@/components/ui/button-1';
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '@/components/ui/enhanced-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowDown, ArrowUp, MoreHorizontal, Pin, Settings, Share2, Trash, TriangleAlert } from 'lucide-react';
import { Brain, Scale, DollarSign, Heart } from 'lucide-react';

interface GoalData {
  id: string;
  title: string;
  pillar: string;
  targetSessions: number;
  completedSessions: number;
  progressPercentage: number;
  progressEmojis: string[];
}

interface StatisticsCard2Props {
  goals: GoalData[];
}

const getPillarIcon = (pillar: string) => {
  switch (pillar) {
    case 'saude_mental':
      return Brain;
    case 'assistencia_juridica':
      return Scale;
    case 'assistencia_financeira':
      return DollarSign;
    case 'bem_estar_fisico':
      return Heart;
    default:
      return Brain;
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

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return n.toLocaleString();
  return n.toString();
}

export function StatisticsCard2({ goals }: StatisticsCard2Props) {
  const stats = goals.map((goal, index) => {
    const icon = getPillarIcon(goal.pillar);
    const IconComponent = icon;
    
    // Calculate delta (change from target vs completed)
    const delta = goal.targetSessions > 0 ? ((goal.completedSessions / goal.targetSessions) - (goal.progressPercentage / 100)) * 100 : 0;
    const positive = delta >= 0;
    
    // Define colors based on pillar
    let bg = 'bg-blue-600';
    let textColor = 'text-blue-600';
    
    switch (goal.pillar) {
      case 'saude_mental':
        bg = 'bg-blue-600';
        break;
      case 'assistencia_juridica':
        bg = 'bg-purple-600';
        break;
      case 'assistencia_financeira':
        bg = 'bg-green-600';
        break;
      case 'bem_estar_fisico':
        bg = 'bg-orange-600';
        break;
    }

    return {
      title: getPillarLabel(goal.pillar),
      value: goal.progressPercentage,
      delta: Math.abs(delta),
      lastMonth: goal.completedSessions,
      positive,
      prefix: '',
      suffix: '%',
      format: (v: number) => `${v.toFixed(0)}%`,
      lastFormat: (v: number) => `${v} sessões`,
      bg,
      icon: IconComponent,
      goal,
      svg: (
        <svg
          className="absolute right-0 top-0 h-full w-2/3 pointer-events-none"
          viewBox="0 0 300 200"
          fill="none"
          style={{ zIndex: 0 }}
        >
          <circle cx="220" cy="100" r="90" fill="#fff" fillOpacity="0.08" />
          <circle cx="260" cy="60" r="60" fill="#fff" fillOpacity="0.10" />
          <circle cx="200" cy="160" r="50" fill="#fff" fillOpacity="0.07" />
          <circle cx="270" cy="150" r="30" fill="#fff" fillOpacity="0.12" />
        </svg>
      ),
    };
  });

  return (
    <div className="w-full px-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            
            return (
              <Card key={index} className={`relative overflow-hidden ${stat.bg} text-white`}>
                <CardHeader className="border-0 z-10 relative">
                  <CardTitle className="text-white/90 text-sm font-medium flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    {stat.title}
                  </CardTitle>
                  <CardToolbar>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" mode="icon" className="-me-1.5 text-white/80 hover:text-white">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="bottom">
                        <DropdownMenuItem>
                          <Settings /> Configurações
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TriangleAlert /> Adicionar Alerta
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pin /> Fixar no Painel
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 /> Partilhar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash /> Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardToolbar>
                </CardHeader>
                <CardContent className="space-y-2.5 z-10 relative">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-semibold tracking-tight">
                      {stat.format ? stat.format(stat.value) : stat.prefix + formatNumber(stat.value) + stat.suffix}
                    </span>
                    <Badge className="bg-white/20 font-semibold">
                      {stat.positive ? <ArrowUp /> : <ArrowDown />}
                      {stat.delta.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-xs text-white/80 mt-2 border-t border-white/20 pt-2.5">
                    Sessões completadas:{' '}
                    <span className="font-medium text-white">
                      {stat.lastFormat
                        ? stat.lastFormat(stat.lastMonth)
                        : stat.prefix + formatNumber(stat.lastMonth) + stat.suffix}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-300" 
                        style={{ width: `${Math.min(stat.value, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
                
                {/* Background SVG */}
                {stat.svg}
              </Card>
            );
          })}
        </div>
        
        {/* Instructions */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto shadow-sm border">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecione um Objetivo</h3>
            <p className="text-gray-600 mb-4">
              Clique numa área do gráfico ou no nome de um objetivo para ver os detalhes do seu progresso
            </p>
            <div className="text-left space-y-2">
              <p className="text-sm text-gray-700 font-medium">Como usar:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Clique no gráfico circular</li>
                <li>• Clique nos nomes dos objetivos abaixo</li>
                <li>• Veja o progresso detalhado</li>
              </ul>
            </div>
          </div>
        </div>
    </div>
  );
}

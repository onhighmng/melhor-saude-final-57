import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  UserCheck, 
  Users, 
  Calendar,
  TrendingDown,
  Crown,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MetricsData {
  activeCompanies: number;
  activeUsers: number;
  registeredProviders: number;
  sessionsThisMonth: number;
  absenceRate: number;
  topPillar: string;
  functionErrors: number;
}

interface PlatformAnalyticsOverviewProps {
  metrics: MetricsData;
}

const PlatformAnalyticsOverview = ({ metrics }: PlatformAnalyticsOverviewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const metricsData = [
    {
      title: "Empresas Ativas",
      value: metrics.activeCompanies,
      icon: Building2,
      trend: { direction: "up", value: "+12%", label: "vs mês anterior" },
      color: "text-emerald-green"
    },
    {
      title: "Utilizadores Ativos (MTD)",
      value: metrics.activeUsers.toLocaleString(),
      icon: UserCheck,
      trend: { direction: "up", value: "+8%", label: "vs mês anterior" },
      color: "text-bright-royal"
    },
    {
      title: "Prestadores Registados",
      value: metrics.registeredProviders,
      icon: Users,
      trend: { direction: "up", value: "+3", label: "novos esta semana" },
      color: "text-vibrant-blue"
    },
    {
      title: "Sessões Realizadas (MTD)",
      value: metrics.sessionsThisMonth,
      icon: Calendar,
      trend: { direction: "up", value: "+15%", label: "vs mês anterior" },
      color: "text-accent"
    },
    {
      title: "Taxa de Faltas (%)",
      value: `${metrics.absenceRate}%`,
      icon: TrendingDown,
      trend: { direction: "down", value: "-2%", label: "vs mês anterior" },
      color: "text-warm-orange"
    },
    {
      title: "Top Pilar do Mês",
      value: metrics.topPillar,
      icon: Crown,
      trend: { direction: "neutral", value: "43%", label: "das sessões" },
      color: "text-emerald-green",
      isText: true
    },
    {
      title: "Erros de Funções (7d)",
      value: metrics.functionErrors,
      icon: AlertCircle,
      trend: { direction: "down", value: "-5", label: "vs semana anterior" },
      color: "text-destructive"
    }
  ];

  const getTrendIcon = (direction: string) => {
    if (direction === "up") return <ArrowUpRight className="h-3 w-3 inline text-green-600" />;
    if (direction === "down") return <ArrowDownRight className="h-3 w-3 inline text-green-600" />;
    return null;
  };

  const getTrendColor = (direction: string) => {
    if (direction === "down" && !["Taxa de Faltas", "Erros de Funções"].some(metric => metricsData.find(m => m.title.includes(metric.split(" ")[0])))) {
      return "text-red-600";
    }
    return "text-green-600";
  };

  return (
    <Card className="hover-lift h-fit">
      <CardHeader 
        className="pb-3 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            Platform Analytics
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
        {!isExpanded && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-green">{metrics.activeCompanies}</div>
              <div className="text-xs text-muted-foreground">Empresas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-bright-royal">{metrics.activeUsers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Utilizadores</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">{metrics.sessionsThisMonth}</div>
              <div className="text-xs text-muted-foreground">Sessões MTD</div>
            </div>
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {metricsData.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`h-4 w-4 ${metric.color}`} />
                    <span className="text-sm font-medium text-muted-foreground">{metric.title}</span>
                  </div>
                  <div className={`${metric.isText ? 'text-lg' : 'text-2xl'} font-bold text-foreground mb-1`}>
                    {metric.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getTrendIcon(metric.trend.direction)}
                    <span className={getTrendColor(metric.trend.direction)}>
                      {metric.trend.value}
                    </span>{' '}
                    {metric.trend.label}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PlatformAnalyticsOverview;
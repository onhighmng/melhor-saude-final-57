import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Heart, DollarSign, Scale, TrendingUp, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Recommendation {
  id: string;
  employeeName: string;
  employeeInitials: string;
  pillar: string;
  reason: string;
  resourceTitle: string;
  resourceType: string;
  confidence: number;
  status: 'pending' | 'sent' | 'viewed';
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    employeeName: 'Maria Silva',
    employeeInitials: 'MS',
    pillar: 'saude_mental',
    reason: 'Feedback indica stress elevado',
    resourceTitle: 'Gestão de Stress no Trabalho',
    resourceType: 'Artigo',
    confidence: 92,
    status: 'pending'
  },
  {
    id: '2',
    employeeName: 'João Santos',
    employeeInitials: 'JS',
    pillar: 'bem_estar_fisico',
    reason: 'Interesse em exercício físico',
    resourceTitle: 'Rotina de Exercícios em Casa',
    resourceType: 'Vídeo',
    confidence: 87,
    status: 'sent'
  },
  {
    id: '3',
    employeeName: 'Ana Costa',
    employeeInitials: 'AC',
    pillar: 'assistencia_financeira',
    reason: 'Completou sessão de planeamento',
    resourceTitle: 'Planeamento Financeiro Básico',
    resourceType: 'Guia',
    confidence: 95,
    status: 'viewed'
  },
  {
    id: '4',
    employeeName: 'Pedro Oliveira',
    employeeInitials: 'PO',
    pillar: 'saude_mental',
    reason: 'Padrão de uso indica ansiedade',
    resourceTitle: 'Exercícios de Respiração',
    resourceType: 'Vídeo',
    confidence: 89,
    status: 'pending'
  },
  {
    id: '5',
    employeeName: 'Sofia Rodrigues',
    employeeInitials: 'SR',
    pillar: 'assistencia_juridica',
    reason: 'Questões sobre direitos laborais',
    resourceTitle: 'Direitos do Trabalhador',
    resourceType: 'Artigo',
    confidence: 84,
    status: 'sent'
  }
];

const pillarIcons = {
  saude_mental: Brain,
  bem_estar_fisico: Heart,
  assistencia_financeira: DollarSign,
  assistencia_juridica: Scale
};

const pillarColors = {
  saude_mental: 'bg-blue-500/10 text-blue-700 border-blue-200',
  bem_estar_fisico: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  assistencia_financeira: 'bg-green-500/10 text-green-700 border-green-200',
  assistencia_juridica: 'bg-purple-500/10 text-purple-700 border-purple-200'
};

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-700',
  sent: 'bg-blue-500/10 text-blue-700',
  viewed: 'bg-green-500/10 text-green-700'
};

const statusLabels = {
  pending: 'Pendente',
  sent: 'Enviado',
  viewed: 'Visualizado'
};

export function AdminRecommendationsTab() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recomendações Ativas</p>
                <p className="font-mono text-xl font-semibold mt-1">24</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Visualização</p>
                <p className="font-mono text-xl font-semibold mt-1">68%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="text-green-700 text-sm font-semibold">↑</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confiança Média</p>
                <p className="font-mono text-xl font-semibold mt-1">89%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Brain className="h-4 w-4 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações Automáticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecommendations.map((rec) => {
              const PillarIcon = pillarIcons[rec.pillar as keyof typeof pillarIcons];
              const pillarColor = pillarColors[rec.pillar as keyof typeof pillarColors];

              return (
                <div 
                  key={rec.id} 
                  className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {rec.employeeInitials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{rec.employeeName}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Badge className={pillarColor} variant="outline">
                        <PillarIcon className="h-3 w-3 mr-1" />
                        {rec.pillar.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {rec.reason}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium">
                        Recomendado: {rec.resourceTitle}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {rec.resourceType}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Confiança</div>
                      <div className="text-lg font-bold text-primary">{rec.confidence}%</div>
                    </div>
                    
                    <Badge className={statusColors[rec.status]}>
                      {statusLabels[rec.status]}
                    </Badge>

                    {rec.status === 'pending' && (
                      <Button size="sm">Enviar</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

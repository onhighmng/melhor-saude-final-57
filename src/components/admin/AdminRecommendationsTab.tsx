import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Heart, DollarSign, Scale, TrendingUp, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  sent: 'bg-blue-500/10 text-blue-700 border-blue-200',
  viewed: 'bg-green-500/10 text-green-700 border-green-200'
};

const statusLabels = {
  pending: 'Pendente',
  sent: 'Enviado',
  viewed: 'Visualizado'
};

export default function AdminRecommendationsTab() {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('resource_recommendations')
        .select(`
          *,
          user:profiles(name),
          resource:resources(title, type)
        `)
        .order('confidence_score', { ascending: false });

      if (error) throw error;

      const recs = (data || []).map((rec: any) => {
        const userName = rec.user?.name || 'Unknown';
        const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
        const resourceTitle = rec.resource?.title || '';
        const resourceType = rec.resource?.type || 'Artigo';

        return {
          id: rec.id,
          employeeName: userName,
          employeeInitials: initials,
          pillar: rec.pillar,
          reason: rec.reason || 'N/A',
          resourceTitle,
          resourceType,
          confidence: rec.confidence_score || 0,
          status: rec.status as 'pending' | 'sent' | 'viewed'
        };
      });

      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: 'Erro ao carregar recomendações',
        description: 'Não foi possível carregar as recomendações.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (recId: string) => {
    try {
      await supabase
        .from('resource_recommendations')
        .update({ status: 'sent' })
        .eq('id', recId);

      toast({
        title: 'Recomendação enviada',
        description: 'A recomendação foi enviada com sucesso.',
      });

      await loadRecommendations();
    } catch (error) {
      console.error('Error sending recommendation:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a recomendação.',
        variant: 'destructive'
      });
    }
  };

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
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando recomendações...
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma recomendação disponível
              </div>
            ) : (
              recommendations.map((rec) => {
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
                      <Button size="sm" onClick={() => handleSend(rec.id)}>Enviar</Button>
                    )}
                  </div>
                 </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

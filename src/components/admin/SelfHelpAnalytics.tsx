import React from 'react';
import { useContentAnalytics } from '@/hooks/useSelfHelp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, TrendingUp, FileText, Brain } from 'lucide-react';

const SelfHelpAnalytics: React.FC = () => {
  const { analytics, loading } = useContentAnalytics();

  if (loading) return <div>A carregar analytics...</div>;

  const topContent = analytics.slice(0, 5);
  const totalViews = analytics.reduce((sum, item) => sum + item.total_views, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conteúdos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo Mais Popular</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topContent.map((item, index) => (
              <div key={item.content_id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{item.total_views}</p>
                  <p className="text-sm text-muted-foreground">visualizações</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelfHelpAnalytics;
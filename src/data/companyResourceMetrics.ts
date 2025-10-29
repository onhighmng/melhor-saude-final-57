export interface ResourceMetrics {
  totalViews: number;
  engagementRate: number; // percentage of employees who viewed resources
  mostViewedPillar: string;
  avgResourcesPerEmployee: number;
  pillarDistribution: Array<{ 
    pillar: string; 
    pillarKey: string;
    views: number; 
    percentage: number;
    color: string;
  }>;
  topResources: Array<{ 
    title: string; 
    pillar: string;
    pillarKey: string;
    views: number; 
    type: string;
    engagementRate: number;
  }>;
  viewsTrend: Array<{ 
    month: string; 
    views: number;
    uniqueViewers: number;
  }>;
  resourceTypeBreakdown: Array<{ 
    type: string; 
    count: number;
    percentage: number;
  }>;
  pillarEngagementSummary: Array<{
    pillar: string;
    pillarKey: string;
    totalViews: number;
    uniqueViewers: number;
    engagementRate: number;
    topResource: string;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
  }>;
}

export const mockResourceMetrics: ResourceMetrics = {
  totalViews: 3847,
  engagementRate: 68, // 68% of employees viewed at least one resource
  mostViewedPillar: 'Saúde Mental',
  avgResourcesPerEmployee: 4.2,
  
  pillarDistribution: [
    { 
      pillar: 'Saúde Mental', 
      pillarKey: 'saude_mental',
      views: 1616, 
      percentage: 42,
      color: 'hsl(var(--chart-1))' // cyan/blue
    },
    { 
      pillar: 'Assistência Financeira', 
      pillarKey: 'assistencia_financeira',
      views: 1077, 
      percentage: 28,
      color: 'hsl(var(--chart-2))' // green
    },
    { 
      pillar: 'Bem-Estar Físico', 
      pillarKey: 'bem_estar_fisico',
      views: 769, 
      percentage: 20,
      color: 'hsl(var(--chart-3))' // yellow
    },
    { 
      pillar: 'Assistência Jurídica', 
      pillarKey: 'assistencia_juridica',
      views: 385, 
      percentage: 10,
      color: 'hsl(var(--chart-4))' // purple
    },
  ],
  
  topResources: [
    {
      title: 'Guia Completo de Saúde Mental',
      pillar: 'Saúde Mental',
      pillarKey: 'saude_mental',
      views: 427,
      type: 'Guia',
      engagementRate: 85
    },
    {
      title: 'Técnicas de Gestão de Stress',
      pillar: 'Saúde Mental',
      pillarKey: 'saude_mental',
      views: 392,
      type: 'Vídeo',
      engagementRate: 78
    },
    {
      title: 'Planeamento Financeiro Pessoal',
      pillar: 'Assistência Financeira',
      pillarKey: 'assistencia_financeira',
      views: 356,
      type: 'Guia',
      engagementRate: 71
    },
    {
      title: 'Como Poupar para a Reforma',
      pillar: 'Assistência Financeira',
      pillarKey: 'assistencia_financeira',
      views: 318,
      type: 'Artigo',
      engagementRate: 63
    },
    {
      title: 'Exercícios para o Trabalho',
      pillar: 'Bem-Estar Físico',
      pillarKey: 'bem_estar_fisico',
      views: 289,
      type: 'Vídeo',
      engagementRate: 58
    },
    {
      title: 'Nutrição e Produtividade',
      pillar: 'Bem-Estar Físico',
      pillarKey: 'bem_estar_fisico',
      views: 247,
      type: 'Artigo',
      engagementRate: 49
    },
    {
      title: 'Direitos do Trabalhador',
      pillar: 'Assistência Jurídica',
      pillarKey: 'assistencia_juridica',
      views: 213,
      type: 'Guia',
      engagementRate: 42
    },
    {
      title: 'Mindfulness no Trabalho',
      pillar: 'Saúde Mental',
      pillarKey: 'saude_mental',
      views: 198,
      type: 'Artigo',
      engagementRate: 39
    },
    {
      title: 'Gestão de Investimentos',
      pillar: 'Assistência Financeira',
      pillarKey: 'assistencia_financeira',
      views: 176,
      type: 'Guia',
      engagementRate: 35
    },
    {
      title: 'Ergonomia no Escritório',
      pillar: 'Bem-Estar Físico',
      pillarKey: 'bem_estar_fisico',
      views: 154,
      type: 'Vídeo',
      engagementRate: 31
    },
  ],
  
  viewsTrend: [
    { month: 'Jan', views: 287, uniqueViewers: 124 },
    { month: 'Fev', views: 312, uniqueViewers: 143 },
    { month: 'Mar', views: 298, uniqueViewers: 136 },
    { month: 'Abr', views: 356, uniqueViewers: 167 },
    { month: 'Mai', views: 423, uniqueViewers: 189 },
    { month: 'Jun', views: 398, uniqueViewers: 178 },
    { month: 'Jul', views: 367, uniqueViewers: 165 },
    { month: 'Ago', views: 412, uniqueViewers: 182 },
    { month: 'Set', views: 445, uniqueViewers: 201 },
    { month: 'Out', views: 549, uniqueViewers: 234 },
  ],
  
  resourceTypeBreakdown: [
    { type: 'Guia', count: 1847, percentage: 48 },
    { type: 'Vídeo', count: 1154, percentage: 30 },
    { type: 'Artigo', count: 846, percentage: 22 },
  ],
  
  pillarEngagementSummary: [
    {
      pillar: 'Saúde Mental',
      pillarKey: 'saude_mental',
      totalViews: 1616,
      uniqueViewers: 387,
      engagementRate: 77,
      topResource: 'Guia Completo de Saúde Mental',
      trend: 'up',
      trendPercentage: 18
    },
    {
      pillar: 'Assistência Financeira',
      pillarKey: 'assistencia_financeira',
      totalViews: 1077,
      uniqueViewers: 298,
      engagementRate: 59,
      topResource: 'Planeamento Financeiro Pessoal',
      trend: 'up',
      trendPercentage: 12
    },
    {
      pillar: 'Bem-Estar Físico',
      pillarKey: 'bem_estar_fisico',
      totalViews: 769,
      uniqueViewers: 234,
      engagementRate: 47,
      topResource: 'Exercícios para o Trabalho',
      trend: 'stable',
      trendPercentage: 3
    },
    {
      pillar: 'Assistência Jurídica',
      pillarKey: 'assistencia_juridica',
      totalViews: 385,
      uniqueViewers: 156,
      engagementRate: 31,
      topResource: 'Direitos do Trabalhador',
      trend: 'up',
      trendPercentage: 8
    },
  ]
};

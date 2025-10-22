import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { BookOpen, TrendingUp, Users, Eye, Download, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useCompanyResourceAnalytics } from "@/hooks/useCompanyResourceAnalytics";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CompanyResources() {
  const { metrics, isLoading } = useCompanyResourceAnalytics();

  const handleExportReport = () => {
    toast.success("Relatório de recursos será exportado em breve");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <PageHeader
          title="Análise de Recursos"
          subtitle="Carregando métricas..."
          icon={BookOpen}
          sticky={false}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <PageHeader
          title="Análise de Recursos"
          subtitle="Erro ao carregar dados"
          icon={BookOpen}
          sticky={false}
        />
      </div>
    );
  }

  // Pillar color mapping
  const getPillarColor = (pillarKey: string) => {
    const colorMap: Record<string, string> = {
      'saude_mental': 'from-cyan-50 to-cyan-100',
      'bem_estar_fisico': 'from-yellow-50 to-yellow-100',
      'assistencia_financeira': 'from-emerald-50 to-emerald-100',
      'assistencia_juridica': 'from-purple-50 to-purple-100',
    };
    return colorMap[pillarKey] || 'from-gray-50 to-gray-100';
  };

  const getPillarTextColor = (pillarKey: string) => {
    const colorMap: Record<string, string> = {
      'saude_mental': 'text-cyan-700',
      'bem_estar_fisico': 'text-yellow-700',
      'assistencia_financeira': 'text-emerald-700',
      'assistencia_juridica': 'text-purple-700',
    };
    return colorMap[pillarKey] || 'text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader
        title="Análise de Recursos"
        subtitle="Compreenda como os colaboradores utilizam recursos de bem-estar"
        icon={BookOpen}
        sticky={false}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Export Button */}
        <div className="flex justify-end">
          <Button onClick={handleExportReport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>

        {/* Top Metrics Cards - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visualizações Este Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{metrics.totalViews.toLocaleString()}</div>
              <p className="text-xs text-blue-600 mt-1">Total de recursos visualizados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Taxa de Envolvimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{metrics.engagementRate}%</div>
              <p className="text-xs text-green-600 mt-1">Dos colaboradores acederam recursos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Pilar Mais Visto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-900">{metrics.mostViewedPillar}</div>
              <p className="text-xs text-purple-600 mt-1">{metrics.pillarDistribution[0].percentage}% das visualizações</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Média por Colaborador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{metrics.avgResourcesPerEmployee}</div>
              <p className="text-xs text-orange-600 mt-1">Recursos visualizados por pessoa</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trend Chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Tendência de Visualizações</CardTitle>
                <p className="text-sm text-muted-foreground">Evolução mensal de acesso a recursos</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.viewsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Visualizações"
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="uniqueViewers" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Utilizadores Únicos"
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Resources Bar Chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Recursos Mais Visualizados</CardTitle>
                <p className="text-sm text-muted-foreground">Top 10 recursos por número de visualizações</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={metrics.topResources} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis 
                      type="category" 
                      dataKey="title" 
                      width={200} 
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                    <Bar dataKey="views" fill="#3b82f6" name="Visualizações" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Pillar Distribution Pie Chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Distribuição por Pilar</CardTitle>
                <p className="text-sm text-muted-foreground">Visualizações por área de bem-estar</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.pillarDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ pillar, percentage }) => `${pillar.split(' ')[0]} ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="views"
                    >
                      {metrics.pillarDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resource Type Breakdown */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Tipos de Recursos</CardTitle>
                <p className="text-sm text-muted-foreground">Preferência por formato</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.resourceTypeBreakdown.map((type) => (
                  <div key={type.type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">{type.type}</span>
                      <span className="text-sm text-muted-foreground">{type.count} ({type.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${type.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Pillar Engagement Summary Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Resumo de Envolvimento por Pilar</CardTitle>
            <p className="text-sm text-muted-foreground">Análise detalhada de cada área de bem-estar (dados anonimizados)</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Pilar</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Total Visualizações</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Taxa Envolvimento</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Recurso Mais Visto</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Tendência</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.pillarEngagementSummary.map((pillar) => (
                    <tr key={pillar.pillarKey} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                          `bg-gradient-to-r ${getPillarColor(pillar.pillarKey)}`,
                          getPillarTextColor(pillar.pillarKey)
                        )}>
                          {pillar.pillar}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {pillar.totalViews.toLocaleString()}
                        <span className="block text-xs text-gray-500">{pillar.uniqueViewers} utilizadores únicos</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{pillar.engagementRate}%</span>
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${pillar.engagementRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700 max-w-xs truncate">
                        {pillar.topResource}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {pillar.trend === 'up' && (
                            <>
                              <ArrowUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">+{pillar.trendPercentage}%</span>
                            </>
                          )}
                          {pillar.trend === 'down' && (
                            <>
                              <ArrowDown className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium text-red-600">-{pillar.trendPercentage}%</span>
                            </>
                          )}
                          {pillar.trend === 'stable' && (
                            <>
                              <Minus className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-600">{pillar.trendPercentage}%</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Nota de Privacidade:</span> Todos os dados apresentados são agregados e anonimizados. 
              Nenhuma informação individual de colaboradores é exposta neste relatório, garantindo total privacidade.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Target, FileText, Activity } from "lucide-react";

const satisfactionData = [
  { month: 'Jul', score: 7.8 },
  { month: 'Ago', score: 8.1 },
  { month: 'Set', score: 8.3 },
  { month: 'Out', score: 8.5 },
  { month: 'Nov', score: 8.2 },
  { month: 'Dez', score: 8.6 }
];

const resourceUsageData = [
  { name: 'Gestão de Stress', views: 245, pillar: 'Saúde Mental' },
  { name: 'Exercícios em Casa', views: 312, pillar: 'Bem-Estar Físico' },
  { name: 'Planeamento Financeiro', views: 156, pillar: 'Assistência Financeira' },
  { name: 'Direitos do Trabalhador', views: 198, pillar: 'Assistência Jurídica' },
  { name: 'Técnicas de Relaxamento', views: 267, pillar: 'Saúde Mental' }
];

const pillarActivityData = [
  { name: 'Saúde Mental', value: 42, color: '#3b82f6' },
  { name: 'Bem-Estar Físico', value: 28, color: '#10b981' },
  { name: 'Assistência Financeira', value: 18, color: '#f97316' },
  { name: 'Assistência Jurídica', value: 12, color: '#a855f7' }
];

export function AdminResultsTab() {
  return (
    <div className="space-y-6">
      {/* Key Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessões Nota ≥ 8</p>
                <p className="text-3xl font-bold mt-1">87%</p>
                <p className="text-xs text-green-600 mt-1">↑ 5% vs mês anterior</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Objetivos Atingidos</p>
                <p className="text-3xl font-bold mt-1">64%</p>
                <p className="text-xs text-blue-600 mt-1">↑ 8% vs mês anterior</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Visualizações</p>
                <p className="text-3xl font-bold mt-1">1.2k</p>
                <p className="text-xs text-orange-600 mt-1">Este mês</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Engagement</p>
                <p className="text-3xl font-bold mt-1">76%</p>
                <p className="text-xs text-purple-600 mt-1">↑ 3% vs mês anterior</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Satisfaction Evolution */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Satisfação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Satisfação"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pillar Activity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Pilar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pillarActivityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pillarActivityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Mais Utilizados</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={resourceUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#3b82f6" name="Visualizações" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Goals Achievement Table */}
      <Card>
        <CardHeader>
          <CardTitle>Objetivos por Pilar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { pillar: 'Saúde Mental', total: 156, achieved: 102, percentage: 65 },
              { pillar: 'Bem-Estar Físico', total: 134, achieved: 89, percentage: 66 },
              { pillar: 'Assistência Financeira', total: 98, achieved: 58, percentage: 59 },
              { pillar: 'Assistência Jurídica', total: 67, achieved: 41, percentage: 61 }
            ].map((item) => (
              <div key={item.pillar} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.pillar}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.achieved}/{item.total} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

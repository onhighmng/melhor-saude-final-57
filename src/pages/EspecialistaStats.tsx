import React from 'react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  Star, 
  CheckCircle, 
  Users,
  BarChart3,
  MessageSquare,
  Award
} from 'lucide-react';
import { mockSpecialistPersonalStats } from '@/data/especialistaGeralMockData';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const EspecialistaStats = () => {
  const stats = mockSpecialistPersonalStats;

  return (
    <div className="h-screen flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold">As Minhas Estatísticas</h1>
        <p className="text-muted-foreground">
          Acompanhe o seu desempenho e impacto na vida dos colaboradores
        </p>
      </div>

      {/* Bento Grid */}
      <div className="flex-1 min-h-0">
        <BentoGrid className="h-full" style={{ gridAutoRows: '1fr' }}>
          {/* Casos Este Mês - Large Card */}
          <BentoCard
            name="Casos Este Mês"
            description={`${stats.weekly_cases} casos esta semana`}
            Icon={Users}
            className="col-span-3 lg:col-span-1 row-span-1"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50" />
            }
            iconColor="text-purple-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
          >
            <div className="p-6 space-y-4 relative z-20">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-purple-600">{stats.monthly_cases}</span>
                <span className="text-lg text-muted-foreground mb-2">casos</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">+12%</span>
                <span className="text-muted-foreground">vs mês anterior</span>
              </div>
            </div>
          </BentoCard>

          {/* Rating Médio */}
          <BentoCard
            name="Rating Médio"
            description="Avaliação dos colaboradores"
            Icon={Star}
            className="col-span-3 lg:col-span-1 row-span-1"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50" />
            }
            iconColor="text-yellow-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
          >
            <div className="p-6 space-y-4 relative z-20">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-yellow-600">{stats.avg_rating}</span>
                <span className="text-lg text-muted-foreground mb-2">/ 10</span>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(stats.avg_rating / 2)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.satisfaction_rate}% dos colaboradores ficaram satisfeitos
              </p>
            </div>
          </BentoCard>

          {/* Tempo de Resposta */}
          <BentoCard
            name="Tempo de Resposta"
            description="Média de resposta aos pedidos"
            Icon={Clock}
            className="col-span-3 lg:col-span-1 row-span-1"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
            }
            iconColor="text-blue-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
          >
            <div className="p-6 space-y-4 relative z-20">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-blue-600">{stats.avg_response_time_minutes}</span>
                <span className="text-lg text-muted-foreground mb-2">min</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  Excelente
                </Badge>
                <span className="text-xs text-muted-foreground">Meta: &lt;60 min</span>
              </div>
            </div>
          </BentoCard>

          {/* Taxa de Resolução Interna */}
          <BentoCard
            name="Taxa de Resolução"
            description="Casos resolvidos sem encaminhar"
            Icon={CheckCircle}
            className="col-span-3 lg:col-span-2 row-span-1"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />
            }
            iconColor="text-green-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
          >
            <div className="p-6 space-y-4 relative z-20">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Resolução Interna</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-green-600">{stats.internal_resolution_rate}%</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: `${stats.internal_resolution_rate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Encaminhamentos</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-orange-600">{stats.referral_rate}%</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-600 rounded-full"
                      style={{ width: `${stats.referral_rate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Top Pilares */}
          <BentoCard
            name="Pilares Mais Atendidos"
            description="Distribuição por área"
            Icon={BarChart3}
            className="col-span-3 lg:col-span-1 row-span-1"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50" />
            }
            iconColor="text-indigo-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
          >
            <div className="p-6 space-y-3 relative z-20">
              {stats.top_pillars.map((pillar) => (
                <div key={pillar.pillar} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{pillar.label}</span>
                    <span className="text-muted-foreground">{pillar.count} casos</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${pillar.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Evolução Mensal */}
          <BentoCard
            name="Evolução Mensal"
            description="Desempenho nos últimos 3 meses"
            Icon={TrendingUp}
            className="col-span-3 lg:col-span-2 row-span-1"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-50" />
            }
            iconColor="text-pink-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
          >
            <div className="p-6 space-y-4 relative z-20">
              <div className="grid grid-cols-3 gap-4">
                {stats.monthly_evolution.map((month) => (
                  <Card key={month.month} className="border-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {month.month}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-2xl font-bold">{month.cases}</p>
                        <p className="text-xs text-muted-foreground">casos</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{month.rating}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div>{month.resolved} resolvidos</div>
                        <div>{month.referred} encaminhados</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Feedback Recente */}
          <BentoCard
            name="Feedback Recente"
            description="O que os colaboradores dizem"
            Icon={MessageSquare}
            className="col-span-3 lg:col-span-1 row-span-1"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-cyan-50" />
            }
            iconColor="text-teal-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
          >
            <div className="p-6 space-y-3 relative z-20 max-h-[300px] overflow-y-auto">
              {stats.recent_feedback.map((feedback, idx) => (
                <Card key={idx} className="border">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{feedback.user}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{feedback.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      "{feedback.comment}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(feedback.date), 'dd MMM yyyy', { locale: pt })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </div>
  );
};

export default EspecialistaStats;

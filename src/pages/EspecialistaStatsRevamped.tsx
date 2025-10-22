import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Star, Clock, CheckCircle, ArrowRight, Brain, DollarSign, Scale, Dumbbell } from 'lucide-react';
import { mockSpecialistPersonalStats } from '@/data/especialistaGeralMockData';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const EspecialistaStatsRevamped = () => {
  const stats = mockSpecialistPersonalStats;

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'psychological':
        return Brain;
      case 'financial':
        return DollarSign;
      case 'legal':
        return Scale;
      case 'physical':
        return Dumbbell;
      default:
        return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">
          Estatísticas Pessoais
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o seu desempenho e métricas de atendimento
        </p>
      </div>

      <BentoGrid className="lg:grid-rows-3 gap-4">
        {/* Casos Mensais - Top Left */}
        <BentoCard
          name="Casos Mensais"
          description="Total de casos atendidos"
          Icon={CheckCircle}
          className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2"
          background={<div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50" />}
          iconColor="text-purple-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="p-6 flex flex-col items-center justify-center h-full">
            <div className="text-5xl font-bold text-purple-600 mb-2">{stats.monthly_cases}</div>
            <p className="text-sm text-gray-600">casos este mês</p>
            <div className="flex items-center gap-1 mt-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+{stats.weekly_cases} esta semana</span>
            </div>
          </div>
        </BentoCard>

        {/* Tempo Médio - Top Middle */}
        <BentoCard
          name="Tempo Médio de Resposta"
          description="Velocidade de atendimento"
          Icon={Clock}
          className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2"
          background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />}
          iconColor="text-blue-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="p-6 flex flex-col items-center justify-center h-full">
            <div className="text-5xl font-bold text-blue-600 mb-2">{stats.avg_response_time_minutes}</div>
            <p className="text-sm text-gray-600">minutos</p>
            <Badge variant="secondary" className="mt-2">
              Abaixo da meta (45min)
            </Badge>
          </div>
        </BentoCard>

        {/* Rating Médio - Top Right */}
        <BentoCard
          name="Avaliação Média"
          description="Satisfação dos utilizadores"
          Icon={Star}
          className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2"
          background={<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />}
          iconColor="text-green-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="p-6 flex flex-col items-center justify-center h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-5xl font-bold text-green-600">{stats.avg_rating}</div>
              <div className="text-2xl text-gray-400">/10</div>
            </div>
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-gray-600">{stats.satisfaction_rate}% satisfeitos</p>
          </div>
        </BentoCard>

        {/* Taxa de Resolução - Middle Left */}
        <BentoCard
          name="Taxa de Resolução"
          description="Casos resolvidos internamente vs encaminhados"
          Icon={TrendingUp}
          className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3"
          background={<div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50" />}
          iconColor="text-orange-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="p-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Resolução Interna</span>
                  <span className="text-2xl font-bold text-green-600">{stats.internal_resolution_rate}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{ width: `${stats.internal_resolution_rate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Encaminhamentos</span>
                  <span className="text-2xl font-bold text-purple-600">{stats.referral_rate}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all"
                    style={{ width: `${stats.referral_rate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Evolução Mensal - Middle Right */}
        <BentoCard
          name="Evolução Mensal"
          description="Crescimento de casos atendidos"
          Icon={TrendingUp}
          className="lg:col-start-2 lg:col-end-4 lg:row-start-2 lg:row-end-3"
          background={<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50" />}
          iconColor="text-indigo-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="p-6 h-full">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.evolution_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cases"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Crescimento de {Math.round((stats.evolution_data[3].cases - stats.evolution_data[0].cases) / stats.evolution_data[0].cases * 100)}% em 4 meses
              </Badge>
            </div>
          </div>
        </BentoCard>

        {/* Top Pilares - Bottom Left */}
        <BentoCard
          name="Top Pilares Atendidos"
          description="Distribuição por especialidade"
          Icon={CheckCircle}
          className="lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4"
          background={<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />}
          iconColor="text-green-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="p-6 space-y-3">
            {stats.top_pillars.map((pillar, index) => {
              const Icon = getPillarIcon(pillar.pillar);
              return (
                <div key={pillar.pillar} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                    <Icon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{pillar.label}</p>
                    <p className="text-xs text-muted-foreground">{pillar.count} casos</p>
                  </div>
                  <Badge variant="secondary">{index + 1}º</Badge>
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* Feedback Recente - Bottom Right */}
        <BentoCard
          name="Feedback Recente"
          description="Últimas avaliações dos utilizadores"
          Icon={Star}
          className="lg:col-start-2 lg:col-end-4 lg:row-start-3 lg:row-end-4"
          background={<div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50" />}
          iconColor="text-yellow-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="p-6 space-y-3">
            {[
              { user: 'Ana Silva', rating: 9, comment: 'Excelente atendimento, muito profissional e atencioso.' },
              { user: 'Carlos Santos', rating: 8, comment: 'Ajudou-me bastante, recomendo!' },
              { user: 'Maria Costa', rating: 10, comment: 'Perfeito! Resolveu o meu problema rapidamente.' }
            ].map((feedback, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{feedback.user}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{feedback.rating}/10</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">"{feedback.comment}"</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
};

export default EspecialistaStatsRevamped;

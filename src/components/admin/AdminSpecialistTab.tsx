import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, ArrowRight, TrendingUp } from 'lucide-react';

// Mock data
const specialistStats = {
  resolved: 45,
  inProgress: 12,
  forwarded: 8,
  avgResponseTime: '2.5 horas',
};

const mockCases = [
  {
    id: '1',
    collaborator: 'Ana Silva',
    pillar: 'Saúde Mental',
    status: 'resolved',
    responseTime: '1.5h',
    resolution: 'Sessão agendada',
    date: '2025-10-12',
  },
  {
    id: '2',
    collaborator: 'Carlos Santos',
    pillar: 'Bem-Estar Físico',
    status: 'in_progress',
    responseTime: '-',
    resolution: 'Em acompanhamento',
    date: '2025-10-13',
  },
  {
    id: '3',
    collaborator: 'Beatriz Ferreira',
    pillar: 'Assistência Financeira',
    status: 'forwarded',
    responseTime: '3h',
    resolution: 'Encaminhado para especialista',
    date: '2025-10-11',
  },
  {
    id: '4',
    collaborator: 'Daniel Rocha',
    pillar: 'Assistência Jurídica',
    status: 'resolved',
    responseTime: '2h',
    resolution: 'Resolvido por telefone',
    date: '2025-10-10',
  },
];

const statusConfig = {
  resolved: {
    label: 'Resolvido',
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  in_progress: {
    label: 'Em Acompanhamento',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  forwarded: {
    label: 'Encaminhado',
    icon: ArrowRight,
    className: 'bg-vibrant-blue/10 text-vibrant-blue dark:text-sky-blue',
  },
};

export default function AdminSpecialistTab() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Casos Resolvidos</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {specialistStats.resolved}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Acompanhamento</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {specialistStats.inProgress}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Encaminhados</p>
                <p className="text-2xl font-bold text-vibrant-blue">
                  {specialistStats.forwarded}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-vibrant-blue/10 flex items-center justify-center">
                <ArrowRight className="h-6 w-6 text-vibrant-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">{specialistStats.avgResponseTime}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cases List */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Casos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockCases.map((case_) => {
              const status = statusConfig[case_.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;

              return (
                <div
                  key={case_.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <StatusIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{case_.collaborator}</h4>
                        <Badge variant="outline" className="text-xs">
                          {case_.pillar}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{case_.resolution}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{new Date(case_.date).toLocaleDateString('pt-PT')}</span>
                        {case_.responseTime !== '-' && (
                          <>
                            <span>•</span>
                            <span>Resposta em {case_.responseTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={status.className}>{status.label}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

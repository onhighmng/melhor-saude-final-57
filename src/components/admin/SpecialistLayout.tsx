import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, ArrowRight, TrendingUp, X } from 'lucide-react';
import { CardStack } from '@/components/ui/card-stack';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';

interface Case {
  id: string;
  collaborator: string;
  pillar: string;
  status: 'resolved' | 'in_progress' | 'forwarded';
  responseTime: string;
  resolution: string;
  date: string;
  email?: string;
  phone?: string;
  notes?: string;
  priority?: string;
  company?: string;
}

interface SpecialistLayoutProps {
  cases: Case[];
}

const statusConfig = {
  resolved: {
    label: 'Resolvido',
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-green-50 dark:bg-green-950',
    iconBg: 'bg-emerald-500',
  },
  in_progress: {
    label: 'Em Acompanhamento',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    iconBg: 'bg-orange-500',
  },
  forwarded: {
    label: 'Encaminhado',
    icon: ArrowRight,
    className: 'bg-vibrant-blue/10 text-vibrant-blue dark:text-sky-blue',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    iconBg: 'bg-blue-500',
  },
};

const metricCards = [
  {
    id: 0,
    name: "45 Casos",
    designation: "Resolvidos com Sucesso",
    content: (
      <div className="flex flex-col items-start gap-4">
        <div className="h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <div>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">Casos completamente resolvidos e finalizados no período atual</p>
        </div>
      </div>
    ),
  },
  {
    id: 1,
    name: "12 Casos",
    designation: "Em Acompanhamento Ativo",
    content: (
      <div className="flex flex-col items-start gap-4">
        <div className="h-20 w-20 rounded-full bg-orange-500 flex items-center justify-center">
          <Clock className="h-10 w-10 text-white" />
        </div>
        <div>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">Casos em processo de acompanhamento e tratamento contínuo</p>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    name: "8 Casos",
    designation: "Encaminhados para Especialistas",
    content: (
      <div className="flex flex-col items-start gap-4">
        <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center">
          <ArrowRight className="h-10 w-10 text-white" />
        </div>
        <div>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">Casos que requerem atenção especializada e foram encaminhados</p>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    name: "2.5 Horas",
    designation: "Tempo Médio de Resposta",
    content: (
      <div className="flex flex-col items-start gap-4">
        <div className="h-20 w-20 rounded-full bg-purple-500 flex items-center justify-center">
          <TrendingUp className="h-10 w-10 text-white" />
        </div>
        <div>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">Tempo médio para resposta inicial aos casos</p>
        </div>
      </div>
    ),
  },
];

export default function SpecialistLayout({ cases }: SpecialistLayoutProps) {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCaseClick = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Animated Card Stack */}
        <div className="flex items-center justify-center">
          <CardStack items={metricCards} />
        </div>

        {/* Right Side - Cases List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Casos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cases.map((case_) => {
                const status = statusConfig[case_.status];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={case_.id}
                    onClick={() => handleCaseClick(case_)}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <StatusIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-medium text-sm">{case_.collaborator}</h4>
                        {case_.phone && (
                          <p className="text-sm text-muted-foreground">{case_.phone}</p>
                        )}
                        {case_.email && (
                          <p className="text-sm text-muted-foreground">{case_.email}</p>
                        )}
                        {case_.company && (
                          <p className="text-sm text-muted-foreground">{case_.company}</p>
                        )}
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

      {/* Fullscreen Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedCase && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCase.collaborator}</h2>
                  <p className="text-muted-foreground mt-1">Notas do Caso</p>
                </div>
              </div>

              {/* Notes */}
              {selectedCase.notes && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-base leading-relaxed">{selectedCase.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, ArrowRight, TrendingUp, X } from 'lucide-react';
import { CardStack } from '@/components/ui/card-stack';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';
import { ProviderSessionManagementModal } from '@/components/sessions/ProviderSessionManagementModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [showManagementModal, setShowManagementModal] = useState(false);
  const { toast } = useToast();

  const handleCaseClick = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setShowManagementModal(true);
  };

  const handleUpdateMeetingLink = async (caseId: string, link: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ meeting_link: link })
        .eq('id', caseId);

      if (error) throw error;

      toast({
        title: "Link atualizado",
        description: "O link da reunião foi atualizado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar link",
        variant: "destructive"
      });
    }
  };

  const handleReschedule = async (caseId: string) => {
    try {
      // Update booking status and add rescheduled flag
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'rescheduled',
          rescheduled_from: caseId 
        })
        .eq('id', caseId);

      if (error) throw error;

      toast({
        title: "Caso reagendado",
        description: "O caso foi marcado para reagendamento."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao reagendar caso",
        variant: "destructive"
      });
    }
  };

  const handleCancel = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancellation_reason: 'Cancelado por especialista' 
        })
        .eq('id', caseId);

      if (error) throw error;

      toast({
        title: "Caso cancelado",
        description: "O caso foi cancelado com sucesso.",
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cancelar caso",
        variant: "destructive"
      });
    }
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
                    className="flex items-start justify-between p-6 rounded-lg border bg-card transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-5 flex-1">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <StatusIcon className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <h4 className="font-semibold text-lg">{case_.collaborator}</h4>
                        {case_.phone && (
                          <p className="text-base text-muted-foreground">{case_.phone}</p>
                        )}
                        {case_.email && (
                          <p className="text-base text-muted-foreground">{case_.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {case_.company && (
                        <p className="text-base font-medium text-muted-foreground">{case_.company}</p>
                      )}
                      <Badge className={status.className + ' text-sm px-3 py-1'}>{status.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Session Management Modal */}
      <ProviderSessionManagementModal
        session={selectedCase ? {
          id: selectedCase.id,
          clientName: selectedCase.collaborator,
          pillar: selectedCase.pillar,
          date: selectedCase.date,
          time: '10:00', // Default time, can be added to Case interface
          platform: 'Zoom',
          meetingLink: undefined
        } : null}
        isOpen={showManagementModal}
        onClose={() => {
          setShowManagementModal(false);
          setSelectedCase(null);
        }}
        onUpdateMeetingLink={handleUpdateMeetingLink}
        onReschedule={handleReschedule}
        onCancel={handleCancel}
      />

      {/* Notes Modal (Keep for viewing case notes) */}
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

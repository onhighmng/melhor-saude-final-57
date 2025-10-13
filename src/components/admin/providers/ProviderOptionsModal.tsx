import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar } from 'lucide-react';
import { AdminProvider as Provider } from '@/data/adminMockData';

interface ProviderOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider | null;
  onViewMetrics: () => void;
  onScheduleSession: () => void;
}

export const ProviderOptionsModal = ({
  open,
  onOpenChange,
  provider,
  onViewMetrics,
  onScheduleSession,
}: ProviderOptionsModalProps) => {
  if (!provider) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Opções do Prestador</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">{provider.name}</p>
        </DialogHeader>
        
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={() => {
              onViewMetrics();
              onOpenChange(false);
            }}
          >
            <BarChart3 className="h-5 w-5 mr-3 text-vibrant-blue" />
            <div className="text-left">
              <div className="font-semibold">Ver Métricas e Histórico</div>
              <div className="text-xs text-muted-foreground mt-1">
                Ver desempenho e histórico detalhado
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={() => {
              onScheduleSession();
              onOpenChange(false);
            }}
          >
            <Calendar className="h-5 w-5 mr-3 text-mint-green" />
            <div className="text-left">
              <div className="font-semibold">Agendar Sessão no Calendário</div>
              <div className="text-xs text-muted-foreground mt-1">
                Agendar nova sessão diretamente
              </div>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

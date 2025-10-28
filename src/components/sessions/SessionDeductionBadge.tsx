import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { SessionStatus } from "@/types/sessionTypes";

interface SessionDeductionBadgeProps {
  status: SessionStatus;
  wasDeducted: boolean;
  payerSource: 'company' | 'personal';
  deductedAt?: string;
}

export function SessionDeductionBadge({ 
  status, 
  wasDeducted, 
  payerSource, 
  deductedAt 
}: SessionDeductionBadgeProps) {
  const getDeductionDisplay = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: wasDeducted ? 'Deduzida' : 'Concluída',
          variant: 'default' as const,
          tooltip: wasDeducted 
            ? `Sessão deduzida da quota ${payerSource === 'company' ? 'da empresa' : 'pessoal'} em ${deductedAt ? new Date(deductedAt).toLocaleString('pt-PT') : 'data desconhecida'}`
            : 'Sessão concluída mas não deduzida'
        };
      
      case 'cancelled':
        return {
          icon: <XCircle className="h-3 w-3" />,
          label: 'Não deduzida',
          variant: 'secondary' as const,
          tooltip: 'Cancelamentos não consomem sessões da sua quota'
        };
      
      case 'no_show':
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          label: 'Não deduzida',
          variant: 'secondary' as const,
          tooltip: 'Faltas não consomem sessões da sua quota'
        };
      
      case 'rescheduled':
        return {
          icon: <Clock className="h-3 w-3" />,
          label: 'Não deduzida',
          variant: 'secondary' as const,
          tooltip: 'Reagendamentos não consomem sessões da sua quota'
        };
      
      case 'scheduled':
      case 'confirmed':
      case 'in_progress':
        return {
          icon: <Clock className="h-3 w-3" />,
          label: 'Pendente',
          variant: 'outline' as const,
          tooltip: 'A dedução ocorrerá apenas quando a sessão for concluída'
        };
      
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          label: 'Pendente',
          variant: 'outline' as const,
          tooltip: 'Estado da dedução a determinar'
        };
    }
  };

  const { icon, label, variant, tooltip } = getDeductionDisplay();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={variant} className="flex items-center gap-1 text-xs">
          {icon}
          <span>{label}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm max-w-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
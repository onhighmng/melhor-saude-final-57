import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UserPlus, AlertTriangle } from "lucide-react";
import { Company } from "@/types/company";
import { canInviteEmployee, getAvailableSeats } from "@/utils/companyHelpers";

interface InviteEmployeeButtonProps {
  company: Company;
  onInvite?: () => void;
}

export function InviteEmployeeButton({ company, onInvite }: InviteEmployeeButtonProps) {
  const canInvite = canInviteEmployee(company);

  if (!canInvite) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button 
              disabled 
              className="w-full sm:w-auto"
              variant="default"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Convidar Colaborador
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm max-w-xs">
            <p className="font-medium mb-1">Limite atingido</p>
            <p>
              A empresa atingiu o limite de {company.sessions_allocated} sessões. 
              Contacte o administrador para aumentar o limite.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          onClick={onInvite}
          className="w-full sm:w-auto"
          variant="default"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar Colaborador
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm">
          <p>
            {getAvailableSeats(company.sessions_allocated, company.sessions_used)} sessões disponíveis
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
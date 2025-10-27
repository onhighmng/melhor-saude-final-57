import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UserPlus, AlertTriangle } from "lucide-react";
// Company interface
interface Company {
  id: string;
  company_name: string;
  seats_allocated?: number;
  seats_used?: number;
  seats_available?: number;
}

// Helper function
const canInviteEmployee = (company: Company) => {
  if (!company.seats_allocated) return true;
  return (company.seats_used || 0) < company.seats_allocated;
};

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
              A empresa atingiu o limite de {company.sessions_allocated} contas ativas. 
              Contacte o administrador para aumentar o limite ou desative contas inativas.
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
            {(() => {
              const seatsAvailable = (company.sessions_allocated || 0) - (company.sessions_used || 0);
              return `${seatsAvailable} conta${seatsAvailable !== 1 ? 's' : ''} disponível${seatsAvailable !== 1 ? 's' : ''} de ${company.sessions_allocated}`;
            })()}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
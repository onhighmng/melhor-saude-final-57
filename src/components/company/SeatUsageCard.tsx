import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Company } from "@/types/company";
import { getSeatUsagePercentage, getSeatUsageBadgeVariant } from "@/utils/companyHelpers";

interface SeatUsageCardProps {
  company: Company;
}

export function SeatUsageCard({ company }: SeatUsageCardProps) {
  const usagePercentage = getSeatUsagePercentage(company.sessions_allocated, company.sessions_used);
  const badgeVariant = getSeatUsageBadgeVariant(usagePercentage);
  const availableSeats = Math.max(0, company.sessions_allocated - company.sessions_used);
  const isAtLimit = company.sessions_used >= company.sessions_allocated;
  
  const getStatusIcon = () => {
    if (isAtLimit) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    if (usagePercentage >= 90) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getStatusMessage = () => {
    if (isAtLimit) {
      return "Limite de contas atingido";
    }
    if (usagePercentage >= 90) {
      return "Próximo do limite";
    }
    return "Dentro do limite";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>Contas da Empresa</span>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm max-w-xs">
                Apenas colaboradores ativos contam para o limite de contas. 
                Colaboradores desativados libertam automaticamente uma conta.
              </p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <CardDescription>
          Gestão do limite de contas por colaborador
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Usage Statistics */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusMessage()}</span>
          </div>
          <Badge variant={badgeVariant}>
            {company.sessions_used} / {company.sessions_allocated} usadas
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={usagePercentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Disponíveis: {availableSeats}</span>
            <span>{usagePercentage.toFixed(1)}% utilizado</span>
          </div>
        </div>

        {/* Plan Information */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Plano Atual:</span>
            <Badge variant="outline">
              {company.plan_type.charAt(0).toUpperCase() + company.plan_type.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Warning Messages */}
        {isAtLimit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Limite Atingido</p>
                <p>
                  Não é possível convidar novos colaboradores. 
                  Desative contas inativas ou contacte o administrador para aumentar o limite.
                </p>
              </div>
            </div>
          </div>
        )}

        {usagePercentage >= 90 && !isAtLimit && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Próximo do Limite</p>
                <p>
                  Apenas {availableSeats} conta{availableSeats !== 1 ? 's' : ''} disponível{availableSeats !== 1 ? 's' : ''}. 
                  Considere aumentar o limite ou revisar contas inativas.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
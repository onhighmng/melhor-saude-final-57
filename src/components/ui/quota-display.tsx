import { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import { Building2, User, Info } from "lucide-react";
import { UserBalance } from "@/data/sessionMockData";

interface QuotaDisplayProps {
  balance: UserBalance;
}

export function QuotaDisplay({ balance }: QuotaDisplayProps) {
  const companyUsagePercent = (balance.usedCompany / balance.companyQuota) * 100;
  const personalUsagePercent = (balance.usedPersonal / balance.personalQuota) * 100;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Suas Quotas de Sessões</h3>
        <Info className="w-5 h-5 text-gray-400" />
      </div>
      
      <p className="text-sm text-gray-600">
        Apenas sessões concluídas são deduzidas da sua quota
      </p>

      <div className="space-y-4">
        {/* Company Quota */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Quota da Empresa</h4>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Progress value={companyUsagePercent} className="h-2" />
              </div>
              <div className="ml-4 text-sm font-medium text-gray-900">
                {balance.usedCompany}/{balance.companyQuota} usadas
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Disponível: {balance.companyQuota - balance.usedCompany}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {companyUsagePercent.toFixed(0)}% utilizado
              </span>
            </div>
          </div>
        </div>

        {/* Personal Quota */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Quota Pessoal</h4>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Progress value={personalUsagePercent} className="h-2" />
              </div>
              <div className="ml-4 text-sm font-medium text-gray-900">
                {balance.usedPersonal}/{balance.personalQuota} usadas
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Disponível: {balance.personalQuota - balance.usedPersonal}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {personalUsagePercent.toFixed(0)}% utilizado
              </span>
            </div>
          </div>
        </div>

        {/* Policy */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-blue-900 mb-1">Política de Dedução</h5>
              <p className="text-sm text-blue-800">
                Cancelamentos, faltas e reagendamentos não consomem sessões da sua quota. Apenas sessões efetivamente concluídas são deduzidas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

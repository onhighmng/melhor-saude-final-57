import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UserBalance } from "@/data/sessionMockData";
import { useTranslation } from "react-i18next";

interface QuotaDisplayCardProps {
  balance: UserBalance;
}

export function QuotaDisplayCard({ balance }: QuotaDisplayCardProps) {
  const { t } = useTranslation('user');
  const companyUsagePercent = (balance.usedCompany / balance.companyQuota) * 100;
  const personalUsagePercent = (balance.usedPersonal / balance.personalQuota) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{t('sessions.quota.title', 'Suas Quotas de Sessões')}</span>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm max-w-xs">
                {t('sessions.quota.info', 'As quotas só são descontadas quando as sessões são concluídas. Cancelamentos, faltas e reagendamentos não consomem sessões.')}
              </p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <CardDescription>
          {t('sessions.quota.description', 'Apenas sessões concluídas são deduzidas da sua quota')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Quota */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{t('sessions.quota.company')}</span>
            </div>
            <Badge variant="outline">
              {t('sessions.quota.usageLabel', '{{used}} / {{total}} usadas', { used: balance.usedCompany, total: balance.companyQuota })}
            </Badge>
          </div>
          <Progress value={companyUsagePercent} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('sessions.quota.available', 'Disponíveis: {{count}}', { count: balance.availableCompany })}</span>
            <span>{companyUsagePercent.toFixed(0)}% {t('sessions.quota.used', 'utilizado')}</span>
          </div>
        </div>

        {/* Personal Quota */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              <span className="font-medium">{t('sessions.quota.personal')}</span>
            </div>
            <Badge variant="outline">
              {t('sessions.quota.usageLabel', '{{used}} / {{total}} usadas', { used: balance.usedPersonal, total: balance.personalQuota })}
            </Badge>
          </div>
          <Progress value={personalUsagePercent} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('sessions.quota.available', 'Disponíveis: {{count}}', { count: balance.availablePersonal })}</span>
            <span>{personalUsagePercent.toFixed(0)}% {t('sessions.quota.used', 'utilizado')}</span>
          </div>
        </div>

        {/* Policy Reminder */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">{t('sessions.quota.policyTitle', 'Política de Dedução')}</p>
              <p>
                {t('sessions.quota.policyDescription', 'Cancelamentos, faltas e reagendamentos não consomem sessões da sua quota. Apenas sessões efetivamente concluídas são deduzidas.')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
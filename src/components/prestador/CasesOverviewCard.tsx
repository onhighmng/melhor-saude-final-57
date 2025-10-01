
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp } from 'lucide-react';
import { Provider } from '@/types/provider';

interface CasesOverviewCardProps {
  provider: Provider;
}

const CasesOverviewCard = ({ provider }: CasesOverviewCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-navy-blue">
          <Users className="w-5 h-5" />
          Visão Geral dos Casos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-mint-green/10 rounded-lg">
            <div className="text-2xl font-bold text-navy-blue">{provider.activeCases}</div>
            <div className="text-sm text-navy-blue opacity-80">Casos Ativos</div>
          </div>
          <div className="text-center p-4 bg-sky-blue/10 rounded-lg">
            <div className="text-2xl font-bold text-navy-blue">
              {Math.round(provider.activeCases * 0.8)}
            </div>
            <div className="text-sm text-navy-blue opacity-80">Este Mês</div>
          </div>
          <div className="text-center p-4 bg-royal-blue/10 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-mint-green">
              <TrendingUp className="w-5 h-5" />
              +{Math.round(provider.activeCases * 0.2)}
            </div>
            <div className="text-sm text-navy-blue opacity-80">Crescimento</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CasesOverviewCard;

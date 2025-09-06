
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Provider } from '@/types/provider';

interface StatusPanelProps {
  provider: Provider;
}

const StatusPanel = ({ provider }: StatusPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-navy-blue">Status do Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-navy-blue opacity-80">
          <p className="font-medium mb-2">Resumo</p>
          <p>✓ Perfil público ativo</p>
          <p>✓ Informações completas</p>
          <p>✓ Agendamento integrado na plataforma</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusPanel;

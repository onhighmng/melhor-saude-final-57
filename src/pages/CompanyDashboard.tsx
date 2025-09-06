import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Calendar, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockCompanies } from "@/data/companyMockData";
import { SeatUsageCard } from "@/components/company/SeatUsageCard";
import { InviteEmployeeButton } from "@/components/company/InviteEmployeeButton";
import { useState } from "react";

export default function CompanyDashboard() {
  const { toast } = useToast();
  // Mock data - in real app this would come from API/context
  const [company] = useState(mockCompanies[0]);

  const handleInviteEmployee = () => {
    toast({
      title: "Convidar Colaborador",
      description: "Funcionalidade de convite será implementada em breve."
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
            <p className="text-muted-foreground">Dashboard de Recursos Humanos</p>
          </div>
          
          <InviteEmployeeButton company={company} onInvite={handleInviteEmployee} />
        </div>

        {/* Seat Usage Card */}
        <SeatUsageCard company={company} />

        {/* Main Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Active Employees */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colaboradores Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company.seatUsed}</div>
              <p className="text-xs text-muted-foreground">
                de {company.seatLimit} contas disponíveis
              </p>
            </CardContent>
          </Card>

          {/* Total Sessions Used */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessões Utilizadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs text-muted-foreground">
                +12% desde o mês passado
              </p>
            </CardContent>
          </Card>

          {/* Adoption Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Adesão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">
                Colaboradores com pelo menos 1 sessão
              </p>
            </CardContent>
          </Card>

          {/* Plan Type */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{company.planType}</div>
              <p className="text-xs text-muted-foreground">
                {company.seatLimit} contas incluídas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Ver Relatório Mensal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Exportar Dados
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Configurar Notificações
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Workshop de Bem-estar Mental - 25 Jan
                </div>
                <div className="text-sm text-muted-foreground">
                  Sessão de Mindfulness - 30 Jan
                </div>
                <div className="text-sm text-muted-foreground">
                  Palestra Saúde Financeira - 5 Fev
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
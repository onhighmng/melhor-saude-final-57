import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Clock,
  Star,
  TrendingUp,
  Building,
  Video,
  MapPin,
  Brain,
  Heart,
  DollarSign,
  Scale
} from 'lucide-react';
import { mockProviders, AdminProvider as Provider } from '@/data/adminMockData';
import { useToast } from "@/hooks/use-toast";

const AdminProviderDetailMetrics = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const provider = mockProviders.find(p => p.id === providerId);

  if (!provider) {
    return (
      <div className="container mx-auto p-8">
        <Button variant="ghost" onClick={() => navigate('/admin/users-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Prestador não encontrado</p>
        </div>
      </div>
    );
  }

  const getPillarBadgeColor = (pillar: string) => {
    switch (pillar) {
      case 'mental-health':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'physical-wellness':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'financial-assistance':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'legal-assistance':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'mental-health':
        return <Brain className="h-4 w-4" />;
      case 'physical-wellness':
        return <Heart className="h-4 w-4" />;
      case 'financial-assistance':
        return <DollarSign className="h-4 w-4" />;
      case 'legal-assistance':
        return <Scale className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleStatusChange = (newStatus: 'Ativo' | 'Inativo') => {
    toast({
      title: "Estado atualizado",
      description: `Estado do prestador alterado para ${newStatus}`
    });
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/users-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Provider Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={provider.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {provider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{provider.name}</h1>
                <p className="text-muted-foreground">{provider.specialty}</p>
                <p className="text-sm text-muted-foreground">{provider.email}</p>
              </div>
            </div>
            <Badge className={getPillarBadgeColor(provider.pillar)}>
              {getPillarIcon(provider.pillar)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informação do Prestador</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-muted-foreground">Nome completo</Label>
            <p className="text-lg font-semibold">{provider.name}</p>
          </div>
          
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p className="text-lg">{provider.email}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Pilar</Label>
            <div className="mt-1">
              <Badge className={getPillarBadgeColor(provider.pillar)}>
                {getPillarIcon(provider.pillar)}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Tipo de sessão</Label>
            <div className="mt-1">
              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                {provider.sessionType === 'Virtual' && <Video className="h-3 w-3" />}
                {provider.sessionType === 'Presencial' && <MapPin className="h-3 w-3" />}
                {provider.sessionType}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Estado atual</Label>
            <div className="mt-2 flex gap-2">
              <Button
                variant={provider.status === 'Ativo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('Ativo')}
              >
                Ativo
              </Button>
              <Button
                variant={provider.status === 'Inativo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('Inativo')}
              >
                Inativo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Métricas de Desempenho</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sessões realizadas</p>
                  <p className="text-2xl font-bold text-blue-700">{provider.totalSessions}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Média de satisfação</p>
                  <p className="text-2xl font-bold text-amber-700 flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-600 text-amber-600" />
                    {provider.satisfaction} / 10
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sessões este mês</p>
                  <p className="text-2xl font-bold text-green-700">{provider.sessionsThisMonth}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Empresas atendidas</p>
                  <p className="text-2xl font-bold text-purple-700">{provider.companiesServed}</p>
                </div>
                <Building className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Informação Financeira */}
      <Card>
        <CardHeader>
          <CardTitle>Informação Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">💰 Custo por sessão</td>
                  <td className="p-4 text-right font-semibold">{provider.costPerSession} MZN</td>
                </tr>
                <tr className="border-b bg-muted/30">
                  <td className="p-4 font-medium">🧾 Margem Melhor Saúde ({provider.platformMargin}%)</td>
                  <td className="p-4 text-right font-semibold">{(provider.costPerSession * provider.platformMargin / 100).toFixed(2)} MZN</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">💸 Valor líquido ao prestador</td>
                  <td className="p-4 text-right font-semibold text-green-700">
                    {(provider.costPerSession * (100 - provider.platformMargin) / 100).toFixed(2)} MZN
                  </td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="p-4 font-medium">📆 Total pago este mês</td>
                  <td className="p-4 text-right font-bold text-blue-700 text-lg">
                    {provider.monthlyPayment.toFixed(2)} MZN
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Sessões Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sessões Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Data</th>
                  <th className="p-3 text-left text-sm font-medium">Colaborador</th>
                  <th className="p-3 text-right text-sm font-medium">Nota</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '2024-10-10', collaborator: 'João Silva', rating: 9.2 },
                  { date: '2024-10-08', collaborator: 'Maria Oliveira', rating: 9.5 },
                  { date: '2024-10-05', collaborator: 'Ana Costa', rating: 8.8 },
                  { date: '2024-10-03', collaborator: 'Pedro Ferreira', rating: 9.0 },
                  { date: '2024-10-01', collaborator: 'Carlos Santos', rating: 9.3 },
                ].map((session, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/30">
                    <td className="p-3 text-sm">{new Date(session.date).toLocaleDateString('pt-PT')}</td>
                    <td className="p-3 text-sm">{session.collaborator}</td>
                    <td className="p-3 text-sm text-right flex items-center justify-end gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {session.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProviderDetailMetrics;

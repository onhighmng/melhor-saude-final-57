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
        return <Brain className="h-5 w-5" />;
      case 'physical-wellness':
        return <Heart className="h-5 w-5" />;
      case 'financial-assistance':
        return <DollarSign className="h-5 w-5" />;
      case 'legal-assistance':
        return <Scale className="h-5 w-5" />;
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
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-28 w-28">
                <AvatarImage src={provider.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {provider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-bold text-foreground">{provider.name}</h1>
                <p className="text-xl text-muted-foreground mt-1">{provider.specialty}</p>
                <p className="text-base text-muted-foreground mt-1">{provider.email}</p>
              </div>
            </div>
            <Badge className={`${getPillarBadgeColor(provider.pillar)} text-base px-4 py-2`}>
              {getPillarIcon(provider.pillar)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Informação do Prestador</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-8 p-8">
          <div>
            <Label className="text-base text-muted-foreground">Nome completo</Label>
            <p className="text-xl font-semibold mt-2">{provider.name}</p>
          </div>
          
          <div>
            <Label className="text-base text-muted-foreground">Email</Label>
            <p className="text-xl mt-2">{provider.email}</p>
          </div>

          <div>
            <Label className="text-base text-muted-foreground">Pilar</Label>
            <div className="mt-2">
              <Badge className={`${getPillarBadgeColor(provider.pillar)} text-base px-4 py-2`}>
                {getPillarIcon(provider.pillar)}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-base text-muted-foreground">Tipo de sessão</Label>
            <div className="mt-2">
              <Badge variant="outline" className="flex items-center gap-2 w-fit text-base px-4 py-2">
                {provider.sessionType === 'Virtual' && <Video className="h-4 w-4" />}
                {provider.sessionType === 'Presencial' && <MapPin className="h-4 w-4" />}
                {provider.sessionType}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-base text-muted-foreground">Estado atual</Label>
            <div className="mt-2 flex gap-3">
              <Button
                variant={provider.status === 'Ativo' ? 'default' : 'outline'}
                size="default"
                onClick={() => handleStatusChange('Ativo')}
              >
                Ativo
              </Button>
              <Button
                variant={provider.status === 'Inativo' ? 'default' : 'outline'}
                size="default"
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
        <h2 className="text-2xl font-semibold mb-6">Métricas de Desempenho</h2>
        <div className="grid grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-muted-foreground mb-2">Sessões realizadas</p>
                  <p className="text-4xl font-bold text-blue-700">{provider.totalSessions}</p>
                </div>
                <Clock className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-amber-50">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-muted-foreground mb-2">Média de satisfação</p>
                  <p className="text-4xl font-bold text-amber-700 flex items-center gap-2">
                    <Star className="h-7 w-7 fill-amber-600 text-amber-600" />
                    {provider.satisfaction} / 10
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-muted-foreground mb-2">Sessões este mês</p>
                  <p className="text-4xl font-bold text-green-700">{provider.sessionsThisMonth}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-purple-50">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-muted-foreground mb-2">Empresas atendidas</p>
                  <p className="text-4xl font-bold text-purple-700">{provider.companiesServed}</p>
                </div>
                <Building className="h-12 w-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Informação Financeira */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Informação Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="p-6 font-medium text-lg">💰 Custo por sessão</td>
                  <td className="p-6 text-right font-semibold text-xl">{provider.costPerSession} MZN</td>
                </tr>
                <tr className="border-b bg-muted/30">
                  <td className="p-6 font-medium text-lg">🧾 Margem Melhor Saúde ({provider.platformMargin}%)</td>
                  <td className="p-6 text-right font-semibold text-xl">{(provider.costPerSession * provider.platformMargin / 100).toFixed(2)} MZN</td>
                </tr>
                <tr className="border-b">
                  <td className="p-6 font-medium text-lg">💸 Valor líquido ao prestador</td>
                  <td className="p-6 text-right font-semibold text-xl text-green-700">
                    {(provider.costPerSession * (100 - provider.platformMargin) / 100).toFixed(2)} MZN
                  </td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="p-6 font-medium text-lg">📆 Total pago este mês</td>
                  <td className="p-6 text-right font-bold text-blue-700 text-2xl">
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
          <CardTitle className="text-2xl">Histórico de Sessões Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-5 text-left text-base font-medium">Data</th>
                  <th className="p-5 text-left text-base font-medium">Colaborador</th>
                  <th className="p-5 text-right text-base font-medium">Nota</th>
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
                    <td className="p-5 text-base">{new Date(session.date).toLocaleDateString('pt-PT')}</td>
                    <td className="p-5 text-base">{session.collaborator}</td>
                    <td className="p-5 text-base text-right flex items-center justify-end gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
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

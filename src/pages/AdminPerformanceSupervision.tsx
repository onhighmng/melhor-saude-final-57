import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpecialistPerformance {
  specialist_id: string;
  specialist_name: string;
  specialist_email: string;
  total_cases: number;
  resolved_cases: number;
  referred_cases: number;
  avg_satisfaction_rating: number;
  is_active: boolean;
}

interface ProviderPerformance {
  provider_id: string;
  provider_name: string;
  provider_email: string;
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  avg_rating: number;
  is_active: boolean;
}

export default function AdminPerformanceSupervision() {
  const [dateRange, setDateRange] = useState('30');
  const [specialists, setSpecialists] = useState<SpecialistPerformance[]>([]);
  const [providers, setProviders] = useState<ProviderPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPerformanceData();
  }, [dateRange]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Load specialist performance
      const { data: specialistData, error: specialistError } = await supabase
        .rpc('get_specialist_performance', {
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (specialistError) throw specialistError;
      setSpecialists(specialistData || []);

      // Load provider performance
      const { data: providerData, error: providerError } = await supabase
        .rpc('get_prestador_performance', {
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (providerError) throw providerError;
      setProviders(providerData || []);
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de desempenho',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary stats
  const specialistStats = {
    total: specialists.length,
    active: specialists.filter(s => s.is_active).length,
    totalCases: specialists.reduce((sum, s) => sum + s.total_cases, 0),
    avgSatisfaction: specialists.length > 0
      ? specialists.reduce((sum, s) => sum + (s.avg_satisfaction_rating || 0), 0) / specialists.length
      : 0
  };

  const providerStats = {
    total: providers.length,
    active: providers.filter(p => p.is_active).length,
    totalSessions: providers.reduce((sum, p) => sum + p.completed_sessions, 0),
    avgRating: providers.length > 0
      ? providers.reduce((sum, p) => sum + (p.avg_rating || 0), 0) / providers.length
      : 0
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Supervisão de Desempenho
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho de especialistas e prestadores
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6 flex justify-end">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="specialists" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="specialists">Especialistas Gerais</TabsTrigger>
          <TabsTrigger value="providers">Prestadores</TabsTrigger>
        </TabsList>

        {/* Specialists Tab */}
        <TabsContent value="specialists" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Especialistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{specialistStats.total}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {specialistStats.active} ativos
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Casos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{specialistStats.totalCases}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Satisfação Média
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {specialistStats.avgSatisfaction.toFixed(1)}/10
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tendência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Em crescimento</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Specialists Table */}
          <Card>
            <CardHeader>
              <CardTitle>Desempenho Individual</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : specialists.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum especialista encontrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Total Casos</TableHead>
                      <TableHead className="text-right">Resolvidos</TableHead>
                      <TableHead className="text-right">Encaminhados</TableHead>
                      <TableHead className="text-right">Satisfação</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialists.map((specialist) => (
                      <TableRow key={specialist.specialist_id}>
                        <TableCell className="font-medium">
                          {specialist.specialist_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {specialist.specialist_email}
                        </TableCell>
                        <TableCell className="text-right">
                          {specialist.total_cases}
                        </TableCell>
                        <TableCell className="text-right">
                          {specialist.resolved_cases}
                        </TableCell>
                        <TableCell className="text-right">
                          {specialist.referred_cases}
                        </TableCell>
                        <TableCell className="text-right">
                          {specialist.avg_satisfaction_rating
                            ? `${specialist.avg_satisfaction_rating.toFixed(1)}/10`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={specialist.is_active ? 'default' : 'secondary'}
                          >
                            {specialist.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Prestadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{providerStats.total}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {providerStats.active} ativos
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sessões Completadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{providerStats.totalSessions}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avaliação Média
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {providerStats.avgRating.toFixed(1)}/10
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tendência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Em crescimento</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Providers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Desempenho Individual</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : providers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum prestador encontrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Total Sessões</TableHead>
                      <TableHead className="text-right">Completadas</TableHead>
                      <TableHead className="text-right">Canceladas</TableHead>
                      <TableHead className="text-right">Avaliação</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((provider) => (
                      <TableRow key={provider.provider_id}>
                        <TableCell className="font-medium">
                          {provider.provider_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {provider.provider_email}
                        </TableCell>
                        <TableCell className="text-right">
                          {provider.total_sessions}
                        </TableCell>
                        <TableCell className="text-right">
                          {provider.completed_sessions}
                        </TableCell>
                        <TableCell className="text-right">
                          {provider.cancelled_sessions}
                        </TableCell>
                        <TableCell className="text-right">
                          {provider.avg_rating
                            ? `${provider.avg_rating.toFixed(1)}/10`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={provider.is_active ? 'default' : 'secondary'}
                          >
                            {provider.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}



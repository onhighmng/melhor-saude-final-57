import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Brain,
  Heart,
  DollarSign,
  Scale,
  Users,
  TrendingUp,
  Clock,
  Plus,
  Settings,
  BarChart3,
  Save,
  AlertTriangle,
  Info,
  Eye,
  Edit,
  UserPlus
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface ProviderInQueue {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  weight: number;
  status: 'active' | 'inactive';
  maxPerDay: number;
  maxPerWeek: number;
  currentUsage: {
    today: number;
    thisWeek: number;
  };
  pillar: string;
}

interface MatchingRules {
  fairnessWindow: number;
  stickinessEnabled: boolean;
  pillars: {
    [key: string]: {
      providers: ProviderInQueue[];
      totalWeight: number;
    };
  };
}

const AdminMatching = () => {
  const { toast } = useToast();
  const [matchingRules, setMatchingRules] = useState<MatchingRules>({
    fairnessWindow: 5,
    stickinessEnabled: true,
    pillars: {
      'mental-health': { providers: [], totalWeight: 0 },
      'physical-wellness': { providers: [], totalWeight: 0 },
      'financial-assistance': { providers: [], totalWeight: 0 },
      'legal-assistance': { providers: [], totalWeight: 0 }
    }
  });
  const [selectedPillar, setSelectedPillar] = useState('mental-health');
  const [isLoading, setIsLoading] = useState(true);
  const [showSimulation, setShowSimulation] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<ProviderInQueue[]>([]);

  // Mock providers removed - using real database queries

  const pillarConfig = {
    'mental-health': {
      name: 'Saúde Mental',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    'physical-wellness': {
      name: 'Bem-Estar Físico',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950'
    },
    'financial-assistance': {
      name: 'Assistência Financeira',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    'legal-assistance': {
      name: 'Assistência Jurídica',
      icon: Scale,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    }
  };

  useEffect(() => {
    loadMatchingRules();
  }, []);

  const loadMatchingRules = async () => {
    setIsLoading(true);
    try {
      // Load real providers from database
      const { data: providers, error } = await supabase
        .from('prestadores')
        .select('id, name, email, photo_url, pillar_specialties, is_active')
        .eq('is_active', true);

      if (error) throw error;

      // Transform to ProviderInQueue format
      const transformedProviders: ProviderInQueue[] = (providers || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        avatar: p.photo_url || undefined,
        weight: 1.0,
        status: p.is_active ? 'active' : 'inactive',
        maxPerDay: 5,
        maxPerWeek: 25,
        currentUsage: { today: 0, thisWeek: 0 },
        pillar: p.pillar_specialties?.[0] || 'mental-health'
      }));

      // Organize by pillar
      const organizedPillars = { ...matchingRules.pillars };
      
      transformedProviders.forEach(provider => {
        const pillarKey = provider.pillar.replace('saude_mental', 'mental-health')
          .replace('bem_estar_fisico', 'physical-wellness')
          .replace('assistencia_financeira', 'financial-assistance')
          .replace('assistencia_juridica', 'legal-assistance');
        
        if (organizedPillars[pillarKey]) {
          organizedPillars[pillarKey].providers.push(provider);
          organizedPillars[pillarKey].totalWeight += provider.weight;
        }
      });

      setMatchingRules(prev => ({
        ...prev,
        pillars: organizedPillars
      }));
      
      // Load current usage from bookings
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);

      const { data: todayBookings, error: todayError } = await supabase
        .from('bookings')
        .select('prestador_id')
        .gte('created_at', todayStart.toISOString())
        .eq('status', 'scheduled');

      const { data: weekBookings, error: weekError } = await supabase
        .from('bookings')
        .select('prestador_id')
        .gte('created_at', weekStart.toISOString())
        .eq('status', 'scheduled');

      if (todayError || weekError) {
        console.error('Error loading booking statistics:', todayError || weekError);
      }

      // Calculate usage for each provider
      const todayCount: Record<string, number> = {};
      const weekCount: Record<string, number> = {};

      todayBookings?.forEach(booking => {
        if (booking.prestador_id) {
          todayCount[booking.prestador_id] = (todayCount[booking.prestador_id] || 0) + 1;
        }
      });

      weekBookings?.forEach(booking => {
        if (booking.prestador_id) {
          weekCount[booking.prestador_id] = (weekCount[booking.prestador_id] || 0) + 1;
        }
      });

      // Update providers with usage data
      const providersWithUsage = transformedProviders.map(p => ({
        ...p,
        currentUsage: {
          today: todayCount[p.id] || 0,
          thisWeek: weekCount[p.id] || 0
        }
      }));

      setAvailableProviders(providersWithUsage);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading matching rules:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar regras de matching",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const updateProviderWeight = (pillar: string, providerId: string, newWeight: number) => {
    setMatchingRules(prev => {
      const updatedPillars = { ...prev.pillars };
      const pillarData = updatedPillars[pillar];
      
      const oldProvider = pillarData.providers.find(p => p.id === providerId);
      if (!oldProvider) return prev;
      
      const oldWeight = oldProvider.weight;
      pillarData.providers = pillarData.providers.map(p => 
        p.id === providerId ? { ...p, weight: newWeight } : p
      );
      pillarData.totalWeight = pillarData.totalWeight - oldWeight + newWeight;
      
      return { ...prev, pillars: updatedPillars };
    });
  };

  const addProviderToPillar = (pillar: string, provider: ProviderInQueue) => {
    setMatchingRules(prev => {
      const updatedPillars = { ...prev.pillars };
      updatedPillars[pillar].providers.push({ ...provider, pillar });
      updatedPillars[pillar].totalWeight += provider.weight;
      return { ...prev, pillars: updatedPillars };
    });
    
    setAvailableProviders(prev => prev.filter(p => p.id !== provider.id));
    
    toast({
      title: "Prestador adicionado",
      description: `${provider.name} foi adicionado a ${pillarConfig[pillar as keyof typeof pillarConfig].name}`
    });
  };

  const removeProviderFromPillar = (pillar: string, providerId: string) => {
    const provider = matchingRules.pillars[pillar].providers.find(p => p.id === providerId);
    if (!provider) return;

    setMatchingRules(prev => {
      const updatedPillars = { ...prev.pillars };
      updatedPillars[pillar].providers = updatedPillars[pillar].providers.filter(p => p.id !== providerId);
      updatedPillars[pillar].totalWeight -= provider.weight;
      return { ...prev, pillars: updatedPillars };
    });
    
    setAvailableProviders(prev => [...prev, provider]);
    
    toast({
      title: "Prestador removido",
      description: `${provider.name} foi removido da fila`
    });
  };

  const saveMatchingRules = async () => {
    try {
      setIsLoading(true);

      // Get current admin user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save provider assignments to specialist_assignments table
      const assignmentsToSave = [];
      
      for (const [pillarKey, pillarData] of Object.entries(matchingRules.pillars)) {
        for (const provider of pillarData.providers) {
          assignmentsToSave.push({
            pillar: pillarKey,
            specialist_id: provider.id,
            weight: provider.weight,
            is_primary: provider.weight > 1.0,
            assigned_by: user.id
          });
        }
      }

      // Delete existing assignments for these pillars
      const pillarKeys = Object.keys(matchingRules.pillars);
      const { error: deleteError } = await supabase
        .from('specialist_assignments')
        .delete()
        .in('pillar', pillarKeys);

      if (deleteError) throw deleteError;

      // Insert new assignments
      if (assignmentsToSave.length > 0) {
        const { error: insertError } = await supabase
          .from('specialist_assignments')
          .insert(assignmentsToSave);

        if (insertError) throw insertError;
      }

      toast({
        title: "Regras guardadas",
        description: "Regras de matching atualizadas com sucesso"
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving matching rules:', error);
      toast({
        title: "Erro",
        description: "Erro ao guardar regras",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const simulateDistribution = () => {
    setShowSimulation(true);
    toast({
      title: "Simulação iniciada",
      description: "A simular distribuição de prestadores"
    });
  };

  const getStatusBadge = (status: string) => {
    return <Badge variant={status === 'active' ? 'default' : 'secondary'} className={
      status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
    }>
      {status === 'active' ? 'Ativo' : 'Inativo'}
    </Badge>;
  };

  const getCapacityStatus = (provider: ProviderInQueue) => {
    const dailyUsage = (provider.currentUsage.today / provider.maxPerDay) * 100;
    const weeklyUsage = (provider.currentUsage.thisWeek / provider.maxPerWeek) * 100;
    
    if (dailyUsage >= 100 || weeklyUsage >= 100) {
      return { status: 'exceeded', color: 'text-red-600', bg: 'bg-red-50' };
    } else if (dailyUsage >= 80 || weeklyUsage >= 80) {
      return { status: 'warning', color: 'text-amber-600', bg: 'bg-amber-50' };
    } else {
      return { status: 'normal', color: 'text-green-600', bg: 'bg-green-50' };
    }
  };

  const totalActiveProviders = Object.values(matchingRules.pillars).reduce(
    (sum, pillar) => sum + pillar.providers.filter(p => p.status === 'active').length, 0
  );
  const avgUtilization = 75;
  const pendingChangeRequests = 3;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sistema de Matching</h1>
              <p className="text-sm text-muted-foreground">Gerir filas e distribuição de prestadores</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={simulateDistribution}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Simular Distribuição
              </Button>
              <Button onClick={saveMatchingRules}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Alterações
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(pillarConfig).map(([key, config]) => {
              const Icon = config.icon;
              const pillarData = matchingRules.pillars[key];
              const activeCount = pillarData.providers.filter(p => p.status === 'active').length;
              
              return (
                <Card key={key} className={`hover-lift border-0 shadow-sm ${config.bgColor}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      {config.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${config.color}`}>
                      {activeCount} prestadores
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total: {pillarData.providers.length} | Peso: {pillarData.totalWeight.toFixed(1)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Filas por Pilar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedPillar} onValueChange={setSelectedPillar}>
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      {Object.entries(pillarConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                            <Icon className={`h-4 w-4 ${config.color}`} />
                            <span className="hidden sm:inline">{config.name}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    {Object.entries(pillarConfig).map(([pillarKey, config]) => (
                      <TabsContent key={pillarKey} value={pillarKey} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{config.name}</h3>
                            <Badge variant="outline">
                              {matchingRules.pillars[pillarKey].providers.length} prestadores
                            </Badge>
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Prestador
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Adicionar à Fila de {config.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {availableProviders.length === 0 ? (
                                  <p className="text-muted-foreground text-center py-4">
                                    Todos os prestadores já estão atribuídos
                                  </p>
                                ) : (
                                  availableProviders.map(provider => (
                                    <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={provider.avatar} />
                                          <AvatarFallback>
                                            {provider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium">{provider.name}</p>
                                          <p className="text-sm text-muted-foreground">Peso: {provider.weight}</p>
                                        </div>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        onClick={() => addProviderToPillar(pillarKey, provider)}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {matchingRules.pillars[pillarKey].providers.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p>Nenhum prestador nesta fila</p>
                            <p className="text-sm mt-1">Adicione prestadores para começar</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Prestador</TableHead>
                                <TableHead>Peso</TableHead>
                                <TableHead>Capacidade</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {matchingRules.pillars[pillarKey].providers.map(provider => {
                                const capacity = getCapacityStatus(provider);
                                
                                return (
                                  <TableRow key={provider.id}>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={provider.avatar} />
                                          <AvatarFallback>
                                            {provider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium">{provider.name}</p>
                                          <p className="text-sm text-muted-foreground">{provider.email}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Select 
                                        value={provider.weight.toString()} 
                                        onValueChange={(value) => updateProviderWeight(pillarKey, provider.id, parseFloat(value))}
                                      >
                                        <SelectTrigger className="w-20">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border border-border shadow-lg z-50">
                                          <SelectItem value="0.5">0.5</SelectItem>
                                          <SelectItem value="1.0">1.0</SelectItem>
                                          <SelectItem value="1.5">1.5</SelectItem>
                                          <SelectItem value="2.0">2.0</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                    <TableCell>
                                      <div className="space-y-1">
                                        <div className={`text-sm p-2 rounded ${capacity.bg}`}>
                                          <p className={`font-medium ${capacity.color}`}>
                                            Uso Diário: {provider.currentUsage.today}/{provider.maxPerDay}
                                          </p>
                                          <p className={`font-medium ${capacity.color}`}>
                                            Uso Semanal: {provider.currentUsage.thisWeek}/{provider.maxPerWeek}
                                          </p>
                                        </div>
                                        {capacity.status === 'exceeded' && (
                                          <Badge variant="destructive" className="text-xs">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Capacidade máxima atingida
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {getStatusBadge(provider.status)}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => removeProviderFromPillar(pillarKey, provider.id)}
                                        >
                                          <AlertTriangle className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Janela de Equidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fairness-window">Período para análise de equidade</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="fairness-window"
                        type="number"
                        min="1"
                        max="20"
                        value={matchingRules.fairnessWindow}
                        onChange={(e) => setMatchingRules(prev => ({
                          ...prev,
                          fairnessWindow: parseInt(e.target.value) || 5
                        }))}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">dias</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Período para análise de equidade
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Stickiness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Label>Stickiness Ativado</Label>
                      <p className="text-sm text-muted-foreground">
                        Mantém utilizadores com o mesmo prestador quando possível
                      </p>
                    </div>
                    <Switch
                      checked={matchingRules.stickinessEnabled}
                      onCheckedChange={(checked) => setMatchingRules(prev => ({
                        ...prev,
                        stickinessEnabled: checked
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Estatísticas Resumidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Prestadores Ativos</span>
                      <Badge variant="secondary">{totalActiveProviders}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Utilização Média</span>
                      <div className="flex items-center gap-2">
                        <Progress value={avgUtilization} className="w-16 h-2" />
                        <span className="text-sm font-medium">{avgUtilization}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pedidos Pendentes</span>
                      <Badge variant={pendingChangeRequests > 0 ? "destructive" : "secondary"}>
                        {pendingChangeRequests}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Dialog open={showSimulation} onOpenChange={setShowSimulation}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Simulação de Distribuição</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Simulação de como os utilizadores serão distribuídos pelos prestadores
              </p>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(pillarConfig).map(([key, config]) => {
                  const pillarData = matchingRules.pillars[key];
                  const Icon = config.icon;
                  
                  return (
                    <Card key={key} className={config.bgColor}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          {config.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {pillarData.providers.map(provider => {
                          const percentage = pillarData.totalWeight > 0 
                            ? Math.round((provider.weight / pillarData.totalWeight) * 100)
                            : 0;
                          
                          return (
                            <div key={provider.id} className="flex justify-between items-center py-1">
                              <span className="text-sm">{provider.name}</span>
                              <Badge variant="outline">{percentage}%</Badge>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default AdminMatching;

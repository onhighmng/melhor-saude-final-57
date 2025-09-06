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

  // Mock data - replace with actual API calls
  const mockProviders: ProviderInQueue[] = [
    {
      id: '1',
      name: 'Dra. Maria Santos',
      email: 'maria.santos@clinic.pt',
      weight: 1.0,
      status: 'active',
      maxPerDay: 3,
      maxPerWeek: 15,
      currentUsage: { today: 2, thisWeek: 8 },
      pillar: 'mental-health'
    },
    {
      id: '2',
      name: 'Dr. Paulo Reis',
      email: 'paulo.reis@financial.pt',
      weight: 1.5,
      status: 'active',
      maxPerDay: 4,
      maxPerWeek: 20,
      currentUsage: { today: 1, thisWeek: 12 },
      pillar: 'mental-health'
    },
    {
      id: '3',
      name: 'Prof. Ana Rodrigues',
      email: 'ana.rodrigues@wellness.pt',
      weight: 0.5,
      status: 'inactive',
      maxPerDay: 2,
      maxPerWeek: 8,
      currentUsage: { today: 0, thisWeek: 0 },
      pillar: 'physical-wellness'
    },
    {
      id: '4',
      name: 'Dra. Sofia Alves',
      email: 'sofia.alves@legal.pt',
      weight: 1.0,
      status: 'active',
      maxPerDay: 3,
      maxPerWeek: 15,
      currentUsage: { today: 3, thisWeek: 15 },
      pillar: 'legal-assistance'
    }
  ];

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
      // Replace with actual API call
      setTimeout(() => {
        // Organize mock providers by pillar
        const organizedPillars = { ...matchingRules.pillars };
        
        mockProviders.forEach(provider => {
          if (organizedPillars[provider.pillar]) {
            organizedPillars[provider.pillar].providers.push(provider);
            organizedPillars[provider.pillar].totalWeight += provider.weight;
          }
        });

        setMatchingRules(prev => ({
          ...prev,
          pillars: organizedPillars
        }));
        
        setAvailableProviders(mockProviders.filter(p => 
          !Object.values(organizedPillars).some(pillar => 
            pillar.providers.some(pp => pp.id === p.id)
          )
        ));
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
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
      description: `${provider.name} foi adicionado à fila de ${pillarConfig[pillar as keyof typeof pillarConfig].name}`
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
      // Replace with actual API call
      toast({
        title: "Regras guardadas",
        description: "As regras de matching foram atualizadas com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao guardar regras",
        variant: "destructive"
      });
    }
  };

  const simulateDistribution = () => {
    setShowSimulation(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Inativo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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

  // Calculate summary metrics
  const totalActiveProviders = Object.values(matchingRules.pillars).reduce(
    (sum, pillar) => sum + pillar.providers.filter(p => p.status === 'active').length, 0
  );
  const avgUtilization = 75; // Mock value
  const pendingChangeRequests = 3; // Mock value

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
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Regras de Distribuição (Matching)</h1>
              <p className="text-sm text-muted-foreground">Configure como os prestadores são atribuídos por pilar, peso e capacidade</p>
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
            {/* Main Content */}
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
                                <DialogTitle>Adicionar Prestador a {config.name}</DialogTitle>
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
                            <p>Ainda não há prestadores atribuídos a este pilar.</p>
                            <p className="text-sm mt-1">Clique em "Adicionar Prestador" para começar.</p>
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
                                            Hoje: {provider.currentUsage.today}/{provider.maxPerDay}
                                          </p>
                                          <p className={`font-medium ${capacity.color}`}>
                                            Semana: {provider.currentUsage.thisWeek}/{provider.maxPerWeek}
                                          </p>
                                        </div>
                                        {capacity.status === 'exceeded' && (
                                          <Badge variant="destructive" className="text-xs">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Capacidade excedida
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

            {/* Settings Sidebar */}
            <div className="space-y-6">
              {/* Fairness Window */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Janela de Justiça
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fairness-window">Últimas atribuições consideradas</Label>
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
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Evita que o mesmo prestador receba múltiplas sessões consecutivas. 
                            Considera as últimas N atribuições para equilibrar a distribuição.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stickiness */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Stickiness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Label>Manter mesmo prestador</Label>
                      <p className="text-sm text-muted-foreground">
                        Mantém o mesmo prestador após a 1ª sessão do utilizador, 
                        exceto se for feita troca aprovada.
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

              {/* Summary Stats */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Resumo Geral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Prestadores ativos</span>
                      <Badge variant="secondary">{totalActiveProviders}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Taxa média de utilização</span>
                      <div className="flex items-center gap-2">
                        <Progress value={avgUtilization} className="w-16 h-2" />
                        <span className="text-sm font-medium">{avgUtilization}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pedidos de troca pendentes</span>
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

        {/* Simulation Dialog */}
        <Dialog open={showSimulation} onOpenChange={setShowSimulation}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Simulação de Distribuição</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Baseado nas regras atuais e pesos configurados, esta seria a distribuição prevista:
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
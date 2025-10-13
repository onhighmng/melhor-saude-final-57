import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  Users, 
  UserCheck,
  Clock,
  Brain,
  Heart,
  DollarSign,
  Scale,
  Star,
  TrendingUp,
  Building,
  Calendar,
  BarChart3,
  Video,
  MapPin,
  X,
  Eye,
  Phone,
  Mail,
  Globe,
  Award,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { mockProviders, AdminProvider as Provider } from '@/data/adminMockData';

const AdminProvidersTab = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Form states for new provider
  const [newProvider, setNewProvider] = useState({
    name: '',
    email: '',
    pillar: '',
    costPerSession: '',
    sessionType: '',
    status: 'Ativo'
  });

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [providers, searchQuery, pillarFilter, statusFilter]);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        setProviders(mockProviders);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar prestadores",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = providers;

    if (searchQuery) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (pillarFilter !== 'all') {
      filtered = filtered.filter(provider => provider.pillar === pillarFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(provider => provider.status === statusFilter);
    }

    setFilteredProviders(filtered);
  };

  const handleAddProvider = () => {
    // Validate form
    if (!newProvider.name || !newProvider.email || !newProvider.pillar || !newProvider.costPerSession || !newProvider.sessionType) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Prestador adicionado",
      description: `${newProvider.name} foi adicionado com sucesso`
    });

    setShowAddModal(false);
    setNewProvider({
      name: '',
      email: '',
      pillar: '',
      costPerSession: '',
      sessionType: '',
      status: 'Ativo'
    });
  };

  const handleCardClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowOptionsModal(true);
  };

  const handleViewMetrics = () => {
    setShowOptionsModal(false);
    setShowMetricsModal(true);
  };

  const handleViewCalendar = () => {
    setShowOptionsModal(false);
    setShowCalendarModal(true);
  };

  const handleStatusChange = (newStatus: 'Ativo' | 'Inativo') => {
    if (selectedProvider) {
      setProviders(prev => prev.map(p => 
        p.id === selectedProvider.id ? { ...p, status: newStatus } : p
      ));
      toast({
        title: "Estado atualizado",
        description: `Estado do prestador alterado para ${newStatus}`
      });
    }
  };

  // Calculate summary metrics
  const totalProviders = providers.length;
  const activeProviders = providers.filter(p => p.status === 'Ativo').length;
  const avgSatisfaction = providers.length > 0 
    ? (providers.reduce((sum, p) => sum + p.satisfaction, 0) / providers.length).toFixed(1)
    : '0.0';
  const totalSessionsThisMonth = providers.reduce((sum, p) => sum + p.sessionsThisMonth, 0);

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

  const getPillarName = (pillar: string) => {
    switch (pillar) {
      case 'mental-health':
        return 'Saúde Mental';
      case 'physical-wellness':
        return 'Bem-Estar Físico';
      case 'financial-assistance':
        return 'Assistência Financeira';
      case 'legal-assistance':
        return 'Assistência Jurídica';
      default:
        return pillar;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>;
      case 'Inativo':
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Inativo</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Prestadores</h2>
          <p className="text-sm text-muted-foreground">Gerir prestadores externos e suas métricas</p>
        </div>
        
        <Button onClick={() => setShowAddModal(true)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Prestador
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Total de Prestadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalProviders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeProviders} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              Prestadores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{activeProviders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((activeProviders / totalProviders) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-600" />
              Satisfação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">⭐ {avgSatisfaction}/10</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avaliação dos colaboradores
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Sessões Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{totalSessionsThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de todos os prestadores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Procurar por nome, email ou especialidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={pillarFilter} onValueChange={setPillarFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por Pilar" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border shadow-lg z-50">
            <SelectItem value="all">Todos os Pilares</SelectItem>
            <SelectItem value="mental-health">Saúde Mental</SelectItem>
            <SelectItem value="physical-wellness">Bem-Estar Físico</SelectItem>
            <SelectItem value="financial-assistance">Assistência Financeira</SelectItem>
            <SelectItem value="legal-assistance">Assistência Jurídica</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por Estado" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border shadow-lg z-50">
            <SelectItem value="all">Todos os Estados</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProviders.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {searchQuery || pillarFilter !== 'all' || statusFilter !== 'all'
              ? 'Nenhum prestador encontrado com os filtros aplicados' 
              : 'Nenhum prestador encontrado'}
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <Card 
              key={provider.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-sm"
              onClick={() => handleCardClick(provider)}
            >
              <CardContent className="p-6 space-y-4">
                {/* Provider Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={provider.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {provider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{provider.name}</h3>
                      <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                    </div>
                  </div>
                  {getStatusBadge(provider.status)}
                </div>

                {/* Pillar Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={`${getPillarBadgeColor(provider.pillar)} flex items-center gap-1`}>
                    {getPillarIcon(provider.pillar)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {provider.sessionType}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Custo por sessão:</span>
                    <span className="font-semibold">{provider.costPerSession} MZN</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Satisfação:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {provider.satisfaction}/10
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total de sessões:</span>
                    <span className="font-semibold">{provider.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sessões este mês:</span>
                    <span className="font-semibold text-blue-600">{provider.sessionsThisMonth}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Provider Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Prestador</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo prestador. Cada prestador pertence a apenas um pilar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                  placeholder="Ex: Dra. Maria Santos"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newProvider.email}
                  onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pillar">Pilar (apenas um pilar por prestador) *</Label>
              <Select value={newProvider.pillar} onValueChange={(value) => setNewProvider({ ...newProvider, pillar: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o pilar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mental-health">Saúde Mental</SelectItem>
                  <SelectItem value="physical-wellness">Bem-Estar Físico</SelectItem>
                  <SelectItem value="financial-assistance">Assistência Financeira</SelectItem>
                  <SelectItem value="legal-assistance">Assistência Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Custo por sessão (MZN) *</Label>
                <Input
                  id="cost"
                  type="number"
                  value={newProvider.costPerSession}
                  onChange={(e) => setNewProvider({ ...newProvider, costPerSession: e.target.value })}
                  placeholder="350"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionType">Tipo de sessão *</Label>
                <Select value={newProvider.sessionType} onValueChange={(value) => setNewProvider({ ...newProvider, sessionType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select value={newProvider.status} onValueChange={(value) => setNewProvider({ ...newProvider, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddProvider}>
              Adicionar Prestador
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Provider Options Modal */}
      <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProvider?.name}</DialogTitle>
            <DialogDescription>
              Escolha uma ação para este prestador
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-6">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={handleViewMetrics}
            >
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="text-center">
                <p className="font-semibold">Ver Métricas e Histórico</p>
                <p className="text-xs text-muted-foreground">Dados gerais, financeiros e histórico de sessões</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300"
              onClick={handleViewCalendar}
            >
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="text-center">
                <p className="font-semibold">Agendar Sessão no Calendário</p>
                <p className="text-xs text-muted-foreground">Ver disponibilidade e marcar sessões</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Metrics Modal */}
      <Dialog open={showMetricsModal} onOpenChange={setShowMetricsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedProvider?.name} - Métricas e Histórico</span>
              <Button variant="ghost" size="sm" onClick={() => setShowMetricsModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedProvider && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Dados Gerais</TabsTrigger>
                <TabsTrigger value="metrics">Métricas</TabsTrigger>
                <TabsTrigger value="financial">Financeiro</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>

              {/* A. Dados Gerais */}
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nome completo</Label>
                    <p className="text-lg font-semibold">{selectedProvider.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-lg">{selectedProvider.email}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Pilar</Label>
                    <div className="mt-1">
                      <Badge className={getPillarBadgeColor(selectedProvider.pillar)}>
                        {getPillarIcon(selectedProvider.pillar)}
                        <span className="ml-1">{getPillarName(selectedProvider.pillar)}</span>
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Tipo de sessão</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {selectedProvider.sessionType === 'Virtual' && <Video className="h-3 w-3" />}
                        {selectedProvider.sessionType === 'Presencial' && <MapPin className="h-3 w-3" />}
                        {selectedProvider.sessionType}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Estado atual</Label>
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant={selectedProvider.status === 'Ativo' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange('Ativo')}
                      >
                        Ativo
                      </Button>
                      <Button
                        variant={selectedProvider.status === 'Inativo' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange('Inativo')}
                      >
                        Inativo
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* B. Métricas Principais */}
              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-0 shadow-sm bg-blue-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Sessões realizadas</p>
                          <p className="text-2xl font-bold text-blue-700">{selectedProvider.totalSessions}</p>
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
                            {selectedProvider.satisfaction} / 10
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
                          <p className="text-2xl font-bold text-green-700">{selectedProvider.sessionsThisMonth}</p>
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
                          <p className="text-2xl font-bold text-purple-700">{selectedProvider.companiesServed}</p>
                        </div>
                        <Building className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* C. Financeiro */}
              <TabsContent value="financial" className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4 font-medium">💰 Custo por sessão</td>
                        <td className="p-4 text-right font-semibold">{selectedProvider.costPerSession} MZN</td>
                      </tr>
                      <tr className="border-b bg-muted/30">
                        <td className="p-4 font-medium">🧾 Margem Melhor Saúde ({selectedProvider.platformMargin}%)</td>
                        <td className="p-4 text-right font-semibold">{(selectedProvider.costPerSession * selectedProvider.platformMargin / 100).toFixed(2)} MZN</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">💸 Valor líquido ao prestador</td>
                        <td className="p-4 text-right font-semibold text-green-700">
                          {(selectedProvider.costPerSession * (100 - selectedProvider.platformMargin) / 100).toFixed(2)} MZN
                        </td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="p-4 font-medium">📆 Total pago este mês</td>
                        <td className="p-4 text-right font-bold text-blue-700 text-lg">
                          {selectedProvider.monthlyPayment.toFixed(2)} MZN
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* D. Histórico */}
              <TabsContent value="history" className="space-y-4">
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
                      {/* Mock recent sessions */}
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
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Calendar Modal */}
      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedProvider?.name} - Calendário de Sessões</span>
              <Button variant="ghost" size="sm" onClick={() => setShowCalendarModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              {selectedProvider && (
                <Badge className={getPillarBadgeColor(selectedProvider.pillar)}>
                  {getPillarIcon(selectedProvider.pillar)}
                  <span className="ml-1">{getPillarName(selectedProvider.pillar)}</span>
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
              <Select defaultValue="week">
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Visualização por Semana</SelectItem>
                  <SelectItem value="month">Visualização por Mês</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="Virtual">Virtual</SelectItem>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Calendar Grid (simplified) */}
            <div className="border rounded-lg p-6 bg-muted/20">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Outubro 2024</h3>
                <p className="text-sm text-muted-foreground">Clique em um horário disponível para agendar</p>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                  <div key={day} className="text-center font-medium text-sm p-2">
                    {day}
                  </div>
                ))}

                {/* Mock calendar days */}
                {Array.from({ length: 35 }).map((_, idx) => {
                  const dayNum = idx - 2;
                  const isCurrentMonth = dayNum >= 1 && dayNum <= 31;
                  const isBooked = [5, 8, 12, 15, 19, 22].includes(dayNum);
                  const isAvailable = isCurrentMonth && !isBooked;

                  return (
                    <div
                      key={idx}
                      className={`
                        p-4 rounded-lg border text-center
                        ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
                        ${isBooked ? 'bg-red-100 border-red-300 text-red-700' : ''}
                        ${isAvailable ? 'bg-green-100 border-green-300 hover:bg-green-200 cursor-pointer' : ''}
                      `}
                    >
                      {isCurrentMonth && (
                        <>
                          <div className="font-semibold">{dayNum}</div>
                          <div className="text-xs mt-1">
                            {isBooked ? '🔴 Ocupado' : '🟩 Livre'}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCalendarModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { AdminProvidersTab };
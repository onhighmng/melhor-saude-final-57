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
import { useNavigate } from 'react-router-dom';
import { mockProviders, AdminProvider as Provider } from '@/data/adminMockData';
import providerPlaceholder from '@/assets/provider-placeholder.jpg';
import { BookingModal } from '@/components/admin/providers/BookingModal';
import { InfoCard } from '@/components/ui/info-card';
import type { CalendarSlot } from '@/types/adminProvider';

const AdminProvidersTab = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pillarFilter, setPillarFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);

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
    // If no pillar is selected, show no providers
    if (!pillarFilter) {
      setFilteredProviders([]);
      return;
    }

    let filtered = providers.filter(provider => provider.pillar === pillarFilter);

    if (searchQuery) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
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

  const handleViewProvider = (provider: Provider) => {
    navigate(`/admin/provider-metrics/${provider.id}`);
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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

      {/* Pillar Cards - Clickable to filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className={`hover-lift border-2 shadow-sm cursor-pointer transition-all ${
            pillarFilter === 'mental-health' 
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900' 
              : 'border-transparent bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50 hover:border-blue-300'
          }`}
          onClick={() => setPillarFilter('mental-health')}
        >
          <CardContent className="p-6 text-center space-y-3">
            <Brain className="h-12 w-12 mx-auto text-blue-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saúde Mental</p>
              <p className="font-mono text-xl font-semibold text-blue-700 dark:text-blue-300">
                {providers.filter(p => p.pillar === 'mental-health').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`hover-lift border-2 shadow-sm cursor-pointer transition-all ${
            pillarFilter === 'physical-wellness' 
              ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900' 
              : 'border-transparent bg-gradient-to-br from-orange-50/50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/50 hover:border-orange-300'
          }`}
          onClick={() => setPillarFilter('physical-wellness')}
        >
          <CardContent className="p-6 text-center space-y-3">
            <Heart className="h-12 w-12 mx-auto text-orange-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bem-Estar Físico</p>
              <p className="font-mono text-xl font-semibold text-orange-700 dark:text-orange-300">
                {providers.filter(p => p.pillar === 'physical-wellness').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`hover-lift border-2 shadow-sm cursor-pointer transition-all ${
            pillarFilter === 'financial-assistance' 
              ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900' 
              : 'border-transparent bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/50 hover:border-green-300'
          }`}
          onClick={() => setPillarFilter('financial-assistance')}
        >
          <CardContent className="p-6 text-center space-y-3">
            <DollarSign className="h-12 w-12 mx-auto text-green-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assistência Financeira</p>
              <p className="font-mono text-xl font-semibold text-green-700 dark:text-green-300">
                {providers.filter(p => p.pillar === 'financial-assistance').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`hover-lift border-2 shadow-sm cursor-pointer transition-all ${
            pillarFilter === 'legal-assistance' 
              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900' 
              : 'border-transparent bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/50 hover:border-purple-300'
          }`}
          onClick={() => setPillarFilter('legal-assistance')}
        >
          <CardContent className="p-6 text-center space-y-3">
            <Scale className="h-12 w-12 mx-auto text-purple-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assistência Jurídica</p>
              <p className="font-mono text-xl font-semibold text-purple-700 dark:text-purple-300">
                {providers.filter(p => p.pillar === 'legal-assistance').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Status Filter - Only show when pillar is selected */}
      {pillarFilter && (
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

          <Button 
            variant="outline" 
            onClick={() => {
              setPillarFilter('');
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      )}

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {!pillarFilter ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Selecione um pilar para ver os prestadores</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum prestador encontrado com os filtros aplicados
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <InfoCard
              key={provider.id}
              name={provider.name}
              title={provider.email}
              avatar={provider.avatar || providerPlaceholder}
              specialty={provider.specialty}
              rating={provider.satisfaction}
              isPremium={provider.satisfaction >= 8}
              variant="specialist"
              type="provider"
              onView={() => handleViewProvider(provider)}
              className="w-full"
            />
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

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingModal
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
          provider={selectedProvider}
          slot={selectedSlot}
        />
      )}

    </div>
  );
};

export { AdminProvidersTab };
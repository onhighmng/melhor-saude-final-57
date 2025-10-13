import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProviderCard } from '@/components/admin/providers/ProviderCard';
import { AddProviderModal } from '@/components/admin/providers/AddProviderModal';
import { ProviderOptionsModal } from '@/components/admin/providers/ProviderOptionsModal';
import { ProviderMetricsView } from '@/components/admin/providers/ProviderMetricsView';
import { ProviderCalendarView } from '@/components/admin/providers/ProviderCalendarView';
import { mockProviders, mockProviderMetrics, mockProviderHistory } from '@/data/adminProvidersData';
import { Provider, Pillar, ProviderStatus } from '@/types/adminProvider';

export const AdminProviders = () => {
  
  // State
  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pillarFilter, setPillarFilter] = useState<Pillar | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ProviderStatus | 'all'>('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showMetricsView, setShowMetricsView] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      // Search filter
      const matchesSearch = 
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      // Pillar filter
      const matchesPillar = pillarFilter === 'all' || provider.pillar === pillarFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;

      return matchesSearch && matchesPillar && matchesStatus;
    });
  }, [providers, searchQuery, pillarFilter, statusFilter]);

  // Handler for card click
  const handleCardClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowOptionsModal(true);
  };

  // Handler for viewing metrics
  const handleViewMetrics = () => {
    setShowOptionsModal(false);
    setShowMetricsView(true);
  };

  // Handler for scheduling session
  const handleScheduleSession = () => {
    setShowOptionsModal(false);
    setShowCalendarView(true);
  };

  // Handler for going back from metrics/calendar to options
  const handleBackToOptions = () => {
    setShowMetricsView(false);
    setShowCalendarView(false);
    setShowOptionsModal(true);
  };

  // Handler for status change
  const handleStatusChange = (newStatus: ProviderStatus) => {
    if (selectedProvider) {
      setProviders(prev => 
        prev.map(p => 
          p.id === selectedProvider.id ? { ...p, status: newStatus } : p
        )
      );
      setSelectedProvider({ ...selectedProvider, status: newStatus });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Prestadores</h1>
          <p className="text-muted-foreground mt-1">Gerir prestadores externos, visualizar métricas e agendar sessões</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Prestador
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar prestadores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Pillar Filter */}
        <Select value={pillarFilter} onValueChange={(value) => setPillarFilter(value as Pillar | 'all')}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os pilares</SelectItem>
            <SelectItem value="mental_health">Saúde Mental</SelectItem>
            <SelectItem value="physical_wellness">Bem-Estar Físico</SelectItem>
            <SelectItem value="financial_assistance">Assistência Financeira</SelectItem>
            <SelectItem value="legal_assistance">Assistência Jurídica</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProviderStatus | 'all')}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="busy">Ocupado</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Providers Grid */}
      {filteredProviders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum prestador encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onClick={() => handleCardClick(provider)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddProviderModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => {
          // Refresh providers list
        }}
      />

      <ProviderOptionsModal
        open={showOptionsModal}
        onOpenChange={setShowOptionsModal}
        provider={selectedProvider}
        onViewMetrics={handleViewMetrics}
        onScheduleSession={handleScheduleSession}
      />

      <ProviderMetricsView
        open={showMetricsView}
        onOpenChange={setShowMetricsView}
        provider={selectedProvider}
        metrics={selectedProvider ? mockProviderMetrics[selectedProvider.id] : null}
        history={selectedProvider ? (mockProviderHistory[selectedProvider.id] || []) : []}
        onBack={handleBackToOptions}
        onStatusChange={handleStatusChange}
      />

      <ProviderCalendarView
        open={showCalendarView}
        onOpenChange={setShowCalendarView}
        provider={selectedProvider}
        onBack={handleBackToOptions}
      />
    </div>
  );
};

export default AdminProviders;

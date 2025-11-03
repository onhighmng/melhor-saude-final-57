import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Search, 
  Eye, 
  UserCog, 
  Calendar, 
  Plus, 
  Brain,
  Heart,
  DollarSign,
  Scale,
  Mail,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  email: string;
  specialty: string;
  pillar: string;
  totalSessions: number;
  scheduledSessions: number;
  status: 'Ativo' | 'Inativo' | 'Pendente';
  costPerSession: number;
}

interface AdminProvidersTabProps {
  onAddProvider?: () => void;
}

export const AdminProvidersTab = ({ onAddProvider }: AdminProvidersTabProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [providerDetails, setProviderDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadProviders();

    // Real-time subscription
    const channel = supabase
      .channel('providers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'prestadores' },
        () => loadProviders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      
      // Load both prestadores AND specialists from profiles
      const [prestadoresResult, specialistsResult] = await Promise.all([
        // Get prestadores from prestadores table with profiles join
        supabase
          .from('prestadores')
          .select('*, profiles(name, email)')
          .order('created_at', { ascending: false }),
        // Get specialists from profiles table
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'especialista_geral')
          .order('created_at', { ascending: false })
      ]);

      if (prestadoresResult.error) throw prestadoresResult.error;
      if (specialistsResult.error) throw specialistsResult.error;

      const allProviders = [];

      // Process prestadores
      if (prestadoresResult.data) {
        for (const provider of prestadoresResult.data) {
          // Count scheduled/confirmed bookings
          const { count: scheduledCount } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('prestador_id', provider.id)
            .in('status', ['pending', 'confirmed']);
          
          const scheduledSessions = scheduledCount || 0;
          
          // Get first pillar from array
          const pillarArray = provider.pillars || provider.pillar_specialties || [];
          const pillar = Array.isArray(pillarArray) && pillarArray.length > 0
            ? pillarArray[0]
            : 'N/A';
          
          // Get specialty from direct field or array
          const specialtyArray = provider.specialization || provider.specialties || [];
          const specialty = Array.isArray(specialtyArray) && specialtyArray.length > 0
            ? specialtyArray[0]
            : provider.specialty || 'N/A';
          
          // Get name and email from joined profiles
          const profileData = provider.profiles as any;
          
          allProviders.push({
            id: provider.id,
            name: profileData?.name || 'N/A',
            email: profileData?.email || 'N/A',
            specialty: specialty,
            pillar: pillar,
            totalSessions: provider.total_sessions || 0,
            scheduledSessions: scheduledSessions,
            status: provider.is_active ? ('Ativo' as const) : ('Inativo' as const),
            costPerSession: provider.cost_per_session || 0,
          });
        }
      }

      // Process specialists (especialista_geral from profiles)
      if (specialistsResult.data) {
        for (const specialist of specialistsResult.data) {
          allProviders.push({
            id: specialist.id,
            name: specialist.name || 'N/A',
            email: specialist.email || 'N/A',
            specialty: 'Especialista Geral',
            pillar: 'Geral',
            totalSessions: 0,
            scheduledSessions: 0,
            status: specialist.is_active ? ('Ativo' as const) : ('Inativo' as const),
            costPerSession: 0,
          });
        }
      }

      setProviders(allProviders);
    } catch (error) {
      console.error('Error loading providers:', error);
      toast.error('Erro ao carregar prestadores e especialistas');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProviderColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800', 
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    return colors[index % colors.length];
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'saude_mental':
        return <Brain className="h-4 w-4" />;
      case 'bem_estar_fisico':
        return <Heart className="h-4 w-4" />;
      case 'assistencia_financeira':
        return <DollarSign className="h-4 w-4" />;
      case 'assistencia_juridica':
        return <Scale className="h-4 w-4" />;
      default:
        return <UserCog className="h-4 w-4" />;
    }
  };

  const getSpecialtyLabel = (specialty: string) => {
    const specialties: Record<string, string> = {
      'psicologia': 'Psicologia',
      'nutricao': 'Nutrição',
      'consultoria_financeira': 'Consultoria Financeira',
      'assistencia_legal': 'Assistência Legal',
      'coaching': 'Coaching',
      'terapia': 'Terapia',
    };
    return specialties[specialty] || specialty;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Ativo</Badge>;
      case 'Inativo':
        return <Badge variant="outline" className="border-gray-200 text-gray-700">Inativo</Badge>;
      case 'Pendente':
        return <Badge variant="outline" className="border-yellow-200 text-yellow-700">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewProvider = async (provider: Provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
    setLoadingDetails(true);
    
    try {
      // Load detailed provider information
      const { data: prestadorData } = await supabase
        .from('prestadores')
        .select('*')
        .eq('id', provider.id)
        .single();

      // Load session statistics
      const { data: completedSessions } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('prestador_id', provider.id)
        .eq('status', 'completed');

      const { data: cancelledSessions } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('prestador_id', provider.id)
        .eq('status', 'cancelled');

      const totalSessionsCount = provider.totalSessions || 0;
      const completedCount = (completedSessions as any) || 0;
      const cancelledCount = (cancelledSessions as any) || 0;
      const cancellationRate = totalSessionsCount > 0 
        ? Math.round((Number(cancelledCount) / Number(totalSessionsCount)) * 100) 
        : 0;

      // Load availability data - note: prestador_availability table may not exist yet
      // This is a graceful fallback
      let availability: any[] = [];
      try {
        const { data } = await supabase
          .from('prestador_availability' as any)
          .select('*')
          .eq('prestador_id', provider.id)
          .order('day_of_week');
        availability = data || [];
      } catch (err) {
        console.warn('Availability table not accessible:', err);
        availability = [];
      }

      setProviderDetails({
        ...prestadorData,
        sessionStats: {
          total: totalSessionsCount,
          scheduled: provider.scheduledSessions,
          completed: completedCount,
          cancelled: cancelledCount,
          cancellationRate
        },
        availability: availability
      });
    } catch (error) {
      console.error('Error loading provider details:', error);
      toast.error('Erro ao carregar detalhes do prestador');
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
            placeholder="Pesquisar prestadores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
      </div>

      {/* Providers List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b font-medium text-sm text-gray-600">
            <div>Affiliate</div>
            <div>Especialidade</div>
            <div>Sessões</div>
            <div>Estado</div>
              </div>
              
          {/* Providers Rows */}
          <div className="divide-y">
            {filteredProviders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum affiliate encontrado</p>
              </div>
            ) : (
              filteredProviders.map((provider, index) => (
                <div 
                  key={provider.id} 
                  className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Provider Name */}
                  <div className="flex items-center">
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getProviderColor(index)}`}>
                      {provider.name}
              </div>
            </div>

                  {/* Specialty */}
                  <div className="flex items-center gap-2 text-sm">
                    {getPillarIcon(provider.pillar)}
                    <span>{getSpecialtyLabel(provider.specialty)}</span>
            </div>

                  {/* Sessions */}
                  <div className="text-sm">
                    <span className="font-medium">{provider.totalSessions}</span>
                    <span className="text-gray-400"> / {provider.scheduledSessions} agendadas</span>
              </div>
              
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    {getStatusBadge(provider.status)}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProvider(provider)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
              </div>
            </div>
            </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Helper Text */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <UserCog className="h-4 w-4 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-medium text-yellow-900">Como Adicionar Prestadores</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Para permitir que novos prestadores se registem, gere códigos Prestador na aba "Gestão de Códigos". 
              Os prestadores usarão esses códigos para registar-se na plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Detalhes do Affiliate - {selectedProvider?.name}
            </DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : providerDetails ? (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informação Básica</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas de Sessões</TabsTrigger>
                <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nome</label>
                        <p className="text-base font-semibold">{selectedProvider?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <p className="text-base">{selectedProvider?.email}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Especialidade</label>
                        <p className="text-base">{getSpecialtyLabel(selectedProvider?.specialty || '')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Pilar</label>
                        <div className="flex items-center gap-2">
                          {getPillarIcon(selectedProvider?.pillar || '')}
                          <p className="text-base">{selectedProvider?.pillar}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Estado</label>
                        <div className="mt-1">{getStatusBadge(selectedProvider?.status || '')}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Custo por Sessão</label>
                        <p className="text-base font-semibold">{selectedProvider?.costPerSession || 0} MZN</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Session Statistics Tab */}
              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {providerDetails.sessionStats.total}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Total de Sessões</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-2">
                          <Clock className="h-6 w-6" />
                          {providerDetails.sessionStats.scheduled}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Agendadas</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-2">
                          <CheckCircle className="h-6 w-6" />
                          {providerDetails.sessionStats.completed}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Concluídas</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600 flex items-center justify-center gap-2">
                          <XCircle className="h-6 w-6" />
                          {providerDetails.sessionStats.cancelled}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Canceladas</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Taxa de Cancelamento</span>
                      <span className="text-2xl font-bold text-red-600">
                        {providerDetails.sessionStats.cancellationRate}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Availability Calendar Tab */}
              <TabsContent value="availability" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    {providerDetails.availability.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma disponibilidade configurada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {providerDetails.availability.map((slot: any) => (
                          <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium">
                                  {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][slot.day_of_week]}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {slot.start_time} - {slot.end_time}
                                </p>
                              </div>
                            </div>
                            {slot.is_available ? (
                              <Badge className="bg-green-100 text-green-700">Disponível</Badge>
                            ) : (
                              <Badge variant="outline">Indisponível</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Erro ao carregar detalhes</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
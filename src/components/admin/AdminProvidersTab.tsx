import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Scale
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
      const { data: providersData, error: providersError } = await supabase
        .from('prestadores')
        .select(`
          *,
          profiles!prestadores_user_id_fkey(name, email)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (providersError) throw providersError;

      if (providersData) {
        // Get scheduled sessions count for each provider
        const providersWithSessions = await Promise.all(
          providersData.map(async (provider: any) => {
            const profile = provider.profiles as any;
            
            // Count scheduled/confirmed bookings
            const { count: scheduledCount } = await supabase
              .from('bookings')
              .select('*', { count: 'exact', head: true })
              .eq('prestador_id', provider.id)
              .in('status', ['pending', 'confirmed']);
            
            const scheduledSessions = scheduledCount || 0;
            
            // Get first pillar from array - try different possible column names
            const pillarArray = provider.pillar_specialties || provider.pillars || [];
            const pillar = Array.isArray(pillarArray) && pillarArray.length > 0
              ? pillarArray[0]
              : 'N/A';
            
            // Get specialty - try different possible column names
            const specialtyArray = provider.specialization || provider.specialties || [];
            const specialty = Array.isArray(specialtyArray) && specialtyArray.length > 0
              ? specialtyArray[0]
              : provider.specialty || 'N/A';
            
            return {
              id: provider.id,
              name: profile?.name || provider.name || 'N/A',
              email: profile?.email || provider.email || 'N/A',
              specialty: specialty,
              pillar: pillar,
              totalSessions: provider.total_sessions || 0,
              scheduledSessions: scheduledSessions,
              status: provider.is_active ? ('Ativo' as const) : ('Inativo' as const),
              costPerSession: provider.cost_per_session || 0,
            };
          })
        );

        setProviders(providersWithSessions);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
      toast.error('Erro ao carregar prestadores');
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
                <p>Nenhum prestador encontrado</p>
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
                        onClick={() => navigate(`/admin/providers/${provider.id}`)}
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
    </div>
  );
};
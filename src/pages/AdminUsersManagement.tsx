import { useState, useEffect } from 'react';
import { Building2, Users, UserCog, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { AdminCompaniesTab } from '@/components/admin/AdminCompaniesTab';
import { AdminProvidersTab } from '@/components/admin/AdminProvidersTab';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminUsersManagement = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const { toast } = useToast();
  
  // Get real analytics data
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  useEffect(() => {
    // Add admin-page class to body for gray background
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  // Card data for left side animation
  const cards = [
    {
      id: 'companies',
      title: 'Empresas',
      subtitle: 'Gerir empresas e códigos',
      description: 'Gestão completa de empresas cadastradas, geração de códigos de acesso únicos e monitoramento de utilizações em tempo real.',
      icon: Building2,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
      accentColor: 'bg-yellow-400'
    },
    {
      id: 'affiliates',
      title: 'Affiliates',
      subtitle: 'Gerir especialistas',
      description: 'Administração de prestadores de serviços, atribuição de especialidades e controle de disponibilidade para agendamentos.',
      icon: UserCog,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900',
      accentColor: 'bg-blue-400'
    }
  ];

  const nextCard = () => {
    const newIndex = (currentCardIndex + 1) % cards.length;
    setCurrentCardIndex(newIndex);
  };

  const prevCard = () => {
    const newIndex = (currentCardIndex - 1 + cards.length) % cards.length;
    setCurrentCardIndex(newIndex);
  };

  const currentCard = cards[currentCardIndex];

  return (
    <div className="relative w-full min-h-screen h-full flex flex-col bg-gray-50">
      <div className="relative z-10 h-full flex flex-col">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-6 h-full flex flex-col min-h-0">
          {/* Main Content Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
            
            {/* Left Side - Animated Cards */}
            <div className="lg:col-span-1 space-y-6">
              {/* Animated Card */}
              <div className="relative">
                <Card className={`${currentCard.bgColor} border-0 shadow-lg transition-all duration-500 ease-in-out transform hover:scale-105`}>
                  <div className={`absolute top-0 left-0 right-0 h-1 ${currentCard.accentColor} rounded-t-lg`} />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${currentCard.bgColor} border border-white/20`}>
                        <currentCard.icon className={`h-8 w-8 ${currentCard.iconColor}`} />
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={prevCard}
                          className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/30"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={nextCard}
                          className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/30"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className={`text-2xl font-bold ${currentCard.textColor}`}>
                        {currentCard.title}
                      </h3>
                      <p className={`text-lg font-medium ${currentCard.textColor}`}>
                        {currentCard.subtitle}
                      </p>
                      <p className={`text-sm ${currentCard.textColor} opacity-80 leading-relaxed`}>
                        {currentCard.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Description */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-900">
                  Gestão Centralizada de Utilizadores{' '}
                  <span className="text-blue-600">Wellness Platform</span>
                </h2>
                <p className="text-sm text-gray-600">
                  Controle completo sobre empresas e affiliates numa única plataforma integrada.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{analytics?.total_companies || 0}+</div>
                  <div className="text-sm text-gray-600">Empresas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{analytics?.total_prestadores || 0}+</div>
                  <div className="text-sm text-gray-600">Affiliates</div>
                </div>
              </div>
            </div>

            {/* Right Side - Content Based on Card Selection */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentCard.id === 'companies' ? 'Empresas' : 'Affiliates'}
                </h1>
              </div>
              
              {/* Content Based on Card */}
              {currentCard.id === 'companies' ? (
                <div className="space-y-6">
                  <AdminCompaniesTab />
                  <CompaniesCodesSection toast={toast} />
                </div>
              ) : (
                <div className="space-y-6">
                  <AdminProvidersTab />
                  <ProvidersCodesSection toast={toast} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Companies Codes Section Component
const CompaniesCodesSection = ({ toast }: { toast: ReturnType<typeof useToast>['toast'] }) => {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      setLoading(true);
      
      // Query all invites, then filter in JavaScript to avoid column issues
      const { data: allCodes, error } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter by user_type in JavaScript (handles if column is null or doesn't exist)
      const filteredCodes = (allCodes || []).filter((code: any) => 
        code.user_type === 'hr' || code.user_type === 'user'
      );
      
      setCodes(filteredCodes);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar códigos', variant: 'destructive' });
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async (userType: 'hr' | 'user') => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.rpc('generate_access_code' as any, {
        p_user_type: userType,
        p_company_id: null,
        p_metadata: {},
        p_expires_days: 30
      });

      if (error) throw error;
      toast({ title: 'Sucesso', description: `Código ${data} gerado com sucesso!` });
      loadCodes();
    } catch (error: any) {
      console.error('Error generating code:', error);
      toast({ 
        title: 'Erro', 
        description: error?.message || 'Erro ao gerar código. Verifique se a função está instalada corretamente.', 
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Sucesso', description: 'Código copiado!' });
  };

  const getStatusBadge = (code: any) => {
    if (code.status === 'accepted') return <Badge className="bg-blue-100 text-blue-700">Usado</Badge>;
    if (code.status === 'revoked') return <Badge className="bg-red-100 text-red-700">Revogado</Badge>;
    if (new Date(code.expires_at) < new Date()) return <Badge className="bg-gray-100 text-gray-700">Expirado</Badge>;
    return <Badge className="bg-green-100 text-green-700">Ativo</Badge>;
  };

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'hr': 'Responsável HR',
      'user': 'Colaborador',
      'personal': 'Pessoal',
      'prestador': 'Prestador'
    };
    return labels[type] || type;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Códigos de Acesso</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => handleGenerateCode('hr')}
              disabled={isGenerating}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Gerar HR
            </Button>
            <Button
              onClick={() => handleGenerateCode('user')}
              disabled={isGenerating}
              size="sm"
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Gerar Colaborador
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum código gerado</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 font-medium text-sm text-gray-600 border-b">
              <div>Código</div>
              <div>Estado</div>
              <div>Tipo</div>
              <div>Criado</div>
              <div>Expira</div>
            </div>
            {codes.slice(0, 5).map((code) => (
              <div key={code.id} className="grid grid-cols-5 gap-4 p-3 hover:bg-gray-50 rounded">
                <div className="font-mono text-sm">{code.invite_code}</div>
                <div>{getStatusBadge(code)}</div>
                <div className="text-sm">{getUserTypeLabel(code.user_type)}</div>
                <div className="text-sm text-gray-600">{new Date(code.created_at).toLocaleDateString('pt-PT')}</div>
                <div className="text-sm text-gray-600">{new Date(code.expires_at).toLocaleDateString('pt-PT')}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Providers Codes Section Component
const ProvidersCodesSection = ({ toast }: { toast: ReturnType<typeof useToast>['toast'] }) => {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      setLoading(true);
      
      // Query all invites, then filter in JavaScript to avoid column issues
      const { data: allCodes, error } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter by user_type in JavaScript
      const filteredCodes = (allCodes || []).filter((code: any) => code.user_type === 'prestador');
      
      setCodes(filteredCodes);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar códigos', variant: 'destructive' });
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.rpc('generate_access_code' as any, {
        p_user_type: 'prestador',
        p_company_id: null,
        p_metadata: {},
        p_expires_days: 30
      });

      if (error) throw error;
      toast({ title: 'Sucesso', description: `Código ${data} gerado com sucesso!` });
      loadCodes();
    } catch (error: any) {
      console.error('Error generating code:', error);
      toast({ 
        title: 'Erro', 
        description: error?.message || 'Erro ao gerar código. Verifique se a função está instalada corretamente.', 
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (code: any) => {
    if (code.status === 'accepted') return <Badge className="bg-blue-100 text-blue-700">Usado</Badge>;
    if (code.status === 'revoked') return <Badge className="bg-red-100 text-red-700">Revogado</Badge>;
    if (new Date(code.expires_at) < new Date()) return <Badge className="bg-gray-100 text-gray-700">Expirado</Badge>;
    return <Badge className="bg-green-100 text-green-700">Ativo</Badge>;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Códigos de Acesso</h2>
          <Button
            onClick={handleGenerateCode}
            disabled={isGenerating}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <UserCog className="h-4 w-4 mr-2" />
            {isGenerating ? 'Gerando...' : 'Gerar Código Prestador'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum código gerado</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 font-medium text-sm text-gray-600 border-b">
              <div>Código</div>
              <div>Estado</div>
              <div>Tipo</div>
              <div>Criado</div>
              <div>Expira</div>
            </div>
            {codes.slice(0, 5).map((code) => (
              <div key={code.id} className="grid grid-cols-5 gap-4 p-3 hover:bg-gray-50 rounded">
                <div className="font-mono text-sm">{code.invite_code}</div>
                <div>{getStatusBadge(code)}</div>
                <div className="text-sm">Prestador</div>
                <div className="text-sm text-gray-600">{new Date(code.created_at).toLocaleDateString('pt-PT')}</div>
                <div className="text-sm text-gray-600">{new Date(code.expires_at).toLocaleDateString('pt-PT')}</div>
      </div>
            ))}
    </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsersManagement;
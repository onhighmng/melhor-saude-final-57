import { useState, useEffect } from 'react';
import { Building2, Users, UserCog, ChevronLeft, ChevronRight, User, Trash2, Shield } from 'lucide-react';
import { AdminCompaniesTab } from '@/components/admin/AdminCompaniesTab';
import { AdminProvidersTab } from '@/components/admin/AdminProvidersTab';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<any | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showHRModal, setShowHRModal] = useState(false);
  const [sessionsAllocated, setSessionsAllocated] = useState<number>(5);

  // Filter codes based on search query
  const filteredCodes = codes.filter(code => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      code.invite_code?.toLowerCase().includes(query) ||
      code.email?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    loadCodes();
  }, []);

  // Load companies when HR modal opens
  useEffect(() => {
    if (showHRModal) {
      loadCompanies();
    }
  }, [showHRModal]);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao carregar empresas', 
        variant: 'destructive' 
      });
    }
  };

  const loadCodes = async () => {
    try {
      setLoading(true);

      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        toast({ 
          title: 'Autenticação necessária', 
          description: 'Você precisa estar autenticado como admin', 
          variant: 'destructive' 
        });
        setCodes([]);
        setLoading(false);
        return;
      }
      
      // Query all invites, then filter in JavaScript to avoid column issues
      const { data: allCodes, error } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading codes:', error);
        if (error.message.includes('permission') || error.code === 'PGRST301') {
          toast({ 
            title: 'Erro de permissão', 
            description: 'Você não tem permissão para ver códigos. Certifique-se de ter role de admin.', 
            variant: 'destructive' 
          });
        } else {
          throw error;
        }
        setCodes([]);
        setLoading(false);
        return;
      }
      
      // Show all admin-created codes (HR, Prestador, Especialista Geral)
      const filteredCodes = (allCodes || []).filter((code: any) => 
        code.role === 'hr' || code.role === 'prestador' || code.role === 'especialista_geral'
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

  // Helper function to generate random access code
  const generateAccessCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  // Generate HR code (requires company selection)
  const handleGenerateHRCode = async (selectedCompanyId: string, sessions: number) => {
    if (!selectedCompanyId) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma empresa',
        variant: 'destructive'
      });
      return;
    }

    if (!sessions || sessions < 1) {
      toast({
        title: 'Erro',
        description: 'Por favor, defina um número válido de sessões (mínimo 1)',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const code = generateAccessCode();
      const { error } = await supabase
        .from('invites')
        .insert({
          invite_code: code,
          role: 'hr',
          user_type: 'hr',
          company_id: selectedCompanyId,
          status: 'pending',
          sessions_allocated: sessions,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      
      if (error) throw error;

      toast({
        title: 'Código HR gerado!',
        description: `Código: ${code} com ${sessions} sessões alocadas`,
        duration: 10000
      });
      loadCodes();
    } catch (error) {
      console.error('Error generating HR code:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao gerar código HR.',
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

  const handleViewEmployees = async (code: any) => {
    if (!code.accepted_at || !code.email) {
      toast({ title: 'Aviso', description: 'Este código ainda não foi ativado', variant: 'default' });
      return;
    }

    setSelectedCompanyCode(code);
    setLoadingEmployees(true);
    
    try {
      // Find the user who activated this code
      const { data: userProfile, error: userError } = await Promise.race([
        supabase
          .from('profiles')
          .select('id, company_id, name, email')
          .eq('email', code.email)
          .single(),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 3000)
        )
      ]);

      if (userError || !userProfile || !userProfile.company_id) {
        toast({ title: 'Aviso', description: 'Empresa não encontrada ou sem colaboradores', variant: 'default' });
        setEmployees([]);
        setLoadingEmployees(false);
        return;
      }

      // Load employees for this company
      const { data: companyEmployees, error: employeesError } = await Promise.race([
        supabase
          .from('company_employees')
          .select(`
            user_id,
            sessions_allocated,
            sessions_used,
            is_active,
            profiles!company_employees_user_id_fkey(name, email)
          `)
          .eq('company_id', userProfile.company_id),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 3000)
        )
      ]);

      if (employeesError) {
        console.warn('[AdminUsersManagement] Error loading employees:', employeesError);
        setEmployees([]);
      } else {
        setEmployees(companyEmployees || []);
      }
    } catch (error) {
      console.warn('[AdminUsersManagement] Error loading employees:', error);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleDeleteCode = async (code: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the row click

    if (!confirm('Tem certeza que deseja suspender este código e a conta associada?')) {
      return;
    }

    try {
      // If code was activated, suspend the user account
      if (code.accepted_at && code.email) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_active: false })
          .eq('email', code.email);

        if (profileError) {
          console.error('Error suspending user:', profileError);
        }
      }

      // Revoke the code
      const { error: codeError } = await supabase
        .from('invites')
        .update({ status: 'revoked' })
        .eq('id', code.id);

      if (codeError) throw codeError;

      toast({ 
        title: 'Código suspenso', 
        description: 'Código revogado e conta suspensa com sucesso' 
      });
      loadCodes();
    } catch (error: any) {
      console.error('Error deleting code:', error);
      toast({ 
        title: 'Erro', 
        description: error?.message || 'Erro ao suspender código', 
        variant: 'destructive' 
      });
    }
  };

  const getStatusBadge = (code: any) => {
    if (code.status === 'accepted' || code.accepted_at) return <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-semibold">● Usado</Badge>;
    if (code.status === 'revoked') return <Badge className="bg-red-100 text-red-800 border-red-300 font-medium">✕ Revogado</Badge>;
    return <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">✓ Pendente</Badge>;
  };

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'hr': 'Responsável HR',
      'user': 'Colaborador',
      'personal': 'Pessoal',
      'prestador': 'Prestador',
      'especialista_geral': 'Especialista Geral',
      'specialist': 'Especialista Geral'
    };
    return labels[type] || type;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Códigos de Acesso</h2>
            <p className="text-sm text-muted-foreground">Gere códigos para HR</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowHRModal(true)}
              disabled={isGenerating}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Gerar HR
            </Button>
          </div>
        </div>

        {/* HR Code Generation Modal */}
        <Dialog open={showHRModal} onOpenChange={setShowHRModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar Código HR</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Selecionar Empresa</label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Selecione uma empresa...</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Número de Sessões Alocadas</label>
                <Input
                  type="number"
                  min="1"
                  value={sessionsAllocated}
                  onChange={(e) => setSessionsAllocated(parseInt(e.target.value) || 5)}
                  placeholder="Ex: 5"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Define quantas sessões esta empresa terá disponíveis
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowHRModal(false);
                    setSelectedCompanyId('');
                    setSessionsAllocated(5);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    handleGenerateHRCode(selectedCompanyId, sessionsAllocated);
                    setShowHRModal(false);
                    setSelectedCompanyId('');
                    setSessionsAllocated(5);
                  }}
                  disabled={!selectedCompanyId || isGenerating}
                >
                  Gerar Código
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Search Input */}
        <div className="mb-4">
          <Input
            placeholder="Pesquisar por código ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
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
        ) : filteredCodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum código encontrado para "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-8 gap-4 p-3 bg-gray-50 font-medium text-sm text-gray-600 border-b">
              <div>Código</div>
              <div>Tipo</div>
              <div>Usado Por</div>
              <div>Sessões</div>
              <div>Criado</div>
              <div>Ativado</div>
              <div>Estado</div>
              <div>Ações</div>
            </div>
            {filteredCodes.slice(0, 10).map((code) => (
              <div 
                key={code.id} 
                className="grid grid-cols-8 gap-4 p-3 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                onClick={() => handleViewEmployees(code)}
              >
                <div className="font-mono text-sm">{code.invite_code}</div>
                <div className="text-sm">{getUserTypeLabel(code.role)}</div>
                <div className="text-sm">
                  {code.email ? (
                    <span className="font-medium text-purple-700">{code.email}</span>
                  ) : (
                    <span className="text-gray-400">Não usado</span>
                  )}
                </div>
                <div className="text-sm font-semibold text-blue-600">{code.sessions_allocated || 5}</div>
                <div className="text-sm text-gray-600">
                  {new Date(code.created_at).toLocaleDateString('pt-PT')}
                </div>
                <div className="text-sm text-gray-600">
                  {code.accepted_at ? new Date(code.accepted_at).toLocaleDateString('pt-PT') : 'Não ativado'}
                </div>
                <div>{getStatusBadge(code)}</div>
                <div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => handleDeleteCode(code, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Employee List Modal */}
        <Dialog open={!!selectedCompanyCode} onOpenChange={() => setSelectedCompanyCode(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                Colaboradores - {selectedCompanyCode?.email || 'Empresa'}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
              {loadingEmployees ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum colaborador encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 font-medium text-sm text-gray-600 border-b sticky top-0">
                    <div>Nome</div>
                    <div>Email</div>
                    <div>Sessões Usadas</div>
                    <div>Sessões Alocadas</div>
                    <div>Estado</div>
                  </div>
                  {employees.map((employee) => (
                    <div key={employee.user_id} className="grid grid-cols-5 gap-4 p-3 hover:bg-gray-50 rounded">
                      <div className="text-sm">{(employee.profiles as any)?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-600">{(employee.profiles as any)?.email || 'N/A'}</div>
                      <div className="text-sm text-gray-600">{employee.sessions_used || 0}</div>
                      <div className="text-sm text-gray-600">{employee.sessions_allocated || 0}</div>
                      <div>
                        {employee.is_active ? (
                          <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">Inativo</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Providers Codes Section Component
const ProvidersCodesSection = ({ toast }: { toast: ReturnType<typeof useToast>['toast'] }) => {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter codes based on search query
  const filteredCodes = codes.filter(code => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      code.invite_code?.toLowerCase().includes(query) ||
      code.email?.toLowerCase().includes(query) ||
      (code.role === 'prestador' ? 'prestador' : 'profesional de permanencia').includes(query)
    );
  });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      setLoading(true);

      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        toast({ 
          title: 'Autenticação necessária', 
          description: 'Você precisa estar autenticado como admin', 
          variant: 'destructive' 
        });
        setCodes([]);
        setLoading(false);
        return;
      }
      
      // Query all invites, then filter in JavaScript to avoid column issues
      const { data: allCodes, error } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading codes:', error);
        if (error.message.includes('permission') || error.code === 'PGRST301') {
          toast({ 
            title: 'Erro de permissão', 
            description: 'Você não tem permissão para ver códigos. Certifique-se de ter role de admin.', 
            variant: 'destructive' 
          });
        } else {
          throw error;
        }
        setCodes([]);
        setLoading(false);
        return;
      }
      
      // Filter by role in JavaScript (both prestador and specialist)
      const filteredCodes = (allCodes || []).filter((code: any) => 
        code.role === 'prestador' || code.role === 'especialista_geral'
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

  // Helper function to generate random access code
  const generateAccessCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const handleGenerateCode = async (userType: 'prestador' | 'specialist') => {
    setIsGenerating(true);
    try {
      const code = generateAccessCode();
      const role = userType === 'specialist' ? 'especialista_geral' : 'prestador';
      
      const { error } = await supabase
        .from('invites')
        .insert({
          invite_code: code,
          role: role,
          user_type: userType,
          company_id: null, // Platform-wide
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Código Gerado',
        description: `Código ${userType === 'specialist' ? 'Especialista' : 'Prestador'}: ${code}`,
        duration: 10000
      });
      loadCodes();
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao gerar código.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteCode = async (code: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering any parent click handlers

    if (!confirm('Tem certeza que deseja suspender este código e a conta associada?')) {
      return;
    }

    try {
      // If code was activated, suspend the user account
      if (code.accepted_at && code.email) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_active: false })
          .eq('email', code.email);

        if (profileError) {
          console.error('Error suspending user:', profileError);
        }
      }

      // Revoke the code
      const { error: codeError } = await supabase
        .from('invites')
        .update({ status: 'revoked' })
        .eq('id', code.id);

      if (codeError) throw codeError;

      toast({ 
        title: 'Código suspenso', 
        description: 'Código revogado e conta suspensa com sucesso' 
      });
      loadCodes();
    } catch (error: any) {
      console.error('Error deleting code:', error);
      toast({ 
        title: 'Erro', 
        description: error?.message || 'Erro ao suspender código', 
        variant: 'destructive' 
      });
    }
  };

  const getStatusBadge = (code: any) => {
    if (code.status === 'accepted' || code.accepted_at) return <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-semibold">● Usado</Badge>;
    if (code.status === 'revoked') return <Badge className="bg-red-100 text-red-800 border-red-300 font-medium">✕ Revogado</Badge>;
    return <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">✓ Pendente</Badge>;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Códigos de Acesso</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => handleGenerateCode('prestador')}
              disabled={isGenerating}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <UserCog className="h-4 w-4 mr-2" />
              {isGenerating ? 'Gerando...' : 'Gerar Prestador'}
            </Button>
            <Button
              onClick={() => handleGenerateCode('specialist')}
              disabled={isGenerating}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <User className="h-4 w-4 mr-2" />
              {isGenerating ? 'Gerando...' : 'Gerar Profesional de Permanencia'}
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <Input
            placeholder="Pesquisar por código, email ou tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
      />
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
        ) : filteredCodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum código encontrado para "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-4 p-3 bg-gray-50 font-medium text-sm text-gray-600 border-b">
              <div>Código</div>
              <div>Tipo</div>
              <div>Usado Por</div>
              <div>Criado</div>
              <div>Ativado</div>
              <div>Estado</div>
              <div>Ações</div>
            </div>
            {filteredCodes.slice(0, 10).map((code) => (
              <div key={code.id} className="grid grid-cols-7 gap-4 p-3 hover:bg-gray-50 rounded transition-colors">
                <div className="font-mono text-sm">{code.invite_code}</div>
                <div className="text-sm">
                  {code.role === 'prestador' ? 'Prestador' : 'Profesional de Permanencia'}
                </div>
                <div className="text-sm">
                  {code.email ? (
                    <span className="font-medium text-purple-700">{code.email}</span>
                  ) : (
                    <span className="text-gray-400">Não usado</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(code.created_at).toLocaleDateString('pt-PT')}
                </div>
                <div className="text-sm text-gray-600">
                  {code.accepted_at ? new Date(code.accepted_at).toLocaleDateString('pt-PT') : 'Não ativado'}
                </div>
                <div>{getStatusBadge(code)}</div>
                <div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => handleDeleteCode(code, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsersManagement;
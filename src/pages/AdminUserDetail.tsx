import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Edit, 
  Power, 
  PowerOff,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Brain,
  Heart,
  DollarSign,
  Scale,
  User,
  Settings,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getUserById, generateMockUserDetail } from '@/data/adminMockData';
import { formatDate } from '@/utils/dateFormatting';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  company: string;
  department?: string;
  companySessions: number;
  personalSessions: number;
  usedCompanySessions: number;
  usedPersonalSessions: number;
  status: 'active' | 'inactive';
  createdAt: string;
  fixedProviders: {
    mentalHealth?: { name: string; id: string; };
    physicalWellness?: { name: string; id: string; };
    financialAssistance?: { name: string; id: string; };
    legalAssistance?: { name: string; id: string; };
  };
  changeRequests: Array<{
    id: string;
    pillar: string;
    currentProvider: string;
    requestedProvider: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }>;
  sessionHistory: Array<{
    id: string;
    date: string;
    pillar: string;
    provider: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    type: 'company' | 'personal';
  }>;
  sessionUsageData: Array<{
    month: string;
    company: number;
    personal: number;
  }>;
}

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    if (!id) return;
    setIsLoading(true);
    
    try {
      // Load profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Load company employee record
      const { data: employee, error: employeeError } = await supabase
        .from('company_employees')
        .select(`
          *,
          companies:company_id (name)
        `)
        .eq('user_id', id)
        .maybeSingle();

      if (employeeError) throw employeeError;

      // Load bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          prestadores:prestador_id (
            profiles:user_id (name)
          )
        `)
        .eq('user_id', id)
        .order('date', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Load progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', id)
        .order('action_date', { ascending: false });

      if (progressError) throw progressError;

      setUser({
        ...profile,
        company: employee?.companies?.name,
        sessionsAllocated: employee?.sessions_allocated || 0,
        sessionsUsed: employee?.sessions_used || 0,
        companySessions: employee?.sessions_allocated || 0,
        personalSessions: 0,
        usedCompanySessions: employee?.sessions_used || 0,
        usedPersonalSessions: 0,
        status: profile.is_active ? 'active' : 'inactive',
        createdAt: profile.created_at,
        fixedProviders: {},
        changeRequests: [],
        sessionHistory: bookings?.map(b => ({
          id: b.id,
          date: b.date,
          pillar: b.pillar,
          provider: b.prestadores?.profiles?.name || '',
          status: b.status as any,
          type: 'company' as const
        })) || [],
        sessionUsageData: []
      });
    } catch (error) {
      console.error('Error loading user details:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar detalhes do utilizador',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (!user || !id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus === 'active' })
        .eq('id', id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: newStatus === 'active' ? "Utilizador ativado" : "Utilizador suspenso",
        description: "Estado atualizado com sucesso"
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar estado",
        variant: "destructive"
      });
    }
  };

  const handleChangeRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    if (!user) return;
    
    try {
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          changeRequests: prev.changeRequests.map(req => 
            req.id === requestId 
              ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' as const }
              : req
          )
        };
      });
      
      toast({
        title: action === 'approve' ? "Pedido aprovado" : "Pedido rejeitado",
        description: "Ação processada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar pedido",
        variant: "destructive"
      });
    }
  };

  const handleEditProfile = () => {
    toast({
      title: "Editar Perfil",
      description: "Funcionalidade em desenvolvimento"
    });
  };

  const getStatusBadge = (status: string) => {
    const statusLabels: Record<string, string> = {
      active: 'Ativo',
      inactive: 'Inativo',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      pending: 'Pendente',
      completed: 'Concluído',
      scheduled: 'Agendado',
      cancelled: 'Cancelado',
      'no-show': 'Falta'
    };
    
    return <Badge variant={
      status === 'active' || status === 'approved' || status === 'completed' ? 'default' :
      status === 'inactive' || status === 'cancelled' ? 'secondary' :
      status === 'rejected' ? 'destructive' : 'outline'
    } className={
      status === 'active' || status === 'approved' || status === 'completed' ? 'bg-green-100 text-green-800' :
      status === 'pending' ? 'text-amber-600 border-amber-300' : ''
    }>
      {statusLabels[status] || status}
    </Badge>;
  };

  const pillarIcons = {
    'Saúde Mental': Brain,
    'Bem-Estar Físico': Heart,
    'Assistência Financeira': DollarSign,
    'Assistência Jurídica': Scale
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto space-y-8 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="lg:col-span-2 h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <Button variant="ghost" onClick={() => navigate('/admin/usuarios')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Utilizador não encontrado</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/usuarios')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge variant="outline">{user.company}</Badge>
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEditProfile}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
            <Button
              variant={user.status === 'active' ? 'destructive' : 'default'}
              onClick={() => handleStatusChange(user.status === 'active' ? 'inactive' : 'active')}
            >
              {user.status === 'active' ? (
                <>
                  <PowerOff className="h-4 w-4 mr-2" />
                  Suspender
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  Ativar
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="sessions">Sessões</TabsTrigger>
            <TabsTrigger value="providers">Prestadores</TabsTrigger>
            <TabsTrigger value="requests">Pedidos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados Básicos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nome Completo</Label>
                    <Input value={user.name} readOnly className="mt-1" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user.email} readOnly className="mt-1" />
                  </div>
                  <div>
                    <Label>Empresa</Label>
                    <Input value={user.company} readOnly className="mt-1" />
                  </div>
                  {user.department && (
                    <div>
                      <Label>Departamento</Label>
                      <Input value={user.department} readOnly className="mt-1" />
                    </div>
                  )}
                  <div>
                    <Label>Criado em</Label>
                    <Input value={formatDate(user.createdAt)} readOnly className="mt-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Ações Administrativas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ajustar Sessões da Empresa</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          type="number" 
                          value={user.companySessions} 
                          className="flex-1"
                        />
                        <Button size="sm">
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Ajustar Sessões Pessoais</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          type="number" 
                          value={user.personalSessions} 
                          className="flex-1"
                        />
                        <Button size="sm">
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Personificar Utilizador
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Sessões da Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Utilizadas</span>
                        <span className="font-medium">{user.usedCompanySessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Disponíveis</span>
                        <span className="font-medium">{user.companySessions - user.usedCompanySessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total</span>
                        <span className="font-medium">{user.companySessions}</span>
                      </div>
                      <Progress 
                        value={(user.usedCompanySessions / user.companySessions) * 100} 
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Sessões Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Utilizadas</span>
                        <span className="font-medium">{user.usedPersonalSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Disponíveis</span>
                        <span className="font-medium">{user.personalSessions - user.usedPersonalSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total</span>
                        <span className="font-medium">{user.personalSessions}</span>
                      </div>
                      <Progress 
                        value={(user.usedPersonalSessions / user.personalSessions) * 100} 
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Linha Temporal de Utilização</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={user.sessionUsageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="company" fill="hsl(var(--primary))" name="Empresa" />
                      <Bar dataKey="personal" fill="hsl(var(--secondary))" name="Pessoal" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries({
                'Saúde Mental': user.fixedProviders.mentalHealth,
                'Bem-Estar Físico': user.fixedProviders.physicalWellness,
                'Assistência Financeira': user.fixedProviders.financialAssistance,
                'Assistência Jurídica': user.fixedProviders.legalAssistance
              }).map(([pillar, provider]) => {
                const Icon = pillarIcons[pillar as keyof typeof pillarIcons];
                const hasChangeRequest = user.changeRequests.some(req => 
                  req.pillar === pillar && req.status === 'pending'
                );
                
                return (
                  <Card key={pillar}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {pillar}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm text-muted-foreground">Prestador Atual</Label>
                          <p className="font-medium">{provider?.name || 'Nenhum atribuído'}</p>
                        </div>
                        {hasChangeRequest && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              <Clock className="h-3 w-3 mr-1" />
                              Pedido de mudança pendente
                            </Badge>
                          </div>
                        )}
                        <Button variant="outline" size="sm" className="w-full">
                          Atribuir Prestador
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos de Mudança</CardTitle>
              </CardHeader>
              <CardContent>
                {user.changeRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Sem pedidos de mudança
                  </p>
                ) : (
                  <div className="space-y-4">
                    {user.changeRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{request.pillar}</h4>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Prestador Atual: <span className="font-medium">{request.currentProvider}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Prestador Solicitado: <span className="font-medium">{request.requestedProvider}</span>
                            </p>
                            <p className="text-sm">
                              <strong>Motivo:</strong> {request.reason}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Criado em {formatDate(request.createdAt)}
                            </p>
                          </div>
                          
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleChangeRequestAction(request.id, 'approve')}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleChangeRequestAction(request.id, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Sessões</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Pilar</TableHead>
                      <TableHead>Prestador</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.sessionHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Sem histórico de sessões
                        </TableCell>
                      </TableRow>
                    ) : (
                      user.sessionHistory.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            {formatDate(session.date)}
                          </TableCell>
                          <TableCell>{session.pillar}</TableCell>
                          <TableCell>{session.provider}</TableCell>
                          <TableCell>
                            <Badge variant={session.type === 'company' ? 'default' : 'secondary'}>
                              {session.type === 'company' ? 'Empresa' : 'Pessoal'}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(session.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminUserDetail;

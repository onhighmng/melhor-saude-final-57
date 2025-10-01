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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ArrowLeft, 
  Edit, 
  Power, 
  PowerOff,
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
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  BookOpen
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getProviderById, generateMockProviderDetail } from '@/data/adminMockData';

interface ProviderDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  pillars: ('mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance')[];
  availability: 'active' | 'inactive';
  licenseStatus: 'valid' | 'expired' | 'pending';
  licenseNumber?: string;
  licenseExpiry?: string;
  capacity: number;
  defaultSlot: number;
  languages: string[];
  location?: string;
  website?: string;
  specialties: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  experience: number; // years
  rating: number;
  totalSessions: number;
  completedSessions: number;
  upcomingBookings: Array<{
    id: string;
    date: string;
    time: string;
    patient: string;
    pillar: string;
    status: 'scheduled' | 'confirmed';
  }>;
  sessionHistory: Array<{
    id: string;
    date: string;
    patient: string;
    pillar: string;
    duration: number;
    status: 'completed' | 'cancelled' | 'no-show';
  }>;
  monthlyStats: Array<{
    month: string;
    sessions: number;
    revenue: number;
  }>;
}

const AdminProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  const mockProvider: ProviderDetail = {
    id: '1',
    name: 'Dra. Maria Santos',
    email: 'maria.santos@clinic.pt',
    phone: '+351 912 345 678',
    avatar: '',
    bio: 'Psicóloga clínica com mais de 10 anos de experiência em terapia cognitivo-comportamental e tratamento de ansiedade e depressão.',
    pillars: ['mental-health', 'physical-wellness'],
    availability: 'active',
    licenseStatus: 'valid',
    licenseNumber: 'OP12345',
    licenseExpiry: '2025-12-31',
    capacity: 20,
    defaultSlot: 50,
    languages: ['PT', 'EN', 'ES'],
    location: 'Lisboa, Portugal',
    website: 'https://drmariasantos.pt',
    specialties: ['Ansiedade', 'Depressão', 'Terapia de Casal', 'Mindfulness'],
    education: [
      { degree: 'Mestrado em Psicologia Clínica', institution: 'Universidade de Lisboa', year: '2012' },
      { degree: 'Licenciatura em Psicologia', institution: 'Universidade do Porto', year: '2010' }
    ],
    experience: 12,
    rating: 4.8,
    totalSessions: 1250,
    completedSessions: 1180,
    upcomingBookings: [
      { id: '1', date: '2024-03-20', time: '10:00', patient: 'João S.', pillar: 'mental-health', status: 'confirmed' },
      { id: '2', date: '2024-03-20', time: '14:30', patient: 'Maria O.', pillar: 'physical-wellness', status: 'scheduled' },
      { id: '3', date: '2024-03-21', time: '09:00', patient: 'Carlos R.', pillar: 'mental-health', status: 'confirmed' }
    ],
    sessionHistory: [
      { id: '1', date: '2024-03-15', patient: 'Ana P.', pillar: 'mental-health', duration: 50, status: 'completed' },
      { id: '2', date: '2024-03-14', patient: 'Pedro M.', pillar: 'physical-wellness', duration: 45, status: 'completed' },
      { id: '3', date: '2024-03-13', patient: 'Sofia L.', pillar: 'mental-health', duration: 50, status: 'no-show' }
    ],
    monthlyStats: [
      { month: 'Jan', sessions: 85, revenue: 4250 },
      { month: 'Fev', sessions: 92, revenue: 4600 },
      { month: 'Mar', sessions: 78, revenue: 3900 }
    ]
  };

  useEffect(() => {
    loadProvider();
  }, [id]);

  const loadProvider = async () => {
    setIsLoading(true);
    try {
      // Fetch provider from centralized mock data
      setTimeout(() => {
        const baseProvider = getProviderById(id || '1');
        
        if (baseProvider) {
          const providerDetail = generateMockProviderDetail(baseProvider);
          setProvider(providerDetail as ProviderDetail);
        }
        
        setIsLoading(false);
      }, 800);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do prestador",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (!provider) return;
    
    try {
      // Replace with actual API call
      setProvider(prev => prev ? { ...prev, availability: newStatus } : null);
      
      toast({
        title: newStatus === 'active' ? "Prestador ativado" : "Prestador desativado",
        description: "Status atualizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do prestador",
        variant: "destructive"
      });
    }
  };

  const handleEdit = () => {
    toast({
      title: "Editar Prestador",
      description: "Funcionalidade de edição será implementada em breve."
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Inativo</Badge>;
      case 'valid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Válida</Badge>;
      case 'expired':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Expirada</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Pendente</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Confirmada</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Agendada</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Cancelada</Badge>;
      case 'no-show':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Falta</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'mental-health':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'physical-wellness':
        return <Heart className="h-4 w-4 text-red-600" />;
      case 'financial-assistance':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'legal-assistance':
        return <Scale className="h-4 w-4 text-purple-600" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 h-96 bg-muted rounded-lg"></div>
            <div className="lg:col-span-2 h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/prestadores')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Prestadores
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">Prestador não encontrado</h2>
              <p className="text-muted-foreground">O prestador solicitado não existe ou foi removido.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const completionRate = provider.totalSessions > 0 ? (provider.completedSessions / provider.totalSessions) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/prestadores')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Prestadores
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{provider.name}</h1>
              <p className="text-sm text-muted-foreground">Detalhes do prestador</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              variant={provider.availability === 'active' ? "destructive" : "default"}
              onClick={() => handleStatusChange(provider.availability === 'active' ? 'inactive' : 'active')}
            >
              {provider.availability === 'active' ? (
                <>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Desativar
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Ativar
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        {/* Provider Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={provider.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {provider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{provider.name}</h2>
                  <p className="text-lg text-muted-foreground">{provider.email}</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {getStatusBadge(provider.availability)}
                  {getStatusBadge(provider.licenseStatus)}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{provider.rating}</span>
                  </div>
                  <Badge variant="outline">{provider.experience} anos de experiência</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {provider.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.phone}</span>
                    </div>
                  )}
                  {provider.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.location}</span>
                    </div>
                  )}
                  {provider.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="sessions">Sessões</TabsTrigger>
            <TabsTrigger value="schedule">Agendamentos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">{provider.email}</p>
                  </div>
                  {provider.phone && (
                    <div>
                      <Label>Telefone</Label>
                      <p className="text-sm text-muted-foreground">{provider.phone}</p>
                    </div>
                  )}
                  <div>
                    <Label>Idiomas</Label>
                    <div className="flex gap-1 mt-1">
                      {provider.languages.map(lang => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Biografia</Label>
                    <p className="text-sm text-muted-foreground mt-1">{provider.bio}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Qualificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Número de Licença</Label>
                    <p className="text-sm text-muted-foreground">{provider.licenseNumber}</p>
                  </div>
                  {provider.licenseExpiry && (
                    <div>
                      <Label>Validade da Licença</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(provider.licenseExpiry).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label>Especialidades</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {provider.specialties.map(specialty => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Formação Académica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {provider.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pillars */}
            <Card>
              <CardHeader>
                <CardTitle>Pilares Atendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.pillars.map(pillar => (
                    <div key={pillar} className="flex items-center gap-3 p-3 border rounded-lg">
                      {getPillarIcon(pillar)}
                      <span className="font-medium">{getPillarName(pillar)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total de Sessões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{provider.totalSessions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sessões Concluídas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{provider.completedSessions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Taxa de Conclusão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
                  <Progress value={completionRate} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Sessão</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Capacidade Semanal</Label>
                  <p className="text-sm text-muted-foreground">{provider.capacity} sessões por semana</p>
                </div>
                <div>
                  <Label>Duração Padrão</Label>
                  <p className="text-sm text-muted-foreground">{provider.defaultSlot} minutos</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Próximos Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Pilar</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {provider.upcomingBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{new Date(booking.date).toLocaleDateString('pt-PT')}</TableCell>
                        <TableCell>{booking.time}</TableCell>
                        <TableCell>{booking.patient}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPillarIcon(booking.pillar)}
                            <span>{getPillarName(booking.pillar)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
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
                      <TableHead>Paciente</TableHead>
                      <TableHead>Pilar</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {provider.sessionHistory.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{new Date(session.date).toLocaleDateString('pt-PT')}</TableCell>
                        <TableCell>{session.patient}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPillarIcon(session.pillar)}
                            <span>{getPillarName(session.pillar)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{session.duration} min</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Mensais</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={provider.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#3b82f6" name="Sessões" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminProviderDetail;
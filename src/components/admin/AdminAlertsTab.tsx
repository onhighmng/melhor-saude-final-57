import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter,
  Phone,
  Calendar,
  Users,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockCallRequests, mockEspecialistaSessions, mockAdminAlerts, mockNegativeFeedback, mockInactiveUsers } from '@/data/especialistaGeralMockData';
import { CallRequest } from '@/types/specialist';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';

const AdminAlertsTab = () => {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const { filterByCompanyAccess } = useCompanyFilter();
  const [activeTab, setActiveTab] = useState('calls');
  
  // Filter data by company access
  const filteredCallRequests = filterByCompanyAccess(mockCallRequests.filter(req => req.status === 'pending'));
  const filteredSessions = filterByCompanyAccess(mockEspecialistaSessions.filter(s => s.status === 'scheduled' && s.date === new Date().toISOString().split('T')[0]));
  const filteredNegativeFeedback = filterByCompanyAccess(mockNegativeFeedback);
  const filteredInactiveUsers = filterByCompanyAccess(mockInactiveUsers);

  const handleCallRequest = (request: CallRequest) => {
    toast({
      title: 'Ligação iniciada',
      description: `Ligando para ${request.user_phone}`,
    });
  };

  const handleMarkResolved = (requestId: string) => {
    toast({
      title: 'Pedido resolvido',
      description: 'O pedido foi marcado como resolvido.',
    });
  };

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime < 60) return 'text-green-600';
    if (waitTime < 240) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPillarLabel = (pillar: string | null) => {
    const labels = {
      'psychological': 'Saúde Mental',
      'physical': 'Bem-Estar Físico', 
      'financial': 'Assistência Financeira',
      'legal': 'Assistência Jurídica'
    };
    return labels[pillar as keyof typeof labels] || 'Não definido';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chamadas Pendentes</CardTitle>
            <Phone className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCallRequests.length}</div>
            <p className="text-xs text-muted-foreground">Aguardam ligação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSessions.length}</div>
            <p className="text-xs text-muted-foreground">Com Profissional de Permanencia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Negativo</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredNegativeFeedback.length}</div>
            <p className="text-xs text-muted-foreground">Avaliações ≤ 6/10</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilizadores Inativos</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInactiveUsers.length}</div>
            <p className="text-xs text-muted-foreground">Há +30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Chamadas ({filteredCallRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Sessões ({filteredSessions.length})
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback ({filteredNegativeFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Inativos ({filteredInactiveUsers.length})
          </TabsTrigger>
        </TabsList>

        {/* Call Requests Tab */}
        <TabsContent value="calls" className="space-y-4">
          {filteredCallRequests.length === 0 ? (
      <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Phone className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Não há chamadas pendentes no momento
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCallRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{request.user_name}</h3>
                        <Badge variant="outline">{request.company_name}</Badge>
                        <Badge variant="secondary">{getPillarLabel(request.pillar)}</Badge>
                        <div className={`text-sm font-medium ${getWaitTimeColor(request.wait_time)}`}>
                          <Clock className="inline h-4 w-4 mr-1" />
                          {Math.floor(request.wait_time / 60)}h {request.wait_time % 60}min
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <p><strong>Email:</strong> {request.user_email}</p>
                        <p><strong>Telefone:</strong> {request.user_phone}</p>
                        {request.notes && <p><strong>Notas:</strong> {request.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleCallRequest(request)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Ligar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMarkResolved(request.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolver
                      </Button>
            </div>
          </div>
        </CardContent>
      </Card>
            ))
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Não há sessões agendadas para hoje
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session) => (
              <Card key={session.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{session.user_name}</h3>
                        <Badge variant="outline">{session.company_name}</Badge>
                        <Badge variant="secondary">{getPillarLabel(session.pillar as any)}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <p><strong>Especialista:</strong> {session.specialist_name}</p>
                        <p><strong>Horário:</strong> {session.date} às {session.time}</p>
                        <p><strong>Tipo:</strong> {session.type}</p>
                        {session.notes && <p><strong>Notas:</strong> {session.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Negative Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          {filteredNegativeFeedback.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Não há feedback negativo recente
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNegativeFeedback.map((feedback) => (
              <Card key={feedback.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{feedback.user_name}</h3>
                        <Badge variant="outline">{feedback.company_name}</Badge>
                        <Badge variant="destructive">{feedback.rating}/10</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <p><strong>Prestador:</strong> {feedback.prestador_name}</p>
                        <p><strong>Data da sessão:</strong> {new Date(feedback.session_date).toLocaleDateString('pt-PT')}</p>
                        <p><strong>Feedback:</strong> {feedback.feedback}</p>
                  </div>
                </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Contactar
                  </Button>
                    </div>
              </div>
            </CardContent>
          </Card>
            ))
          )}
        </TabsContent>

        {/* Inactive Users Tab */}
        <TabsContent value="inactive" className="space-y-4">
          {filteredInactiveUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                  Não há utilizadores inativos
              </p>
            </CardContent>
          </Card>
          ) : (
            filteredInactiveUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge variant="outline">{user.company_name}</Badge>
                        <Badge variant="secondary">{user.pillar}</Badge>
                        <Badge variant="destructive">{user.days_inactive} dias</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Última atividade:</strong> {new Date(user.last_activity).toLocaleDateString('pt-PT')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Contactar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAlertsTab;
export { AdminAlertsTab };

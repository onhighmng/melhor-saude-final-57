import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building2, 
  Users, 
  Calendar, 
  Phone,
  MessageSquare,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { mockAdminAlerts } from '@/data/especialistaGeralMockData';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import recursosWellness from '@/assets/recursos-wellness.jpg';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { data: analytics } = useAnalytics();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('admin-page');
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  // Mock data para métricas
  const weeklyGrowth = 12; // % crescimento semanal
  const avgResponseTime = 35; // minutos
  const satisfactionRate = 91; // %

  return (
    <div className="h-screen flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold">Dashboard Geral</h1>
        <p className="text-muted-foreground">
          Visão geral da plataforma Melhor Saúde
        </p>
      </div>

      {/* Bento Grid */}
      <div className="flex-1 min-h-0">
        <BentoGrid className="h-full" style={{ gridAutoRows: '1fr' }}>
          {/* Empresas Ativas */}
          <BentoCard 
            name="Empresas Ativas" 
            description={`${analytics?.total_companies || 12} empresas na plataforma`} 
            Icon={Building2} 
            onClick={() => navigate('/admin/users-management?tab=companies')} 
            className="col-span-3 lg:col-span-1 row-span-1" 
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50" />
            }
            iconColor="text-cyan-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta="Gerir Empresas"
          >
            <div className="p-6 space-y-2 relative z-20">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-cyan-600">{analytics?.total_companies || 12}</span>
                <span className="text-lg text-muted-foreground mb-2">empresas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">+{weeklyGrowth}%</span>
                <span className="text-muted-foreground">vs mês anterior</span>
              </div>
            </div>
          </BentoCard>

          {/* Colaboradores */}
          <BentoCard 
            name="Colaboradores" 
            description={`${analytics?.total_users || 450} utilizadores registados`} 
            Icon={Users} 
            onClick={() => navigate('/admin/users-management?tab=employees')} 
            className="col-span-3 lg:col-span-1 row-span-1" 
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50" />
            }
            iconColor="text-yellow-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta="Ver Utilizadores"
          >
            <div className="p-6 space-y-2 relative z-20">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-yellow-600">{analytics?.total_users || 450}</span>
                <span className="text-lg text-muted-foreground mb-2">utilizadores</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  {satisfactionRate}% Satisfação
                </Badge>
              </div>
            </div>
          </BentoCard>

          {/* Sessões */}
          <BentoCard 
            name="Sessões Este Mês" 
            description={`${analytics?.total_bookings || 234} sessões realizadas`} 
            Icon={Calendar} 
            onClick={() => navigate('/admin/operations')} 
            className="col-span-3 lg:col-span-1 row-span-1" 
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50" />
            }
            iconColor="text-emerald-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta="Ver Operações"
          >
            <div className="p-6 space-y-2 relative z-20">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-emerald-600">{analytics?.total_bookings || 234}</span>
                <span className="text-lg text-muted-foreground mb-2">sessões</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600 font-medium">{avgResponseTime} min</span>
                <span className="text-muted-foreground">tempo médio</span>
              </div>
            </div>
          </BentoCard>

          {/* Alertas Críticos - 2 rows tall */}
          <BentoCard 
            name="Alertas Críticos" 
            description="Indicadores que precisam de ação imediata" 
            Icon={AlertTriangle}
            onClick={() => navigate('/admin/alerts')}
            className="col-span-3 lg:col-span-2 row-span-2" 
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50" />
            }
            iconColor="text-red-600"
            textColor="text-gray-900"
            descriptionColor="text-red-600"
            href="#"
            cta="Ver Todos os Alertas"
          >
            <div className="p-6 relative z-20 h-full flex flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-3 pr-4">
                  {/* Chamadas Pendentes */}
                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/admin/call-requests');
                    }}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Chamadas Pendentes</p>
                          <p className="text-xs text-muted-foreground">Requer ação imediata</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-red-600">{mockAdminAlerts.pending_calls}</p>
                        <p className="text-xs text-muted-foreground">casos</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sessões Hoje */}
                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/admin/operations');
                    }}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium">Sessões Hoje</p>
                          <p className="text-xs text-muted-foreground">Especialista Geral</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-indigo-600">{mockAdminAlerts.scheduled_sessions}</p>
                        <p className="text-xs text-muted-foreground">agendadas</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Feedback Negativo */}
                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/admin/alerts?tab=feedback');
                    }}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Feedback Negativo</p>
                          <p className="text-xs text-muted-foreground">Última semana</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-orange-600">{mockAdminAlerts.negative_feedback}</p>
                        <p className="text-xs text-muted-foreground">casos</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Utilizadores Inativos */}
                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/admin/alerts?tab=inactive');
                    }}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">Utilizadores Inativos</p>
                          <p className="text-xs text-muted-foreground">Mais de 30 dias</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-amber-600">{mockAdminAlerts.inactive_users}</p>
                        <p className="text-xs text-muted-foreground">utilizadores</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </div>
          </BentoCard>

          {/* Recursos - Image card */}
          <BentoCard 
            name="Recursos" 
            description="Conteúdos e materiais de apoio" 
            Icon={BookOpen} 
            onClick={() => navigate('/admin/resources')} 
            className="col-span-3 lg:col-span-1 row-span-2" 
            background={
              <div className="absolute inset-0">
                <img 
                  src={recursosWellness} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            }
            iconColor="text-white"
            textColor="text-white"
            descriptionColor="text-white/80"
            href="#"
            cta="Ver Recursos"
          >
            <div className="absolute bottom-0 left-0 right-0 p-6 relative z-20">
              <div className="space-y-2">
                <p className="text-sm text-white/80">Biblioteca completa</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    45 Artigos
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    12 Vídeos
                  </Badge>
                </div>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </div>
  );
};

export default AdminDashboard;

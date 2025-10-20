import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  Calendar, 
  Phone,
  MessageSquare,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { mockAdminAlerts } from '@/data/especialistaGeralMockData';
import { Progress } from '@/components/ui/progress';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { data: analytics } = useAnalytics();
  const navigate = useNavigate();



  return (
    <div className="space-y-4">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-vibrant-blue/10 via-accent-sky/10 to-emerald-green/10 rounded-lg p-4 border border-border">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Olá {profile?.name?.split(' ')[0] || 'Admin'}, bem-vindo de volta 👋
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da plataforma Melhor Saúde
        </p>
      </div>

      {/* Bento Grid Layout - PRD Content Only */}
      <div>
        <BentoGrid className="lg:grid-rows-2 gap-3" style={{ gridAutoRows: '100px' }}>
          {/* Top Left - Companies */}
          <BentoCard 
            name="Empresas Ativas" 
            description={`${analytics?.total_companies || 0} empresas ativas`} 
            Icon={Building2} 
            onClick={() => navigate('/admin/users-management?tab=companies')} 
            className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2" 
            background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />}
            iconColor="text-blue-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta="Gerir Empresas"
          >
            <div className="p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">{analytics?.total_companies || 0}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ativas:</span>
                  <span className="font-semibold">{analytics?.total_companies || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Onboarding:</span>
                  <span className="font-semibold text-orange-600">3</span>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Top Middle - Users */}
          <BentoCard 
            name="Colaboradores Registados" 
            description={`${analytics?.total_users || 0} utilizadores ativos`} 
            Icon={Users} 
            onClick={() => navigate('/admin/users-management?tab=employees')} 
            className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2" 
            background={<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100" />}
            iconColor="text-green-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta="Ver Utilizadores"
          >
            <div className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxa de Onboarding</span>
                  <span className="text-lg font-bold text-green-600">78%</span>
                </div>
                <Progress value={78} className="h-2" />
                <p className="text-xs text-muted-foreground">78% onboarding completo</p>
              </div>
            </div>
          </BentoCard>

          {/* Top Right - Sessions */}
          <BentoCard 
            name="Sessões Este Mês" 
            description={`${analytics?.total_bookings || 0} sessões realizadas`} 
            Icon={Calendar} 
            onClick={() => navigate('/admin/operations')} 
            className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2" 
            background={<div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100" />}
            iconColor="text-purple-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta="Ver Sessões"
          >
            <div className="p-4">
              <div className="text-3xl font-bold text-purple-600 mb-2">{analytics?.total_bookings || 0}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hoje:</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxa utilização:</span>
                  <span className="font-semibold text-green-600">78%</span>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Alerts - Span across full width */}
          <BentoCard 
            name="" 
            description="" 
            href="#" 
            cta="" 
            className="lg:col-start-1 lg:col-end-4 lg:row-start-2 lg:row-end-3" 
            background={<div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50" />}
          >
            <div className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Alertas Críticos</h3>
                </div>
                <div className="space-y-4">
                  <div 
                    className="flex items-center justify-between p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors"
                    onClick={() => navigate('/admin/call-requests')}
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Chamadas Pendentes</span>
                    </div>
                    <span className="text-xl font-bold text-orange-600">{mockAdminAlerts.pending_calls}</span>
                  </div>
                  <div 
                    className="flex items-center justify-between p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors"
                    onClick={() => navigate('/admin/alerts?tab=feedback')}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Feedback Negativo</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{mockAdminAlerts.negative_feedback}</span>
                  </div>
                  <div 
                    className="flex items-center justify-between p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors"
                    onClick={() => navigate('/admin/alerts?tab=inactive')}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">Utilizadores Inativos</span>
                    </div>
                    <span className="text-xl font-bold text-gray-600">{mockAdminAlerts.inactive_users}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/admin/alerts')}
                className="mt-4 text-sm text-primary hover:underline font-medium"
              >
                Ver Todos os Alertas →
              </button>
      </div>
          </BentoCard>

        </BentoGrid>
      </div>
    </div>
  );
};

export default AdminDashboard;

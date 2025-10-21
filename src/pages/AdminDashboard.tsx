import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
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

  useEffect(() => {
    // Add admin-page class to body for gray background
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);



  return (
    <div className="relative w-full min-h-screen h-full flex flex-col">
      <div className="relative z-10 h-full flex flex-col">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4 h-full flex flex-col min-h-0">
          {/* Page Header - Like other admin pages */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard Geral
        </h1>
        <p className="text-muted-foreground">
              Visão geral da plataforma Melhor Saúde
        </p>
      </div>

          {/* Bento Grid Layout - Fixed height */}
          <div className="h-[calc(100vh-200px)]">
            <BentoGrid className="h-full grid-rows-3 gap-4">
          {/* Top Left - Companies */}
          <BentoCard 
            name="Empresas Ativas" 
            description={`${analytics?.total_companies || 0} empresas ativas`} 
            Icon={Building2} 
            onClick={() => navigate('/admin/users-management?tab=companies')} 
            className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2" 
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-cyan-100">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
                  }}
                />
              </div>
            }
            iconColor="text-cyan-700"
            textColor="text-slate-900"
            descriptionColor="text-slate-600"
            href="#"
            cta="Gerir Empresas"
          >
          </BentoCard>

          {/* Top Right - Users */}
          <BentoCard 
            name="Colaboradores Registados" 
            description={`${analytics?.total_users || 0} utilizadores ativos`} 
            Icon={Users} 
            onClick={() => navigate('/admin/users-management?tab=employees')} 
            className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2" 
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
                  }}
                />
              </div>
            }
            iconColor="text-yellow-700"
            textColor="text-slate-900"
            descriptionColor="text-slate-600"
            href="#"
            cta="Ver Utilizadores"
          >
          </BentoCard>

          {/* Bottom Left - Sessions */}
          <BentoCard 
            name="Sessões Este Mês" 
            description={`${analytics?.total_bookings || 0} sessões realizadas`} 
            Icon={Calendar} 
            onClick={() => navigate('/admin/operations')} 
            className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4" 
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
                  }}
                />
              </div>
            }
            iconColor="text-emerald-700"
            textColor="text-slate-900"
            descriptionColor="text-slate-600"
            href="#"
            cta="Ver Sessões"
          >
          </BentoCard>

          {/* Bottom Right - Utilization Rate */}
          <BentoCard 
            name="Taxa de Utilização" 
            description="Eficiência da plataforma" 
            Icon={Activity} 
            onClick={() => navigate('/admin/operations')} 
            className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4" 
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
                  }}
                />
              </div>
            }
            iconColor="text-slate-700"
            textColor="text-slate-900"
            descriptionColor="text-slate-600"
            href="#"
            cta="Ver Detalhes"
          >
          </BentoCard>

          {/* Center - Alerts */}
          <BentoCard 
            name="" 
            description="" 
            href="#" 
            cta="" 
            className="lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3" 
            background={<div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-200" />}
            iconColor="text-red-800"
            textColor="text-slate-900"
            descriptionColor="text-slate-600"
            onClick={() => navigate('/admin/alerts')}
          >
            <div className="relative z-30 flex flex-col h-full p-6">
              <div className="mb-4">
                <h3 className="text-3xl font-semibold text-gray-900 mb-2">Alertas Críticos</h3>
                <p className="text-gray-600">Indicadores que precisam de ação imediata</p>
                </div>
                
              <div className="flex-1 space-y-3">
                  <div 
                    className="flex items-center justify-between p-3 bg-white/70 rounded-lg cursor-pointer hover:bg-white/90 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/admin/call-requests');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Chamadas Pendentes</span>
                    </div>
                    <span className="text-xl font-bold text-red-700">{mockAdminAlerts.pending_calls}</span>
                  </div>
                
                <div 
                  className="flex items-center justify-between p-3 bg-white/70 rounded-lg cursor-pointer hover:bg-white/90 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/admin/alerts?tab=feedback');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Feedback Negativo</span>
                  </div>
                  <span className="text-xl font-bold text-orange-700">{mockAdminAlerts.negative_feedback}</span>
                  </div>
                
                <div 
                  className="flex items-center justify-between p-3 bg-white/70 rounded-lg cursor-pointer hover:bg-white/90 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/admin/alerts?tab=inactive');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-amber-600" />
                    <span className="font-medium">Utilizadores Inativos</span>
              </div>
                  <span className="text-xl font-bold text-amber-700">{mockAdminAlerts.inactive_users}</span>
      </div>

                <div 
                  className="flex items-center justify-between p-3 bg-white/70 rounded-lg cursor-pointer hover:bg-white/90 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/admin/operations');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium">Sessões com Especialista Geral</span>
                  </div>
                  <span className="text-xl font-bold text-indigo-700">3</span>
              </div>
      </div>

              <div className="mt-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/admin/alerts');
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
                >
                  Ver Todos os Alertas →
                </button>
              </div>
            </div>
          </BentoCard>

            </BentoGrid>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

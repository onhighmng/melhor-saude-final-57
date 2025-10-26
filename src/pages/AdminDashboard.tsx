import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  Calendar, 
  Activity,
  BookOpen
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import recursosWellness from '@/assets/recursos-wellness.jpg';
import { supabase } from '@/integrations/supabase/client';

interface ActivityMetrics {
  utilizationRate: number;
  activePrestadores: number;
  avgSatisfaction: string;
}

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { data: analytics } = useAnalytics();
  const navigate = useNavigate();
  const [activityMetrics, setActivityMetrics] = useState<ActivityMetrics>({
    utilizationRate: 0,
    activePrestadores: 0,
    avgSatisfaction: '0.0'
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    // Add admin-page class to body for gray background
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  useEffect(() => {
    loadActivityMetrics();
  }, []);

  const loadActivityMetrics = async () => {
    try {
      // Get utilization rate (type will regenerate after migration)
      const { data: utilData, error: utilError } = await (supabase.rpc as any)('get_platform_utilization');

      // Get active prestadores count
      const prestadoresResult = await supabase
        .from('prestadores')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_approved', true);
      
      const activePrestadoresCount = (prestadoresResult as any)?.count || 0;

      // Get average satisfaction
      const { data: ratings } = await supabase
        .from('bookings')
        .select('rating')
        .not('rating', 'is', null);

      const avgRating = ratings && ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length).toFixed(1)
        : '0.0';

      setActivityMetrics({
        utilizationRate: utilData?.[0]?.utilization_rate || 0,
        activePrestadores: activePrestadoresCount,
        avgSatisfaction: avgRating
      });
    } catch (error) {
      console.error('Error loading activity metrics:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };



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
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />
            }
            iconColor="text-blue-700"
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
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100" />
            }
            iconColor="text-yellow-700"
            textColor="text-slate-900"
            descriptionColor="text-slate-600"
            href="#"
            cta="Ver Utilizadores"
          >
          </BentoCard>

          {/* Center - Activity Overview (spanning all 3 rows) */}
          <BentoCard 
            name="" 
            description="" 
            href="#"
            cta=""
            className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-4" 
            background={
              <div className="absolute inset-0 flex flex-col p-8 bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-semibold">Atividade da Plataforma</h3>
                </div>
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    <div className="p-5 bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 hover:bg-gray-200 hover:shadow-md hover:scale-[1.02] cursor-pointer">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-base font-medium text-gray-700">Taxa de Utilização</span>
                        <span className="text-2xl font-bold text-purple-700">{loadingMetrics ? '...' : `${Math.round(activityMetrics.utilizationRate)}%`}</span>
                      </div>
                      <Progress value={loadingMetrics ? 0 : activityMetrics.utilizationRate} className="h-3" />
                    </div>
                    
                    <div className="p-5 bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 hover:bg-gray-200 hover:shadow-md hover:scale-[1.02] cursor-pointer">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-base font-medium text-gray-700">Prestadores Ativos</span>
                        <span className="text-2xl font-bold text-purple-700">{loadingMetrics ? '...' : activityMetrics.activePrestadores}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">A fornecer serviços</p>
                    </div>

                    <div className="p-5 bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 hover:bg-gray-200 hover:shadow-md hover:scale-[1.02] cursor-pointer">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-base font-medium text-gray-700">Satisfação Média</span>
                        <span className="text-2xl font-bold text-purple-700">{loadingMetrics ? '...' : `${activityMetrics.avgSatisfaction}/10`}</span>
                      </div>
                      <Progress value={loadingMetrics ? 0 : parseFloat(activityMetrics.avgSatisfaction) * 10} className="h-3" />
                    </div>
                  </div>
                </div>
              </div>
            }
          />

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

          {/* Bottom Right - Recursos */}
          <BentoCard 
            name="Recursos" 
            description="Conteúdos e materiais de apoio" 
            Icon={BookOpen} 
            onClick={() => navigate('/admin/resources')} 
            className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4" 
            background={
              <div className="absolute inset-0">
                <img 
                  src={recursosWellness} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              </div>
            }
            iconColor="text-white"
            textColor="text-white"
            descriptionColor="text-white/80"
            href="#"
            cta="Ver Recursos"
          >
          </BentoCard>


            </BentoGrid>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

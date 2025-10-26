import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  Calendar, 
  UserCheck,
  UserX,
  Star,
  Activity,
  Brain,
  Heart,
  DollarSign,
  Scale,
  BookOpen
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import recursosWellness from '@/assets/recursos-wellness.jpg';
import { supabase } from '@/integrations/supabase/client';

const CompanyDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      try {
        // Load company
        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();

        if (!company) return;

        // Load employees
        const { data: employees } = await supabase
          .from('company_employees')
          .select(`
            *,
            profiles (name, email, avatar_url)
          `)
          .eq('company_id', profile.company_id);

        // Load bookings for stats
        const { data: bookings } = await supabase
          .from('bookings')
          .select('pillar, status, rating')
          .eq('company_id', profile.company_id);

        // Calculate metrics
        const activeEmployees = employees?.filter(e => e.status === 'active').length || 0;
        const usedSessions = bookings?.filter(b => b.status === 'completed').length || 0;
        const totalSessions = company.sessions_allocated || 0;
        const avgRating = bookings?.filter(b => b.rating)
          .reduce((sum, b) => sum + (b.rating || 0), 0) / bookings.filter(b => b.rating).length || 0;

        // Count bookings by pillar
        const pillarCounts = bookings?.reduce((acc: any, b: any) => {
          acc[b.pillar] = (acc[b.pillar] || 0) + 1;
          return acc;
        }, {}) || {};

        const mostUsedPillar = Object.entries(pillarCounts).reduce((a, b) => 
          (pillarCounts[a[0] as keyof typeof pillarCounts] || 0) > (pillarCounts[b[0] as keyof typeof pillarCounts] || 0) ? a : b, 
          ['', 0])[0];

        setMetrics({
          avgSatisfaction: avgRating.toFixed(1),
          activeEmployees,
          totalEmployees: employees?.length || 0,
          sessionsUsed: usedSessions,
          sessionsAllocated: totalSessions,
          mostUsedPillar: mostUsedPillar || 'Saúde Mental'
        });
      } catch (error: any) {
        console.error('Error loading company data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [profile?.company_id]);

  useEffect(() => {
    // Add company-page class to body for light blue background
    document.body.classList.add('company-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('company-page');
    };
  }, []);

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return Brain;
      case 'Bem-Estar Físico':
        return Heart;
      case 'Assistência Financeira':
        return DollarSign;
      case 'Assistência Jurídica':
        return Scale;
      default:
        return Activity;
    }
  };

  const PillarIcon = getPillarIcon(metrics?.mostUsedPillar || 'Saúde Mental');

  return (
    <div className="relative w-full min-h-screen h-full flex flex-col">
      <div className="relative z-10 h-full flex flex-col">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4 h-full flex flex-col min-h-0">
          {/* Page Header */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Dashboard da Empresa
            </h1>
            <p className="text-muted-foreground text-lg">
              Visão geral do programa de bem-estar e utilização dos serviços
            </p>
          </div>
          
          {/* Bento Grid Layout - Similar to User & Admin Dashboards */}
          <div className="h-[calc(100vh-200px)]">
            <BentoGrid className="h-full grid-rows-3 gap-4">
              {/* Top Left - Satisfaction */}
              <BentoCard 
                name="Satisfação Média" 
                description={`${metrics?.avgSatisfaction || 0}/10 - Avaliação dos colaboradores`}
                Icon={Star} 
                onClick={() => navigate('/company/relatorios')} 
                className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2" 
                background={
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100" />
                }
                iconColor="text-amber-700"
                textColor="text-slate-900"
                descriptionColor="text-slate-600"
                href="#"
                cta="Ver Relatórios"
              />

              {/* Top Right - Sessions */}
              <BentoCard 
                name="Sessões Este Mês" 
                description={`${mockCompanyMetrics.usedSessions} de ${mockCompanyMetrics.contractedSessions} utilizadas`}
                Icon={Calendar} 
                onClick={() => navigate('/company/sessions')} 
                className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2" 
                background={
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />
                }
                iconColor="text-blue-700"
                textColor="text-slate-900"
                descriptionColor="text-slate-600"
                href="#"
                cta="Ver Sessões"
              />

              {/* Bottom Left - Employee Registration Status */}
              <BentoCard 
                name="Estado de Registo" 
                description={`${mockCompanyMetrics.registeredEmployees} registados, ${mockCompanyMetrics.unregisteredEmployees} pendentes`}
                Icon={Users} 
                onClick={() => navigate('/company/colaboradores')} 
                className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4" 
                background={
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100">
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
                      style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
                      }}
                    />
                  </div>
                }
                iconColor="text-purple-700"
                textColor="text-slate-900"
                descriptionColor="text-slate-600"
                href="#"
                cta="Ver Detalhes"
              />

              {/* Bottom Right - Recursos */}
              <BentoCard 
                name="Recursos" 
                description="Conteúdos e materiais de apoio" 
                Icon={BookOpen} 
                onClick={() => navigate('/company/recursos')} 
                className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4" 
                background={
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${recursosWellness})` }}
                  />
                }
                iconColor="text-white"
                textColor="text-white"
                descriptionColor="text-white"
                href="#"
                cta="Ver Recursos"
              />

              {/* Center - Activity & Pillar Overview */}
              <BentoCard 
                name="" 
                description="" 
                href="#" 
                cta="" 
                className="lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3" 
                background={<div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />}
                onClick={() => navigate('/company/relatorios')}
              >
                <div className="relative z-30 flex flex-col h-full p-6">
                  <div className="mb-4">
                    <h3 className="text-3xl font-semibold text-gray-900 mb-2">Visão Geral de Utilização</h3>
                    <p className="text-gray-600">Principais métricas de envolvimento dos colaboradores</p>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    {/* Active vs Inactive */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-purple-700" />
                          <span className="font-semibold text-gray-900">Atividade dos Colaboradores</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-green-600" />
                            <span className="text-gray-700">Ativos</span>
                          </div>
                          <span className="font-mono text-xl font-semibold text-green-700">{mockCompanyMetrics.activePercentage}%</span>
                        </div>
                        <Progress value={mockCompanyMetrics.activePercentage} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <UserX className="h-4 w-4 text-red-600" />
                            <span className="text-gray-700">Inativos</span>
                          </div>
                          <span className="font-bold text-red-700">{mockCompanyMetrics.inactivePercentage}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Most Used Pillar */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <PillarIcon className="h-5 w-5 text-purple-700" />
                          <span className="font-semibold text-gray-900">Pilar Mais Utilizado</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium text-gray-900">{mockCompanyMetrics.mostUsedPillar}</span>
                          <span className="font-mono text-xl font-semibold text-purple-700">42%</span>
                        </div>
                        <Progress value={42} className="h-2" />
                        <p className="text-sm text-gray-600">das sessões totais</p>
                      </div>
                    </div>

                    {/* Session Usage */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-purple-700" />
                          <span className="font-semibold text-gray-900">Taxa de Utilização</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Sessões utilizadas este mês</span>
                          <span className="font-mono text-xl font-semibold text-purple-700">
                            {Math.round((mockCompanyMetrics.usedSessions / mockCompanyMetrics.contractedSessions) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(mockCompanyMetrics.usedSessions / mockCompanyMetrics.contractedSessions) * 100} 
                          className="h-2" 
                        />
                        <p className="text-sm text-gray-600">
                          {mockCompanyMetrics.usedSessions} de {mockCompanyMetrics.contractedSessions} sessões
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/company/relatorios');
                      }}
                      className="text-sm text-purple-700 hover:text-purple-800 font-medium hover:underline"
                    >
                      Ver Relatórios Completos →
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

export default CompanyDashboard;
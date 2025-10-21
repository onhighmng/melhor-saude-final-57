import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
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
  Scale
} from 'lucide-react';
import { mockCompanyMetrics } from '@/data/companyMetrics';
import { Progress } from '@/components/ui/progress';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

const CompanyDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Add admin-page class to body for gray background
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
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

  const PillarIcon = getPillarIcon(mockCompanyMetrics.mostUsedPillar);

  return (
    <div className="relative w-full min-h-screen h-full flex flex-col">
      <div className="relative z-10 h-full flex flex-col">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4 h-full flex flex-col min-h-0">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard da Empresa
            </h1>
            <p className="text-muted-foreground">
              Visão geral do programa de bem-estar e utilização dos serviços
            </p>
          </div>
          
          {/* Bento Grid Layout - Fixed height */}
          <div className="h-[calc(100vh-200px)]">
            <BentoGrid className="h-full grid-rows-3 gap-4">
              {/* Top Left - Total Employees */}
              <BentoCard 
                name="Total de Colaboradores" 
                description={`${mockCompanyMetrics.totalEmployeesInPlan} incluídos no plano`} 
                Icon={Building2} 
                onClick={() => navigate('/company/colaboradores')} 
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
                cta="Gerir Colaboradores"
              />

              {/* Top Right - Sessions Usage */}
              <BentoCard 
                name="Sessões Contratadas vs Utilizadas" 
                description={`${mockCompanyMetrics.usedSessions} de ${mockCompanyMetrics.contractedSessions} este mês`} 
                Icon={Calendar} 
                onClick={() => navigate('/company/sessions')} 
                className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2" 
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
              />

              {/* Bottom Left - Most Used Pillar */}
              <BentoCard 
                name="Pilar Mais Utilizado" 
                description={`${mockCompanyMetrics.mostUsedPillar} - 42% das sessões`} 
                Icon={PillarIcon} 
                onClick={() => navigate('/company/relatorios')} 
                className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4" 
                background={
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100">
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
                      style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
                      }}
                    />
                  </div>
                }
                iconColor="text-purple-700"
                textColor="text-slate-900"
                descriptionColor="text-slate-600"
                href="#"
                cta="Ver Relatórios"
              />

              {/* Bottom Right - Satisfaction Rating */}
              <BentoCard 
                name="Satisfação Média" 
                description={`${mockCompanyMetrics.avgSatisfaction}/10 - Avaliação dos colaboradores`} 
                Icon={Star} 
                onClick={() => navigate('/company/relatorios')} 
                className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4" 
                background={
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100">
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
                      style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
                      }}
                    />
                  </div>
                }
                iconColor="text-amber-700"
                textColor="text-slate-900"
                descriptionColor="text-slate-600"
                href="#"
                cta="Ver Relatórios"
              />

              {/* Center - Activity Overview */}
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
                onClick={() => navigate('/company/colaboradores')}
              >
                <div className="relative z-30 flex flex-col h-full p-6">
                  <div className="mb-4">
                    <h3 className="text-3xl font-semibold text-gray-900 mb-2">Atividade dos Colaboradores</h3>
                    <p className="text-gray-600">Distribuição entre colaboradores ativos e inativos</p>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div 
                      className="flex items-center justify-between p-3 bg-white/70 rounded-lg cursor-pointer hover:bg-white/90 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/company/colaboradores');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Colaboradores Ativos</span>
                      </div>
                      <span className="text-xl font-bold text-green-700">{mockCompanyMetrics.activePercentage}%</span>
                    </div>
                    
                    <div 
                      className="flex items-center justify-between p-3 bg-white/70 rounded-lg cursor-pointer hover:bg-white/90 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/company/colaboradores');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <UserX className="h-5 w-5 text-red-600" />
                        <span className="font-medium">Colaboradores Inativos</span>
                      </div>
                      <span className="text-xl font-bold text-red-700">{mockCompanyMetrics.inactivePercentage}%</span>
        </div>

                    <div 
                      className="flex items-center justify-between p-3 bg-white/70 rounded-lg cursor-pointer hover:bg-white/90 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/company/colaboradores');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Registrados vs Pendentes</span>
                      </div>
                      <span className="text-xl font-bold text-blue-700">{mockCompanyMetrics.registeredEmployees}/{mockCompanyMetrics.unregisteredEmployees}</span>
                    </div>

                    <div 
                      className="flex items-center justify-between p-3 bg-white/70 rounded-lg cursor-pointer hover:bg-white/90 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/company/sessions');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Taxa de Utilização</span>
                      </div>
                      <span className="text-xl font-bold text-purple-700">{mockCompanyMetrics.utilizationRate}%</span>
                    </div>
                </div>

                  <div className="mt-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/company/colaboradores');
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
                    >
                      Ver Todos os Detalhes →
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
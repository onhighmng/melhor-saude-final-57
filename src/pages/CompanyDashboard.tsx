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
          
          {/* Bento Grid Layout - 6 Cards as per PRD */}
          <div className="h-[calc(100vh-200px)]">
            <BentoGrid className="h-full grid-rows-3 gap-4">
              {/* 1. Nº total de colaboradores incluídos no plano */}
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
                cta="Ver Colaboradores"
              />

              {/* 2. Nº de colaboradores registados vs por registar */}
              <BentoCard 
                name="Registrados vs Por Registar" 
                description={`${mockCompanyMetrics.registeredEmployees} registados, ${mockCompanyMetrics.unregisteredEmployees} pendentes`} 
                Icon={Users} 
                onClick={() => navigate('/company/colaboradores')} 
                className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2" 
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
                cta="Ver Detalhes"
              />

              {/* 3. Sessões contratadas vs sessões utilizadas */}
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

              {/* 4. Pilar mais utilizado */}
              <BentoCard 
                name="Pilar Mais Utilizado" 
                description={`${mockCompanyMetrics.mostUsedPillar} - 42% das sessões`} 
                Icon={PillarIcon} 
                onClick={() => navigate('/company/relatorios')} 
                className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3" 
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

              {/* 5. Satisfação média (1-10) */}
              <BentoCard 
                name="Satisfação Média" 
                description={`${mockCompanyMetrics.avgSatisfaction}/10 - Avaliação dos colaboradores`} 
                Icon={Star} 
                onClick={() => navigate('/company/relatorios')} 
                className="lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3" 
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

              {/* 6. % de colaboradores ativos / inativos */}
              <BentoCard 
                name="Atividade dos Colaboradores" 
                description={`${mockCompanyMetrics.activePercentage}% ativos / ${mockCompanyMetrics.inactivePercentage}% inativos`} 
                Icon={Activity} 
                onClick={() => navigate('/company/colaboradores')} 
                className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3" 
                background={
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100">
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
                      style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')"
                      }}
                    />
                </div>
                }
                iconColor="text-red-700"
                textColor="text-slate-900"
                descriptionColor="text-slate-600"
                href="#"
                cta="Ver Detalhes"
              />
            </BentoGrid>
              </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Users,
  TrendingUp,
  Download,
  Clock,
  BarChart3,
  Brain,
  Heart,
  DollarSign,
  Scale,
  Activity
} from 'lucide-react';
import { mockSessionAnalytics } from '@/data/companyMetrics';
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CompanySessions = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Add company-page class to body for light blue background
    document.body.classList.add('company-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('company-page');
    };
  }, []);

  const handleExportSessions = () => {
    toast({
      title: "Relatório exportado",
      description: "Relatório de sessões foi gerado com sucesso"
    });
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'Bem-Estar Físico':
        return <Heart className="h-4 w-4 text-yellow-600" />;
      case 'Assistência Financeira':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'Assistência Jurídica':
        return <Scale className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bem-Estar Físico':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Assistência Financeira':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Assistência Jurídica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      {/* Header Section */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
          Sessões & Utilização
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
          Análise detalhada da utilização de sessões por pilar e especialista
        </p>
        <Button 
          onClick={handleExportSessions}
          size="lg"
          className="gap-2 mt-6"
        >
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Main Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 relative mb-12 sm:mb-16 lg:mb-20">
        {/* Left Block - Session Overview with Animated Cards */}
        <div className="flex flex-col items-start justify-center border border-border p-4 sm:p-6 lg:p-8 bg-card rounded-l-xl">
          <div className="relative w-full mb-4 sm:mb-6">
            <div className="absolute inset-x-0 -bottom-2 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10"></div>
            
            {/* Session Stats Cards Stack */}
            <div className="relative mx-auto h-64 w-full my-4">
              <motion.div
                className="absolute bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 h-64 w-full rounded-3xl p-6 shadow-xl border border-border flex flex-col justify-between"
                animate={{
                  top: 0,
                  scale: 1,
                  zIndex: 3,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm font-medium">Sessões Contratadas</span>
                  </div>
                  <div className="text-5xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                    {mockSessionAnalytics.totalContracted}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total incluído no contrato
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                className="absolute bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 h-64 w-full rounded-3xl p-6 shadow-xl border border-border flex flex-col justify-between"
                animate={{
                  top: -10,
                  scale: 0.94,
                  zIndex: 2,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                    <Activity className="h-5 w-5" />
                    <span className="text-sm font-medium">Sessões Utilizadas</span>
                  </div>
                  <div className="text-5xl font-bold text-green-700 dark:text-green-300 mb-2">
                    {mockSessionAnalytics.totalUsed}
                  </div>
                  <p className="text-sm text-muted-foreground">Este mês</p>
                </div>
              </motion.div>
              
              <motion.div
                className="absolute bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 h-64 w-full rounded-3xl p-6 shadow-xl border border-border flex flex-col justify-between"
                animate={{
                  top: -20,
                  scale: 0.88,
                  zIndex: 1,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-medium">Taxa de Utilização</span>
                  </div>
                  <div className="text-5xl font-bold text-amber-700 dark:text-amber-300 mb-2">
                    {mockSessionAnalytics.utilizationRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">Eficiência do programa</p>
                </div>
              </motion.div>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground leading-relaxed">
            Dashboard Intuitivo de <span className="text-primary">Sessões</span>{" "}
            <span className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Visualize métricas de utilização com componentes elegantes que fornecem insights acionáveis em tempo real.
            </span>
          </h3>
        </div>

        {/* Right Block - Pillar Integration */}
        <div className="flex flex-col items-center justify-start border border-border p-4 sm:p-6 lg:p-8 bg-card rounded-r-xl">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground mb-4 sm:mb-6 leading-relaxed">
            Pilares de Bem-Estar <span className="text-primary">Integrados</span>{" "}
            <span className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Acesso completo a todos os pilares de saúde numa única plataforma centralizada e eficiente.
            </span>
          </h3>
          
          <div
            className={cn(
              "group relative mt-auto w-full inline-flex animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-background px-4 sm:px-6 lg:px-8 py-2 font-medium transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",
              "before:absolute before:bottom-[8%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",
            )}
          >
            <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 bg-background border border-border rounded-2xl sm:rounded-3xl z-10 w-full">
              {mockSessionAnalytics.pillarBreakdown.map((pillar, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 sm:p-4 border border-border rounded-xl sm:rounded-2xl hover:bg-muted/50 transition animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {getPillarIcon(pillar.pillar)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-semibold text-foreground truncate">
                        {pillar.pillar}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {pillar.sessionsUsed} de {pillar.sessionsAvailable} sessões
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                    <Badge className={`${getPillarColor(pillar.pillar)} text-sm px-3 py-1`}>
                      {pillar.utilizationRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </div>
        </div>
      </div>

      {/* Detailed Pillar Analysis Section */}
      <div className="mb-12 sm:mb-16 lg:mb-20">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="h-7 w-7 text-primary" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Análise Detalhada por Pilar</h2>
        </div>
        
        {/* Stats Cards with Usage */}
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {mockSessionAnalytics.pillarBreakdown.map((pillar, index) => (
            <div 
              key={index} 
              className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden hover-lift transition-all animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="px-6 py-6">
                <dd className="flex items-start justify-between space-x-2 mb-4">
                  <div className="flex items-center gap-2">
                    {getPillarIcon(pillar.pillar)}
                    <span className="text-base font-semibold text-foreground">
                      {pillar.pillar}
                    </span>
                  </div>
                  <span className={`text-base font-bold px-3 py-1 rounded-full ${
                    pillar.utilizationRate >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    pillar.utilizationRate >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {pillar.utilizationRate}%
                  </span>
                </dd>
                <dd className="mt-2 text-4xl font-bold text-foreground">
                  {pillar.sessionsUsed}
                </dd>
                <dd className="mt-2 text-base text-muted-foreground">
                  de {pillar.sessionsAvailable} sessões disponíveis
                </dd>
                <div className="mt-4 pt-4 border-t border-border">
                  <dt className="text-sm font-medium text-muted-foreground mb-2">
                    Top Especialistas
                  </dt>
                  <dd className="text-base text-foreground space-y-1">
                    {pillar.topSpecialists.slice(0, 2).map((specialist, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="truncate">{specialist.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">{specialist.sessions}</span>
                      </div>
                    ))}
                  </dd>
                </div>
              </div>
              <div className="flex justify-end border-t border-border bg-muted/30">
                <button className="px-6 py-4 text-base font-medium text-primary hover:text-primary/90 hover:bg-muted/50 transition-colors w-full text-right">
                  Ver detalhes completos →
                </button>
              </div>
            </div>
          ))}
        </dl>
      </div>

      {/* Stats and Impact Section */}
      <div className="mt-12 sm:mt-16 lg:mt-20 grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="flex justify-center items-center p-6 sm:p-8 bg-card border border-border rounded-xl">
          <div className="grid grid-cols-2 gap-8 sm:gap-12 w-full text-center">
            <div className="space-y-3">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                {mockSessionAnalytics.totalContracted}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">Sessões Contratadas</p>
            </div>
            <div className="space-y-3">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-600">
                {mockSessionAnalytics.totalUsed}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">Sessões Utilizadas</p>
            </div>
            <div className="space-y-3">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-600">
                {mockSessionAnalytics.utilizationRate}%
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">Taxa Utilização</p>
            </div>
            <div className="space-y-3">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-600">
                {mockSessionAnalytics.employeesUsingServices}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">Colaboradores Ativos</p>
            </div>
          </div>
        </div>
        
        <div className="relative p-6 sm:p-8 bg-card border border-border rounded-xl">
          <blockquote className="border-l-4 border-primary pl-6 sm:pl-8">
            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground mb-6">
              "A plataforma transformou completamente a forma como gerimos o bem-estar dos colaboradores. 
              Os insights em tempo real e a facilidade de uso permitiram aumentar significativamente 
              o engagement e a satisfação da equipa."
            </p>
            <div className="space-y-2">
              <cite className="block font-semibold text-lg text-foreground not-italic">
                Maria Santos, Diretora de RH
              </cite>
              <div className="text-sm text-muted-foreground">
                Tech Solutions Portugal
              </div>
            </div>
          </blockquote>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-12 sm:mt-16">
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="flex items-start gap-3 p-6">
            <Activity className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base font-semibold text-foreground mb-2">
                Dados Agregados e Anónimos
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Todas as informações apresentadas são agregadas e anónimas para proteger a privacidade dos colaboradores. 
                Não são exibidos dados individuais ou conteúdo clínico. A plataforma segue rigorosamente as diretrizes 
                de proteção de dados (RGPD).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CompanySessions;
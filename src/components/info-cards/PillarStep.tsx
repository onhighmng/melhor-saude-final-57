
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PillarStepProps {
  pillar: {
    title: string;
    description: string;
    features: string[];
    icon: React.ReactNode;
  };
  isVisible: boolean;
  index: number;
}

const PillarStep: React.FC<PillarStepProps> = ({
  pillar,
  isVisible,
  index
}) => {
  
  const pillarImages = [
    "/lovable-uploads/therapy-session.png", // Saúde Psicológica
    "/lovable-uploads/fad5a7e1-4fd0-4f9b-8151-d9c8b54fc079.png", // Saúde Física
    "/lovable-uploads/financial-planning.png", // Saúde Financeira
    "/lovable-uploads/business-meeting.png"  // Saúde Jurídica e Social
  ];

  const pillarKeys = ['psychological', 'physical', 'financial', 'legal'];
  
  // Portuguese translations for pillars
  const pillarData = {
    psychological: {
      title: 'Saúde Mental',
      description: 'Apoio psicológico e emocional',
      specialists: {
        title: 'Especialistas Disponíveis',
        availability: 'disponíveis 24/7',
        list: [
          'Psicólogos Clínicos',
          'Terapeutas Cognitivo-Comportamentais',
          'Psicoterapeutas',
          'Conselheiros de Saúde Mental',
          'Especialistas em Gestão de Stress'
        ]
      }
    },
    physical: {
      title: 'Bem-estar Físico',
      description: 'Saúde física e nutrição',
      specialists: {
        title: 'Especialistas Disponíveis',
        availability: 'disponíveis 24/7',
        list: [
          'Nutricionistas',
          'Personal Trainers',
          'Fisioterapeutas',
          'Médicos de Desporto',
          'Especialistas em Sono'
        ]
      }
    },
    financial: {
      title: 'Assistência Financeira',
      description: 'Planeamento e gestão financeira',
      specialists: {
        title: 'Especialistas Disponíveis',
        availability: 'disponíveis 24/7',
        list: [
          'Consultores Financeiros',
          'Gestores de Investimentos',
          'Especialistas em Orçamento',
          'Planeadores de Reforma',
          'Consultores de Dívida'
        ]
      }
    },
    legal: {
      title: 'Assistência Jurídica',
      description: 'Apoio legal e consultoria',
      specialists: {
        title: 'Especialistas Disponíveis',
        availability: 'disponíveis 24/7',
        list: [
          'Advogados de Família',
          'Advogados Laborais',
          'Consultores Jurídicos',
          'Notários',
          'Mediadores'
        ]
      }
    }
  };
  
  const pillarKey = pillarKeys[index];
  const currentPillar = pillarData[pillarKey as keyof typeof pillarData];
  const specialistsList = currentPillar?.specialists?.list || [];

  return (
    <div 
      className={`absolute inset-x-0 top-0 bottom-0 overflow-visible flex flex-col justify-center transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 visible transform translate-y-0 scale-100' : 'opacity-0 invisible transform translate-y-12 scale-95'
      }`}
      style={{
        transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
      }}
    >
      {/* Container with proper spacing to avoid navbar overlap */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16 pb-8 sm:pb-12 flex flex-col gap-8">
        
        {/* Hero Section with Icon and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
              {pillar.icon}
            </div>
            <h2 className="font-bold text-lg sm:text-xl lg:text-2xl text-navy-blue leading-tight text-center">
              {currentPillar?.title || pillar.title}
            </h2>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-navy-blue leading-relaxed max-w-2xl mx-auto font-medium px-2">
            {currentPillar?.description || pillar.description}
          </p>
          
          {/* 24/7 Availability Message */}
          <div className="mt-4 max-w-3xl mx-auto">
            <p className="text-xs sm:text-sm text-royal-blue/80 font-semibold">
              {currentPillar?.specialists?.title || 'Especialistas Disponíveis'} {currentPillar?.specialists?.availability || 'disponíveis 24/7'}
            </p>
          </div>
        </div>

        {/* Main Content Layout - Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 items-start">
          
          {/* Image Section */}
          <div className="order-2 lg:order-1">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-royal-blue/10 to-mint-green/10 rounded-xl transform rotate-1 group-hover:rotate-2 transition-transform duration-500"></div>
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img 
                  src={pillarImages[index]}
                  alt={t(pillar.title)}
                  className="w-full h-[150px] sm:h-[200px] lg:h-[250px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-blue/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          {/* Content Section - Profissionais Disponíveis */}
          <div className="order-1 lg:order-2">
            <Card className="overflow-hidden bg-white/95 backdrop-blur-lg border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-500">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <h3 className="font-bold text-base sm:text-lg text-navy-blue">
                    {currentPillar?.specialists?.title || 'Especialistas Disponíveis'}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {specialistsList.map((specialist: string, specialistIndex: number) => (
                    <div 
                      key={specialistIndex} 
                      className="flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-gradient-to-r hover:from-mint-green/5 hover:to-sky-blue/5 transition-all duration-300 group border border-transparent hover:border-royal-blue/10"
                      style={{
                        animationDelay: `${specialistIndex * 100}ms`
                      }}
                    >
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-royal-blue to-mint-green rounded-full mt-1 sm:mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-300 shadow-sm"></div>
                      <span className="text-xs sm:text-xs lg:text-sm text-navy-blue leading-relaxed font-medium group-hover:text-royal-blue transition-colors duration-300">
                        {specialist}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PillarStep;

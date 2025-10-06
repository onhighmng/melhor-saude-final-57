
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
    "/lovable-uploads/financial-planning.png", // Saúde Financeira
    "/lovable-uploads/fad5a7e1-4fd0-4f9b-8151-d9c8b54fc079.png", // Saúde Física
    "/lovable-uploads/business-meeting.png"  // Saúde Jurídica e Social
  ];

  const pillarDescriptions = [
    "Cuidar da saúde mental é essencial para manter o equilíbrio emocional, a produtividade e a qualidade de vida no ambiente de trabalho.",
    "Reduzir o stress financeiro através de literacia financeira abrangente e apoio prático na gestão económica pessoal e familiar.",
    "Promover vitalidade e bem-estar através de medicina preventiva, nutrição balanceada e programas de exercício físico adaptados ao ambiente empresarial.",
    "Segurança jurídica é parte essencial do bem-estar, permitindo decisões informadas e proteção legal completa para colaboradores e suas famílias."
  ];

  const pillarFeatures = [
    [
      "Sessões individuais com psicólogos certificados", 
      "Atendimento em situações de crise emocional", 
      "Aconselhamento sobre stress laboral e burnout",
      "Programas de mindfulness e autocuidado",
      "Apoio psicológico 24/7",
      "Terapia de grupo especializada"
    ],
    [
      "Sessões com consultores financeiros certificados", 
      "Apoio na elaboração de orçamentos personalizados", 
      "Programas educativos sobre gestão de dinheiro",
      "Orientação para reorganizar finanças",
      "Planeamento de poupanças e investimentos",
      "Renegociação de dívidas"
    ],
    [
      "Acesso a médicos e nutricionistas qualificados", 
      "Planos alimentares personalizados", 
      "Programas de exercício e pausas ativas",
      "Avaliações de saúde ocupacional",
      "Fisioterapia e reabilitação",
      "Rastreios de saúde regulares"
    ],
    [
      "Consultoria com advogados especializados", 
      "Esclarecimento sobre contratos e direitos", 
      "Acompanhamento preventivo para evitar litígios",
      "Direito da família e civil",
      "Direito do trabalho",
      "Representação legal quando necessário"
    ]
  ];

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
              {pillar.title}
            </h2>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-navy-blue leading-relaxed max-w-2xl mx-auto font-medium px-2">
            {pillarDescriptions[index]}
          </p>
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
                  alt={pillar.title}
                  className="w-full h-[150px] sm:h-[200px] lg:h-[250px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-blue/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          {/* Content Section - Only Serviços Incluídos */}
          <div className="order-1 lg:order-2">
            <Card className="overflow-hidden bg-white/95 backdrop-blur-lg border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-500">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <h3 className="font-bold text-base sm:text-lg text-navy-blue">
                    Serviços Incluídos
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {pillarFeatures[index].map((feature, featureIndex) => (
                    <div 
                      key={featureIndex} 
                      className="flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-gradient-to-r hover:from-mint-green/5 hover:to-sky-blue/5 transition-all duration-300 group border border-transparent hover:border-royal-blue/10"
                      style={{
                        animationDelay: `${featureIndex * 100}ms`
                      }}
                    >
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-royal-blue to-mint-green rounded-full mt-1 sm:mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-300 shadow-sm"></div>
                      <span className="text-xs sm:text-xs lg:text-sm text-navy-blue leading-relaxed font-medium group-hover:text-royal-blue transition-colors duration-300">
                        {feature}
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

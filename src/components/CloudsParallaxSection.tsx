import React, { useState, useEffect, useCallback, useRef } from 'react';

const CloudsParallaxSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress through the section
    const sectionStart = -rect.top;
    const sectionHeight = rect.height - windowHeight;
    
    if (sectionHeight > 0 && rect.top <= 0 && rect.bottom >= windowHeight) {
      const progress = Math.max(0, Math.min(1, sectionStart / sectionHeight));
      
      // Divide into 5 steps (0-4)
      const stepIndex = Math.floor(progress * 5);
      const clampedStep = Math.max(0, Math.min(4, stepIndex));
      
      if (clampedStep !== currentStep) {
        setCurrentStep(clampedStep);
      }
    }
  }, [currentStep]);

  useEffect(() => {
    const throttledScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  const handleImplementPillars = () => {
    // Navigate to pricing section
    const pricingSection = document.querySelector('[data-section="pricing"]');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLearnMore = () => {
    // Navigate to guides section
    const guidesSection = document.querySelector('[data-section="guides"]');
    if (guidesSection) {
      guidesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pillars = [
    {
      title: "Saúde Psicológica",
      description: "Consultas de psicologia, gestão de stress e programas de bem-estar emocional.",
      features: ["Apoio psicológico 24/7", "Prevenção do burnout", "Terapia de grupo"],
      icon: (
        <svg className="w-16 h-16 text-mint-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      title: "Saúde Financeira",
      description: "Planeamento financeiro e educação para reduzir o stress económico.",
      features: ["Consultoria financeira", "Educação financeira", "Renegociação de dívidas"],
      icon: (
        <svg className="w-16 h-16 text-peach-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      title: "Saúde Física",
      description: "Programas de exercício e nutrição para um desempenho sustentável.",
      features: ["Exercício no local de trabalho", "Consultas de nutrição", "Rastreios de saúde"],
      icon: (
        <svg className="w-16 h-16 text-royal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Saúde Jurídica e Social",
      description: "Consultoria jurídica completa para questões pessoais e familiares.",
      features: ["Direito da família e civil", "Direito do trabalho", "Representação legal"],
      icon: (
        <svg className="w-16 h-16 text-sky-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative z-20 h-[500vh] bg-gradient-to-b from-sky-blue/30 to-soft-white mt-0"
    >
      <div className="sticky top-0 w-full h-screen flex items-center justify-center">
        {/* Step 0: Main Title */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
            currentStep === 0 ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <div className="text-center text-navy-blue max-w-4xl mx-auto p-8">
            <h2 className="text-5xl font-bold mb-6">
              Os 4 Pilares do Bem-estar Corporativo
            </h2>
            <p className="text-xl text-cool-grey leading-relaxed">
              A nossa abordagem holística ao bem-estar empresarial baseia-se em quatro pilares fundamentais.
            </p>
          </div>
        </div>

        {/* Steps 1-4: Individual Pillars */}
        {pillars.map((pillar, index) => (
          <div 
            key={index}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
              currentStep === index + 1 ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <div className="text-center text-navy-blue max-w-4xl mx-auto p-8">
              <div className="mb-8">
                {pillar.icon}
              </div>
              <h3 className="text-4xl font-bold mb-6 text-navy-blue">
                {pillar.title}
              </h3>
              <p className="text-xl mb-8 text-cool-grey leading-relaxed">
                {pillar.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {pillar.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="text-navy-blue">
                    <p>• {feature}</p>
                  </div>
                ))}
              </div>
              
              {/* Show CTA only on the last pillar */}
              {index === pillars.length - 1 && (
                <div className="mt-12">
                  <div className="bg-gradient-to-r from-mint-green/30 to-sky-blue/30 rounded-2xl p-8 mb-8 shadow-lg border border-cool-grey/20">
                    <h4 className="text-2xl font-bold mb-6 text-navy-blue">Resultados Comprovados</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-mint-green mb-2">98%</div>
                        <p className="text-cool-grey">Satisfação</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-sky-blue mb-2">45%</div>
                        <p className="text-cool-grey">Menos absentismo</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-royal-blue mb-2">24/7</div>
                        <p className="text-cool-grey">Suporte</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button 
                      onClick={handleImplementPillars}
                      className="bg-royal-blue text-soft-white px-8 py-3 rounded-2xl font-semibold hover:bg-navy-blue transition-all duration-300 hover:scale-105 transform shadow-lg"
                    >
                      Implementar os 4 Pilares
                    </button>
                    <button 
                      onClick={handleLearnMore}
                      className="bg-soft-white text-royal-blue border-2 border-royal-blue px-8 py-3 rounded-2xl font-semibold hover:bg-sky-blue/10 transition-all duration-300 hover:scale-105 transform shadow-lg"
                    >
                      Saber mais
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CloudsParallaxSection;

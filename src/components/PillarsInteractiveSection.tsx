import React from 'react';
import { PillarsFrameLayout } from '@/components/ui/pillars-frame-layout';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const PillarsInteractiveSection = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation(0.1);

  return (
    <section 
      ref={sectionRef}
      className={`relative z-10 bg-gradient-to-b from-gray-50 to-white pt-20 pb-20 scroll-mt-24 transition-all duration-1000 ${
        isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-navy-blue mb-4">
            Como podemos ajudar?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Selecione a área em que precisa de apoio
          </p>
        </div>

        {/* Interactive Frame Layout */}
        <div className="h-[600px] w-full">
          <PillarsFrameLayout 
            className="w-full h-full"
            hoverSize={8}
            gapSize={6}
          />
        </div>

        {/* Instructions */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Passe o rato sobre cada área para saber mais
          </p>
        </div>
      </div>
    </section>
  );
};

export default PillarsInteractiveSection;

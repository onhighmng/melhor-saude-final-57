
import React from 'react';
import { useInfoCardsScroll } from '@/hooks/useInfoCardsScroll';
import { pillars } from './info-cards/InfoCardsData';
import PillarStep from './info-cards/PillarStep';
import { useTranslation } from 'react-i18next';

const InfoCardsSection = () => {
  const { t } = useTranslation('common');
  const { currentStep, scrollProgress, sectionRef } = useInfoCardsScroll();

  const handleImplementPillars = () => {
    const pricingSection = document.querySelector('[data-section="pricing"]');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLearnMore = () => {
    const guidesSection = document.querySelector('[data-section="guides"]');
    if (guidesSection) {
      guidesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pillarFeatures = [
    {
      title: t('infoCards.psychological.title'),
      description: t('infoCards.psychological.description'),
      image: "/lovable-uploads/8e2df1aa-a1c7-4f91-b724-fc348e3347ee.png",
      features: [
        t('infoCards.psychological.features.0'),
        t('infoCards.psychological.features.1'),
        t('infoCards.psychological.features.2'),
        t('infoCards.psychological.features.3'),
        t('infoCards.psychological.features.4'),
        t('infoCards.psychological.features.5')
      ]
    },
    {
      title: t('infoCards.financial.title'),
      description: t('infoCards.financial.description'),
      image: "/lovable-uploads/922a13c5-6f7f-427b-8497-e5ca6c19e48e.png",
      features: [
        t('infoCards.financial.features.0'),
        t('infoCards.financial.features.1'),
        t('infoCards.financial.features.2'),
        t('infoCards.financial.features.3'),
        t('infoCards.financial.features.4'),
        t('infoCards.financial.features.5')
      ]
    },
    {
      title: t('infoCards.physical.title'),
      description: t('infoCards.physical.description'),
      image: "/lovable-uploads/fad5a7e1-4fd0-4f9b-8151-d9c8b54fc079.png",
      features: [
        t('infoCards.physical.features.0'),
        t('infoCards.physical.features.1'),
        t('infoCards.physical.features.2'),
        t('infoCards.physical.features.3'),
        t('infoCards.physical.features.4'),
        t('infoCards.physical.features.5')
      ]
    },
    {
      title: t('infoCards.legal.title'),
      description: t('infoCards.legal.description'),
      image: "/lovable-uploads/f48e9a64-fcb0-4691-baa9-c6007ac1a750.png",
      features: [
        t('infoCards.legal.features.0'),
        t('infoCards.legal.features.1'),
        t('infoCards.legal.features.2'),
        t('infoCards.legal.features.3'),
        t('infoCards.legal.features.4'),
        t('infoCards.legal.features.5')
      ]
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative z-20 h-[500vh] pt-24 scroll-mt-24"
      style={{
        background: `linear-gradient(to bottom, 
          hsl(var(--sky-blue) / ${Math.max(0.8 - scrollProgress * 0.6, 0.1)}) 0%, 
          hsl(var(--sky-blue) / ${Math.max(0.6 - scrollProgress * 0.45, 0.08)}) 20%,
          hsl(var(--mint-green) / ${Math.max(0.5 - scrollProgress * 0.35, 0.06)}) 40%,
          hsl(var(--peach-orange) / ${Math.max(0.3 - scrollProgress * 0.25, 0.04)}) 60%,
          hsl(var(--royal-blue) / ${Math.max(0.2 - scrollProgress * 0.15, 0.02)}) 80%,
          hsl(var(--soft-white)) 100%)`
      }}
    >
      {/* Enhanced gradient overlays */}
      <div 
        className="absolute top-0 left-0 right-0 h-32 z-10 transition-all duration-1000 ease-out"
        style={{
          background: `linear-gradient(to bottom, 
            transparent 0%, 
            hsl(var(--sky-blue) / ${0.1 + scrollProgress * 0.3}) 50%,
            hsl(var(--sky-blue) / ${0.2 + scrollProgress * 0.4}) 100%)`,
          transform: `translateY(${scrollProgress * -10}px)`
        }}
      />
      
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 z-10 transition-all duration-1000 ease-out"
        style={{
          background: `linear-gradient(to top, 
            hsl(var(--soft-white) / ${0.9 - scrollProgress * 0.3}) 0%,
            hsl(var(--soft-white) / ${0.6 - scrollProgress * 0.2}) 40%,
            hsl(var(--mint-green) / ${0.1 + scrollProgress * 0.2}) 70%,
            transparent 100%)`,
          transform: `translateY(${scrollProgress * 10}px)`,
          opacity: scrollProgress > 0.8 ? 1 - (scrollProgress - 0.8) * 5 : 1
        }}
      />

      <div className="sticky top-0 w-full h-screen flex items-center justify-center">
        {/* Step 0: Consolidated Pillars Overview */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-all duration-1200 ease-out ${
            currentStep === 0 ? 'opacity-100 visible transform translate-y-0 scale-100' : 'opacity-0 invisible transform translate-y-12 scale-95'
          }`}
        >
          <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12">
            {/* Header Section */}
            <div className="flex flex-col justify-start items-center w-full max-w-2xl mx-auto text-center mb-6 sm:mb-12 lg:mb-16 pt-8">
              <h2 className="text-h1 text-navy-blue">
                <div className="block text-center w-full">{t('infoCards.header.title')}</div>
                <div className="block text-center w-full text-white">
                  <span className="relative">{t('infoCards.header.subtitle')}</span>
                </div>
              </h2>
            </div>
          </div>
        </div>

        {/* Steps 1-4: Individual Pillars */}
        {pillars.map((pillar, index) => (
          <PillarStep
            key={index}
            pillar={pillar}
            isVisible={currentStep === index + 1}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};

export default InfoCardsSection;

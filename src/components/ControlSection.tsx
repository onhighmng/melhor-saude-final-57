import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useControlSectionScroll } from '@/hooks/useControlSectionScroll';
import { useTranslation } from 'react-i18next';
const ControlSection = () => {
  const { t } = useTranslation('common');
  const {
    currentStep,
    sectionRef
  } = useControlSectionScroll();
  return <section ref={sectionRef} className="relative z-10 bg-gradient-to-br from-soft-white via-emerald-green/8 to-vibrant-blue/5 overflow-hidden min-h-[200vh]">
      {/* Enhanced Decorative elements - only blue and green */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-bright-royal/20 to-vibrant-blue/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-emerald-green/15 to-vibrant-blue/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-mint-green/5 to-sky-blue/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      
      <div className="w-full max-w-7xl mx-auto relative z-10">
        <div className="pt-8 sm:pt-12 pb-16 sm:pb-24 w-full px-4 sm:px-6 lg:px-12 sticky top-0 min-h-screen flex flex-col justify-center py-[36px]">
          
          {/* Section Heading - Always visible */}
          <div className="text-center mb-12 mt-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-deep-navy to-bright-royal bg-clip-text text-transparent">
              {t('controlSection.title')}
            </h2>
          </div>
          
          {/* Company Description - Always visible */}
          <div className="bg-gradient-to-br from-white/95 to-vibrant-blue/10 backdrop-blur-lg border border-vibrant-blue/20 shadow-xl rounded-2xl p-8 lg:p-12 relative overflow-hidden mb-48">
            {/* Decorative gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vibrant-blue via-emerald-green to-bright-royal"></div>
            
            <div className="max-w-4xl mx-auto text-navy-blue">
              <p className="text-base lg:text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: t('controlSection.description') }} />
            </div>
          </div>
          
          {/* Step 0: Three Cards Grid */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
              
              {/* Card 1 - Nossa Missão */}
              <Card className="bg-gradient-to-br from-white/98 to-mint-green/5 backdrop-blur-lg border border-emerald-green/20 shadow-xl rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-700 group relative overflow-hidden" style={{
              animationDelay: '0ms'
            }}>
                {/* Card glow effect - blue and green only */}
                <div className="absolute inset-0 bg-gradient-to-br from-bright-royal/5 to-emerald-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bright-royal via-vibrant-blue to-emerald-green"></div>
                
                <CardContent className="p-6 lg:p-8 h-full flex flex-col relative z-10">
                  <div className="text-center mb-6">
                    <h3 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-deep-navy to-bright-royal bg-clip-text text-transparent mb-4 group-hover:from-bright-royal group-hover:to-vibrant-blue transition-all duration-500">
                      {t('controlSection.mission.title')}
                    </h3>
                  </div>
                  <p className="text-sm lg:text-base text-navy-blue leading-relaxed flex-1 group-hover:text-deep-navy transition-colors duration-300 text-center">
                    {t('controlSection.mission.content')}
                  </p>
                </CardContent>
              </Card>

              {/* Card 2 - Nossa Visão */}
              <Card className="bg-gradient-to-br from-white/98 to-vibrant-blue/5 backdrop-blur-lg border border-vibrant-blue/20 shadow-xl rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-700 group relative overflow-hidden" style={{
              animationDelay: '200ms'
            }}>
                {/* Card glow effect - blue and green only */}
                <div className="absolute inset-0 bg-gradient-to-br from-vibrant-blue/5 to-mint-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vibrant-blue via-sky-blue to-mint-green"></div>
                
                <CardContent className="p-6 lg:p-8 h-full flex flex-col relative z-10">
                  <div className="text-center mb-6">
                    <h3 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-deep-navy to-vibrant-blue bg-clip-text text-transparent mb-4 group-hover:from-vibrant-blue group-hover:to-sky-blue transition-all duration-500">
                      {t('controlSection.vision.title')}
                    </h3>
                  </div>
                  <p className="text-sm lg:text-base text-navy-blue leading-relaxed flex-1 group-hover:text-deep-navy transition-colors duration-300 text-center">
                    {t('controlSection.vision.content')}
                  </p>
                </CardContent>
              </Card>

              {/* Card 3 - Nossos Valores */}
              <Card className="bg-gradient-to-br from-white/98 to-emerald-green/5 backdrop-blur-lg border border-emerald-green/20 shadow-xl rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-700 group relative overflow-hidden" style={{
              animationDelay: '400ms'
            }}>
                {/* Card glow effect - blue and green only */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-green/5 to-bright-royal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-green via-mint-green to-bright-royal"></div>
                
                <CardContent className="p-6 lg:p-8 h-full flex flex-col relative z-10">
                  <div className="text-center mb-6">
                    <h3 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-deep-navy to-emerald-green bg-clip-text text-transparent mb-4 group-hover:from-emerald-green group-hover:to-bright-royal transition-all duration-500">
                      {t('controlSection.values.title')}
                    </h3>
                  </div>
                  <p className="text-sm lg:text-base text-navy-blue leading-relaxed flex-1 group-hover:text-deep-navy transition-colors duration-300 text-center">
                    {t('controlSection.values.content')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>



        </div>
      </div>
    </section>;
};
export default ControlSection;
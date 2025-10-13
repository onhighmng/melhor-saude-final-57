import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import { ChevronRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export function ModernHeroSection() {
  const navigate = useNavigate();
  const [sectionRef, isVisible] = useScrollAnimation(0.2);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleKnowMore = () => {
    const guidesSection = document.querySelector('[data-section="guides"]');
    if (guidesSection) {
      guidesSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  return (
    <main ref={sectionRef} className="overflow-x-hidden">
      <section>
        <div className="py-24 md:pb-32 lg:pb-36 lg:pt-72">
          <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
            <div className={`mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <h1 className="mt-8 max-w-2xl text-balance text-5xl md:text-6xl lg:mt-16 xl:text-7xl">
                O seu bem-estar começa aqui
              </h1>
              <p className="mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                Suporte integrado em saúde mental, bem-estar físico, assistência financeira e jurídica. Tudo num só lugar.
              </p>

              <div className={`mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start transition-all duration-1000 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="h-12 rounded-full pl-5 pr-3 text-base"
                >
                  <span className="text-nowrap">Começar Agora</span>
                  <ChevronRight className="ml-1" />
                </Button>
                <Button
                  onClick={handleKnowMore}
                  size="lg"
                  variant="ghost"
                  className="h-12 rounded-full px-5 text-base"
                >
                  <span className="text-nowrap">Saber Mais</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import { ChevronRight } from 'lucide-react';

export function ModernHeroSection() {
  const navigate = useNavigate();

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
    <main className="overflow-x-hidden">
      <section>
        <div className="py-24 md:pb-32 lg:pb-36 lg:pt-72">
          <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
            <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
              <h1 className="mt-8 max-w-2xl text-balance text-5xl md:text-6xl lg:mt-16 xl:text-7xl">
                Melhor Saúde
              </h1>
              <p className="mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                Cuidamos da sua saúde mental e bem-estar com profissionais qualificados e uma plataforma completa.
              </p>

              <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
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
      <section className="bg-background pb-12">
        <div className="group relative m-auto max-w-7xl px-6">
          <div className="flex flex-col items-center md:flex-row">
            <div className="md:max-w-44 md:border-r md:pr-6 border-border">
              <p className="text-end text-sm text-muted-foreground">Confiado pelas melhores equipas</p>
            </div>
            <div className="relative py-6 md:w-[calc(100%-11rem)]">
              <InfiniteSlider
                speedOnHover={20}
                speed={40}
                gap={112}
              >
                <div className="flex">
                  <img
                    className="mx-auto h-5 w-fit dark:invert opacity-60"
                    src="https://html.tailus.io/blocks/customers/nvidia.svg"
                    alt="Partner Logo"
                    height="20"
                    width="auto"
                  />
                </div>

                <div className="flex">
                  <img
                    className="mx-auto h-4 w-fit dark:invert opacity-60"
                    src="https://html.tailus.io/blocks/customers/column.svg"
                    alt="Partner Logo"
                    height="16"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-4 w-fit dark:invert opacity-60"
                    src="https://html.tailus.io/blocks/customers/github.svg"
                    alt="Partner Logo"
                    height="16"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-5 w-fit dark:invert opacity-60"
                    src="https://html.tailus.io/blocks/customers/nike.svg"
                    alt="Partner Logo"
                    height="20"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-5 w-fit dark:invert opacity-60"
                    src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                    alt="Partner Logo"
                    height="20"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-4 w-fit dark:invert opacity-60"
                    src="https://html.tailus.io/blocks/customers/laravel.svg"
                    alt="Partner Logo"
                    height="16"
                    width="auto"
                  />
                </div>
              </InfiniteSlider>

              <ProgressiveBlur
                className="pointer-events-none absolute left-0 top-0 h-full w-20"
                direction="left"
                blurIntensity={1}
              />
              <ProgressiveBlur
                className="pointer-events-none absolute right-0 top-0 h-full w-20"
                direction="right"
                blurIntensity={1}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

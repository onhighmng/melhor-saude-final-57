import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const MembershipCardsSection = () => {
  const { t } = useTranslation('common');
  const [revealedCards, setRevealedCards] = useState<boolean[]>([false, false, false, false]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = cardRefs.current.findIndex(ref => ref === entry.target);
        if (index !== -1 && entry.isIntersecting) {
          setRevealedCards(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    });

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      cardRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const setCardRef = (index: number) => (el: HTMLDivElement | null) => {
    cardRefs.current[index] = el;
  };

  const cardsData = [
    {
      id: 'spend',
      category: t('membership.cards.progress.category'),
      title: t('membership.cards.progress.title'),
      features: [
        t('membership.cards.progress.feature1'),
        t('membership.cards.progress.feature2'),
        t('membership.cards.progress.feature3')
      ],
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Dashboard de analytics mostrando gráficos de progresso e métricas de desempenho para monitorização contínua'
    },
    {
      id: 'invest',
      category: t('membership.cards.invest.category'),
      title: t('membership.cards.invest.title'),
      features: [
        t('membership.cards.invest.feature1'),
        t('membership.cards.invest.feature2'),
        t('membership.cards.invest.feature3')
      ],
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Equipe diversa em reunião profissional representando investimento em bem-estar corporativo'
    },
    {
      id: 'save',
      category: t('membership.cards.save.category'),
      title: t('membership.cards.save.title'),
      features: [
        t('membership.cards.save.feature1'),
        t('membership.cards.save.feature2'),
        t('membership.cards.save.feature3')
      ],
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Gráficos financeiros mostrando economia de recursos e otimização de custos'
    },
    {
      id: 'technology',
      category: t('membership.cards.technology.category'),
      title: t('membership.cards.technology.title'),
      features: [
        t('membership.cards.technology.feature1'),
        t('membership.cards.technology.feature2'),
        t('membership.cards.technology.feature3')
      ],
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Profissional de saúde usando tablet digital para atendimento humanizado'
    }
  ];

  return (
    <section 
      className="relative bg-soft-white pt-28 sm:pt-32 lg:pt-36 pb-6 sm:pb-8 lg:pb-12 scroll-mt-24"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-h2 text-navy-blue mb-2 sm:mb-3 lg:mb-4">
            {t('membership.sectionTitle')}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-navy-blue/70 max-w-2xl mx-auto px-4">
            {t('membership.sectionSubtitle')}
          </p>
        </div>

        {/* Stacking Cards */}
        <div className="relative space-y-3 sm:space-y-4 lg:space-y-6">
          {cardsData.map((card, index) => (
            <div
              key={card.id}
              ref={setCardRef(index)}
              className={`relative bg-soft-white rounded-lg sm:rounded-xl lg:rounded-[20px] w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 sticky top-16 overflow-hidden shadow-[0_40px_24px_rgba(0,0,0,0.02),0_18px_18px_rgba(0,0,0,0.03),0_4px_10px_rgba(0,0,0,0.03)] transition-all duration-[800ms] ease-out transform ${
                revealedCards[index]
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 h-full">
                <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 xl:gap-6 flex-1 max-w-full lg:max-w-md order-2 lg:order-1">
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <p className="font-semibold text-xs sm:text-sm lg:text-base leading-tight tracking-[-0.064px] mb-0 mt-0 text-navy-blue">
                      {card.category}
                    </p>
                    <h4 className="font-semibold text-base sm:text-lg md:text-xl lg:text-[28px] leading-tight lg:leading-[28px] tracking-[-0.28px] mt-0 mb-0 text-navy-blue">
                      {card.title}
                    </h4>
                  </div>
                  <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3 pl-2 sm:pl-3 lg:pl-4 pr-0">
                    {card.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex}
                        className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed tracking-[-0.072px] text-navy-blue"
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 flex justify-center items-center max-w-full lg:max-w-2xl w-full order-1 lg:order-2">
                  <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                    <img 
                      className="w-full h-auto object-contain rounded-lg sm:rounded-xl lg:rounded-2xl"
                      src={card.image}
                      loading="lazy"
                      alt={card.alt}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MembershipCardsSection;
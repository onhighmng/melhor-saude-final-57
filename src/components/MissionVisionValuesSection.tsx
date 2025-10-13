import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const MissionVisionValuesSection = () => {
  const [sectionRef, isVisible] = useScrollAnimation(0.2);
  const cards = [
    {
      title: 'Missão',
      content: 'Promover o bem-estar integral das pessoas através de soluções acessíveis e integradas em saúde mental, física, financeira e jurídica.',
      gradient: "from-vibrant-blue/10 to-sky-blue/10",
      border: "border-vibrant-blue"
    },
    {
      title: 'Visão', 
      content: 'Ser a plataforma de referência em Portugal para o bem-estar holístico, criando um impacto positivo na qualidade de vida das pessoas e organizações.',
      gradient: "from-sky-blue/10 to-mint-green/10",
      border: "border-sky-blue"
    },
    {
      title: 'Valores',
      content: 'Empatia, excelência, confidencialidade, inovação e compromisso com o bem-estar de cada pessoa que servimos.',
      gradient: "from-mint-green/10 to-accent-sage/10", 
      border: "border-mint-green"
    }
  ];

  return (
    <section ref={sectionRef} className="pt-28 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div 
              key={index}
              className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-8 border-l-4 ${card.border} hover:shadow-lg transition-all duration-1000 ease-out transform hover:-translate-y-2 hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0 scale-100 rotate-0' : 'opacity-0 translate-y-24 scale-90 -rotate-2'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <h3 className="text-2xl font-bold text-navy-blue mb-6 text-center">
                {card.title}
              </h3>
              <p className="text-gray-700 leading-relaxed text-center">
                {card.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionVisionValuesSection;
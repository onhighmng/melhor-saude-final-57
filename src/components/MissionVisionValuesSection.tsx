import React from 'react';

const MissionVisionValuesSection = () => {
  const cards = [
    {
      title: "Nossa Missão",
      content: "Promovemos o bem-estar integral dos colaboradores através de soluções digitais seguras, personalizadas e sustentadas nos quatro pilares da saúde: psicológica, jurídica, financeira e física. Nosso objetivo é ajudar as empresas a criar ambientes de trabalho saudáveis, positivos e sustentáveis, onde todos possam prosperar com equilíbrio e autonomia.",
      gradient: "from-vibrant-blue/10 to-sky-blue/10",
      border: "border-vibrant-blue"
    },
    {
      title: "Nossa Visão", 
      content: "Queremos ser a principal referência nacional em soluções de bem-estar corporativo. Trabalhamos para construir uma nova cultura organizacional em Moçambique — mais consciente, humana e comprometida com o cuidado completo e contínuo dos colaboradores em todas as áreas essenciais da sua vida.",
      gradient: "from-sky-blue/10 to-mint-green/10",
      border: "border-sky-blue"
    },
    {
      title: "Nossos Valores",
      content: "Agimos com ética, transparência e foco humano. Valorizamos a confidencialidade, o uso responsável da tecnologia e a escuta ativa. Acreditamos no impacto real dos cuidados psicológicos, jurídicos, financeiros e físicos — com soluções mensuráveis, acessíveis e centradas nas necessidades de cada pessoa.",
      gradient: "from-mint-green/10 to-accent-sage/10", 
      border: "border-mint-green"
    }
  ];

  return (
    <section className="pt-28 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div 
              key={index}
              className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-8 border-l-4 ${card.border} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
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
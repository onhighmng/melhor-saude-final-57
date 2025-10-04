import React from 'react';
import { useTranslation } from 'react-i18next';

const MissionVisionValuesSection = () => {
  const { t } = useTranslation('common');
  
  const cards = [
    {
      title: t('mission.title'),
      content: t('mission.content'),
      gradient: "from-vibrant-blue/10 to-sky-blue/10",
      border: "border-vibrant-blue"
    },
    {
      title: t('vision.title'), 
      content: t('vision.content'),
      gradient: "from-sky-blue/10 to-mint-green/10",
      border: "border-sky-blue"
    },
    {
      title: t('values.title'),
      content: t('values.content'),
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
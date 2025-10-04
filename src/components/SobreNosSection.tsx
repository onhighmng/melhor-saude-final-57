import React from 'react';
import { useTranslation } from 'react-i18next';

const SobreNosSection = () => {
  const { t } = useTranslation('common');
  
  return (
    <section id="sobre-nos" className="pt-32 pb-16 px-4 bg-white scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-h1 text-vibrant-blue mb-8">{t('about.title')}</h2>
        </div>
        
        <div className="bg-gradient-to-r from-sky-blue/10 to-mint-green/10 rounded-2xl p-8 border-l-4 border-vibrant-blue">
          <div className="max-w-4xl mx-auto text-body text-gray-700 leading-relaxed">
            <p className="mb-6">
              {t('about.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SobreNosSection;
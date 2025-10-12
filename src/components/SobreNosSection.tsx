import React from 'react';

const SobreNosSection = () => {
  return (
    <section id="sobre-nos" className="pt-32 pb-16 px-4 bg-white scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-h1 text-vibrant-blue mb-8">Sobre Nós</h2>
        </div>
        
        <div className="bg-gradient-to-r from-sky-blue/10 to-mint-green/10 rounded-2xl p-8 border-l-4 border-vibrant-blue">
          <div className="max-w-4xl mx-auto text-body text-gray-700 leading-relaxed">
            <p className="mb-6">
              O Melhor Saúde é uma plataforma integrada de bem-estar que oferece suporte completo em saúde mental, bem-estar físico, assistência financeira e jurídica. Conectamos pessoas a especialistas qualificados através de uma plataforma moderna e acessível, promovendo o equilíbrio e a qualidade de vida.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SobreNosSection;
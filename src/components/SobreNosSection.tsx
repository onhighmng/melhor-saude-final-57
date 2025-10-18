import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const SobreNosSection = () => {
  const [sectionRef, isVisible] = useScrollAnimation(0.2);

  return (
    <section 
      ref={sectionRef}
      id="sobre-nos" 
      className="pt-32 pb-16 px-4 bg-white scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
        }`}>
          <h2 className="text-h1 text-vibrant-blue mb-8">Sobre Nós</h2>
        </div>
        
        <div className={`bg-gradient-to-r from-sky-blue/10 to-mint-green/10 rounded-2xl p-8 border-l-4 border-vibrant-blue transition-all duration-1000 delay-300 ease-out ${
          isVisible ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-24 scale-95 blur-sm'
        }`}>
          <div className="max-w-4xl mx-auto text-body text-gray-700 leading-relaxed">
            <p className="mb-6">
              A Melhor Saúde é a plataforma líder em bem-estar corporativo em Moçambique, criada para transformar a forma como as empresas cuidam das suas pessoas. Nascemos da necessidade de soluções completas, acessíveis e eficazes, que promovam ambientes organizacionais mais fortes, humanos e produtivos. Unimos tecnologia, confiança profissional e uma abordagem centrada nas pessoas para conectar empresas, colaboradores e especialistas em saúde e bem-estar. Atuamos com rigor ético, valorizando a confidencialidade e o sigilo profissional em todos os atendimentos, e oferecemos um cuidado humanizado, estratégico e digital que redefine a experiência de bem-estar no meio corporativo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SobreNosSection;
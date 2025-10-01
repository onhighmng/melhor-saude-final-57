import React from 'react';

const SobreNosSection = () => {
  return (
    <section id="sobre-nos" className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-h1 text-vibrant-blue mb-8">Sobre Nós</h2>
        </div>
        
        <div className="bg-gradient-to-r from-sky-blue/10 to-mint-green/10 rounded-2xl p-8 border-l-4 border-vibrant-blue">
          <div className="max-w-4xl mx-auto text-body text-gray-700 leading-relaxed">
            <p className="mb-6">
              A Melhor Saúde é a plataforma líder em bem-estar corporativo em Moçambique, criada para transformar a 
              forma como as empresas cuidam das suas pessoas. Nascemos da necessidade de <strong className="text-navy-blue">soluções completas, 
              acessíveis e eficazes</strong>, que promovam ambientes organizacionais mais fortes, humanos e produtivos. Unimos 
              tecnologia, confiança profissional e uma abordagem centrada nas pessoas para conectar empresas, 
              colaboradores e especialistas em saúde e bem-estar. Atuamos com rigor ético, valorizando a 
              <strong className="text-navy-blue"> confidencialidade e o sigilo profissional</strong> em todos os atendimentos, e oferecemos um cuidado humanizado, 
              estratégico e digital que redefine a experiência de <strong className="text-navy-blue">bem-estar no meio corporativo</strong>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SobreNosSection;
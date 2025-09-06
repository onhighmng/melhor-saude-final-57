import React from 'react';

const ProvidersHeader: React.FC = () => {
  return (
    <section className="relative pt-16 pb-16 bg-gradient-to-br from-soft-white via-vibrant-blue/8 to-emerald-green/10 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-bright-royal/5 to-vibrant-blue/3 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-20 w-48 h-48 bg-gradient-to-br from-emerald-green/8 to-warm-orange/4 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-vibrant-blue/3 to-emerald-green/5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h1 className="font-semibold text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6 bg-gradient-to-r from-deep-navy via-bright-royal to-vibrant-blue bg-clip-text text-transparent animate-fade-in">
            Nossos Prestadores
          </h1>
          <p className="text-lg md:text-xl leading-relaxed tracking-tight max-w-3xl mx-auto text-slate-grey">
            Profissionais qualificados especializados em bem-estar corporativo, prontos para apoiar a sua empresa e colaboradores.
          </p>
          
          {/* Accent elements */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <div className="w-12 h-1 bg-gradient-to-r from-bright-royal to-vibrant-blue rounded-full"></div>
            <div className="w-3 h-3 bg-emerald-green rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-vibrant-blue to-emerald-green rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProvidersHeader;


import React from 'react';
import AdditionalGuidesCarousel from './AdditionalGuidesCarousel';

interface AdditionalGuide {
  name: string;
  image: string;
  video: string;
  title: string;
  rotation: number;
}

interface FinalGuidesSectionProps {
  additionalGuides: AdditionalGuide[];
}

const FinalGuidesSection: React.FC<FinalGuidesSectionProps> = ({ additionalGuides }) => {
  const handleKnowAll = () => {
    // Navigate to guides section
    const guidesSection = document.querySelector('[data-section="guides"]');
    if (guidesSection) {
      guidesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative z-20 bg-gradient-to-b from-sky-blue to-soft-white overflow-hidden min-h-screen flex flex-col justify-center py-8 md:py-12">
      <div className="w-full max-w-6xl mx-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-3xl mx-auto text-center mb-6">
            <div className="flex flex-col items-center gap-2">
              <h3 className="font-semibold text-xl sm:text-2xl lg:text-3xl xl:text-[36px] leading-tight mb-0 text-navy-blue">
                A Sua Equipa de Especialistas em Bem-Estar
              </h3>
              <div className="w-full max-w-lg">
                <p className="text-sm md:text-base leading-relaxed tracking-tight mb-0 text-navy-blue">
                  Profissionais qualificados que desenvolvem soluções <br className="hidden sm:block" />
                  digitais personalizadas para o bem-estar integral dos seus colaboradores.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <button 
                  onClick={handleKnowAll}
                  className="relative w-32 sm:w-36 h-10 rounded-[20px] border border-navy-blue flex items-center justify-center text-navy-blue transition-colors duration-300 hover:text-soft-white group overflow-hidden"
                >
                  <div className="relative z-10 text-sm leading-5 tracking-tight">
                    Conheça todos
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-navy-blue rounded-[20px] transform scale-y-0 origin-bottom transition-transform duration-600 ease-out group-hover:scale-y-100" />
                </button>
              </div>
            </div>
          </div>

          <AdditionalGuidesCarousel guides={additionalGuides} />
        </div>
      </div>
    </section>
  );
};

export default FinalGuidesSection;

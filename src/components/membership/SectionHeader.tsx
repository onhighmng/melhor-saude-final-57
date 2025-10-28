import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import FruitfulLogo from './FruitfulLogo';

const SectionHeader: React.FC = () => {
  const [headerRef, isVisible] = useScrollAnimation(0.1);

  return (
    <div 
      ref={headerRef}
      className="text-center w-full max-w-[680px] mx-auto"
    >
      <div className="flex flex-col items-center gap-6 mb-8">
        <div className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <FruitfulLogo />
        </div>
        
        <div className={`transform transition-all duration-1000 delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="font-semibold text-[40px] leading-[44px] tracking-[-0.4px] mb-4">
            Subscrever
          </h2>
          <p className="text-lg leading-6 tracking-[-0.072px] text-gray-700">
            Aceda aos nossos serviços premium
          </p>
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;


import React from 'react';
import { useParallaxScroll } from '../../hooks/useScrollAnimation';

const SpendCard: React.FC = () => {
  const scrollY = useParallaxScroll();

  return (
    <div className="w-[60%] h-[565px] pr-[120px] flex justify-center items-center relative" style={{ perspective: '1000px' }}>
      <div className="flex justify-center items-center w-full max-w-[640px] mb-[37.66px] mx-auto relative">
        {/* Phone with Cash Card */}
        <div 
          className="max-w-[192px] w-[18.75rem]"
          style={{ 
            transform: `translate3d(-15%, 0px, 0px) translateY(${scrollY * -0.008}px)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <img 
            src="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/672a268eb8ccc715164c39dd_cash-card-phone-v2.webp"
            alt="Phone showing cash card interface"
            className="max-w-full inline-block"
            loading="lazy"
          />
        </div>
        
        {/* Stacked Credit Card */}
        <div 
          className="max-w-[176px] z-2 rounded-2xl w-[17rem] absolute"
          style={{ 
            transform: `translate3d(25%, 25%, 0px) translateY(${scrollY * -0.012}px)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <img 
            src="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66cc9a47a4ffdddcf7138b80_stacking-card.png"
            alt="Green Fruitful card with Mastercard logo"
            className="max-w-full inline-block"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default SpendCard;

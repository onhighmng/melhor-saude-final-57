
import React from 'react';
import { useParallaxScroll } from '../../hooks/useScrollAnimation';
import { Link } from 'react-router-dom';

interface BenefitCardProps {
  benefit: {
    id: string;
    category: string;
    title: string;
    features: string[];
    image: string;
    link: string;
    hasAnimation?: boolean;
  };
  index: number;
  children?: React.ReactNode;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ benefit, index, children }) => {
  const scrollY = useParallaxScroll();
  
  const getCardTransform = (index: number) => `translateY(${scrollY * (0.015 * (index + 1))}px)`;

  return (
    <div 
      className="bg-white rounded-[20px] flex justify-between items-center w-full h-[565px] max-h-[565px] pl-[120px] sticky shadow-[0_0_0_0_rgba(0,0,0,0.02)] hover:shadow-[0_40px_24px_0_rgba(0,0,0,0.02),0_18px_18px_0_rgba(0,0,0,0.03),0_4px_10px_0_rgba(0,0,0,0.03)] transition-all duration-700"
      style={{ 
        top: `${64 + index * 20}px`,
        filter: 'blur(0px)',
        transform: getCardTransform(index)
      }}
    >
      {/* Left Content */}
      <div className="flex flex-col gap-8 flex-none justify-start items-start w-[25rem] max-w-[45%]">
        <div className="flex flex-col gap-2 justify-start items-stretch">
          <p className="font-semibold text-base leading-[22px] tracking-[-0.064px] mb-0 mt-0 text-green-700">
            {benefit.category}
          </p>
          <h4 className="font-semibold text-[28px] leading-[28px] tracking-[-0.28px] mt-0 mb-0">
            {benefit.title}
          </h4>
        </div>
        <ul className="mt-0 mb-0 pl-4 pr-4 space-y-2">
          {benefit.features.map((feature, featureIndex) => (
            <li 
              key={featureIndex}
              className="text-lg leading-6 tracking-[-0.072px]"
            >
              {feature}
            </li>
          ))}
        </ul>
        <div className="relative z-10">
          {benefit.link.startsWith('http') ? (
            <a 
              href={benefit.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#054f31] text-[#d1fad1] rounded-[20px] w-[11.5rem] h-12 flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-md group"
            >
              <div className="relative z-10 text-base leading-[22px] tracking-[-0.064px]">
                Tell me more
              </div>
              <div 
                className="absolute bottom-0 left-0 right-0 h-12 bg-[#d1fad1] rounded-[20px] transform scale-y-0 origin-bottom transition-transform duration-600 ease-out group-hover:scale-y-100"
                style={{ transformOrigin: '92px 48px' }}
              />
            </a>
          ) : (
            <Link 
              to={benefit.link}
              className="bg-[#054f31] text-[#d1fad1] rounded-[20px] w-[11.5rem] h-12 flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-md group"
            >
              <div className="relative z-10 text-base leading-[22px] tracking-[-0.064px]">
                Tell me more
              </div>
              <div 
                className="absolute bottom-0 left-0 right-0 h-12 bg-[#d1fad1] rounded-[20px] transform scale-y-0 origin-bottom transition-transform duration-600 ease-out group-hover:scale-y-100"
                style={{ transformOrigin: '92px 48px' }}
              />
            </Link>
          )}
        </div>
      </div>
      
      {/* Right Image Container */}
      <div className="w-[60%] h-[565px] pr-[120px] flex justify-center items-center relative" style={{ perspective: '1000px' }}>
        {children || (
          <div className="w-[40em] mx-auto mr-8">
            <img 
              src={benefit.image}
              alt={benefit.category}
              className="max-w-full hover:scale-105 transition-transform duration-500"
              loading="lazy"
              style={{ transform: `translateY(${scrollY * -0.008}px)` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BenefitCard;

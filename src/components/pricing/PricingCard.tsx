
import React from 'react';

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  buttonText: string;
  href: string;
  backgroundColor?: string;
  badge?: {
    text: string;
    color: string;
  };
  decorativeImages?: {
    src: string;
    alt: string;
    className: string;
  }[];
  transform?: string;
  decorativeLeaf?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  description,
  buttonText,
  href,
  backgroundColor = 'bg-white',
  badge,
  decorativeImages = [],
  transform = '',
  decorativeLeaf = false
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative flex flex-col justify-center items-center w-[22.5em] min-w-[360px] aspect-[1.15/1] ${backgroundColor} border border-gray-200 rounded-[32px] p-5 pb-6 font-medium text-center text-green-900 shadow-lg hover:border-green-800 hover:bg-green-50 transition-all duration-300 z-[2] ${transform}`}
      style={{ textDecoration: 'none' }}
    >
      {badge && (
        <div className={`absolute top-3 right-3 ${badge.color} px-7 py-2 rounded-full text-base font-semibold leading-4 z-[2]`}>
          {badge.text}
        </div>
      )}
      
      <div className="relative">
        <div className="relative flex flex-row items-end z-[1]">
          <div className="min-w-[168px] h-[72px] relative overflow-hidden">
            <h4 className="text-[80px] font-semibold leading-[80px] tracking-[-0.8px] mt-[-8px] mb-0 relative">
              <span className="absolute text-[26.4px] top-[19.8px] left-[0.5em]">MZN</span>
              <span className="ml-16">{price}</span>
            </h4>
          </div>
          <div className="absolute bottom-0 right-[-36px] transform translate-x-[-20px] translate-y-[-8px]">
            <div className="text-xs leading-[13.8px] tracking-[-0.048px]">{period}</div>
          </div>
        </div>
        <p className="font-semibold text-[21.33px] leading-[26.67px] tracking-[-0.213px] mt-0 mb-0">{title}</p>
      </div>
      <div className="h-[14.4px] overflow-hidden">
        <div className="text-xs leading-[13.8px] tracking-[-0.048px]">
          {description}
        </div>
      </div>
      
      {decorativeLeaf && (
        <div className="absolute top-[-48px] right-[-40px] w-20 h-20 transform rotate-90">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" className="w-full h-full">
            <g>
              <path fill="rgb(2,121,72)" d="M180.375,-38.25 C97.375,-42.25 -6.5,62.5 15,152.5 C94.5,144 199.375,52.75 180.375,-38.25z" />
            </g>
          </svg>
        </div>
      )}
      
      {decorativeImages.length > 0 && (
        <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none z-0">
          {decorativeImages.map((image, index) => (
            <img 
              key={index}
              src={image.src} 
              alt={image.alt} 
              className={image.className}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-5 left-5 right-5 h-12 bg-green-800 rounded-xl flex items-center justify-center hover:bg-green-700 transition-all duration-500 z-[5] shadow-lg">
        <span className="text-sm font-bold text-white tracking-wide">{buttonText}</span>
      </div>
    </a>
  );
};

export default PricingCard;


import React from 'react';

interface EnterprisePricingCardProps {
  title: string;
  priceText: string;
  subtitle?: string;
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
}

const EnterprisePricingCard: React.FC<EnterprisePricingCardProps> = ({
  title,
  priceText,
  subtitle,
  description,
  buttonText,
  href,
  backgroundColor = 'bg-white',
  badge,
  decorativeImages = [],
  transform = ''
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative flex flex-col justify-center items-center w-[22.5em] min-w-[360px] aspect-[1.15/1] ${backgroundColor} border border-gray-200 rounded-[32px] p-5 pb-6 font-medium text-center text-green-900 shadow-lg hover:border-green-800 transition-all duration-300 z-[2] ${transform}`}
      style={{ textDecoration: 'none' }}
    >
      {badge && (
        <div className={`absolute top-3 right-3 ${badge.color} px-7 py-2 rounded-full text-base font-semibold leading-4 z-[2]`}>
          {badge.text}
        </div>
      )}
      
      <div className="relative">
        <div className="relative flex flex-col items-center z-[1]">
          <div className="min-w-[300px] h-[72px] relative overflow-hidden flex flex-col items-center">
            <h4 className="text-[24px] font-semibold leading-[28px] tracking-[-0.24px] mt-0 mb-2 text-center">
              {priceText}
            </h4>
            {subtitle && (
              <div className="text-xs leading-[13.8px] tracking-[-0.048px]">{subtitle}</div>
            )}
          </div>
        </div>
        <p className="font-semibold text-[21.33px] leading-[26.67px] tracking-[-0.213px] mt-2 mb-2">{title}</p>
        <p className="text-xs leading-[14px] tracking-[-0.048px] px-2">
          {description}
        </p>
      </div>
      
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

export default EnterprisePricingCard;

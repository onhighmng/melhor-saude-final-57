
import React from 'react';

interface FundCardProps {
  fund: {
    name: string;
    icon: string;
    apy: string;
  };
  delay: string;
  isVisible: boolean;
}

const FundCard: React.FC<FundCardProps> = ({ fund, delay, isVisible }) => {
  return (
    <div 
      className="shadow-[0_40px_24px_0_rgba(0,0,0,0.02),0_18px_18px_0_rgba(0,0,0,0.03),0_4px_10px_0_rgba(0,0,0,0.03)] z-10 gap-2 border border-[#eceff4] bg-white rounded-[20px] justify-start items-center w-[18rem] min-w-[272px] h-16 min-h-14 py-3 px-3 flex relative animate-[slide-in-right_0.8s_ease-out] hover:scale-105 transition-all duration-300"
      style={{ 
        animationDelay: delay,
        transform: isVisible ? 'translateX(0)' : 'translateX(-2rem)',
        opacity: isVisible ? 1 : 0
      }}
    >
      <div className="aspect-square rounded-xl h-[38.4px] overflow-hidden">
        <img 
          src={fund.icon}
          alt=""
          className="object-cover rounded-xl w-full max-w-none h-[38.4px]"
        />
      </div>
      <div className="font-semibold text-sm leading-[19.6px] tracking-[-0.056px]">
        {fund.name}
      </div>
      <div className="bg-[#d1fad1] text-[#039855] rounded-full justify-center items-center py-2 px-3 flex absolute right-3">
        <div className="font-semibold text-sm leading-[19.6px] tracking-[-0.056px]">
          {fund.apy}
        </div>
      </div>
    </div>
  );
};

export default FundCard;

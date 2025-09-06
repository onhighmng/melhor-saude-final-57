
import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import DollarIcon from './DollarIcon';
import FundCard from './FundCard';

const AnimatedSaveCard: React.FC = () => {
  const [, isSectionVisible] = useScrollAnimation(0.05);
  
  const fundCards = [
    {
      name: 'Emergency fund',
      icon: 'https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b5dfb987b11b385d104d4c_emergency-red.svg',
      apy: '5.00% APY'
    },
    {
      name: 'Travel',
      icon: 'https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b5dfb99f0d903c34df1f07_palm-gold.svg',
      apy: '5.00% APY'
    },
    {
      name: 'Bills & rent',
      icon: 'https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b5dfb980452d176d371eb8_bill-purple.svg',
      apy: '5.00% APY'
    },
    {
      name: 'Home',
      icon: 'https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1a6545848ec45e667f3_house-blue.svg',
      apy: '5.00% APY'
    }
  ];

  const getAnimationDelay = (index: number) => `${index * 0.15}s`;

  return (
    <div className="relative transform scale-90">
      <div className="relative z-10 flex flex-col gap-6 pt-9">
        {/* Income Card with Animated Coins */}
        <div className="absolute -top-12 -left-4">
          <div className="relative z-10 bg-white border border-[#eceff4] rounded-[20px] flex items-center justify-start w-[18rem] min-w-[272px] h-16 min-h-14 py-3 px-3 shadow-[0_40px_24px_0_rgba(0,0,0,0.02),0_18px_18px_0_rgba(0,0,0,0.03),0_4px_10px_0_rgba(0,0,0,0.03)]">
            <div className="aspect-square rounded-xl h-[38.4px] overflow-hidden">
              <img 
                src="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1a635e022da9adfaa06_bill-green.svg"
                alt=""
                className="object-cover rounded-xl w-full max-w-none h-[38.4px]"
              />
            </div>
            <div className="font-semibold text-sm leading-[19.6px] tracking-[-0.056px] ml-3">
              Income
            </div>
          </div>
          
          {/* Animated Coins */}
          <div className="absolute top-0 left-[72px] z-0 aspect-square rounded-[20%] w-10 overflow-hidden animate-[bounce_2s_infinite]">
            <img 
              src="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1a6495789fb004abd0c_coin-3.svg"
              alt=""
              className="object-cover rounded-xl w-full max-w-none h-10"
            />
          </div>
          <div className="absolute top-0 left-[72px] z-0 aspect-square rounded-[20%] w-10 overflow-hidden animate-[bounce_2s_infinite] animation-delay-[0.2s]">
            <img 
              src="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1a60304747cef4da5e8_coin-1.svg"
              alt=""
              className="object-cover rounded-xl w-full max-w-none h-10"
            />
          </div>
          <div className="absolute top-0 left-[72px] z-0 aspect-square rounded-[20%] w-10 overflow-hidden animate-[bounce_2s_infinite] animation-delay-[0.4s]">
            <img 
              src="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1a60dcc4b78169c4f54_coin-2.svg"
              alt=""
              className="object-cover rounded-xl w-full max-w-none h-10"
            />
          </div>
          <div className="absolute top-0 left-[72px] z-0 aspect-square rounded-[20%] w-10 overflow-hidden animate-[bounce_2s_infinite] animation-delay-[0.6s]">
            <img 
              src="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1a6d464cb06c141f8a6_dollar-green.svg"
              alt=""
              className="object-cover rounded-xl w-full max-w-none h-10"
            />
          </div>
        </div>

        {/* Fund Cards with Connecting Lines */}
        <div className="relative">
          {/* Connecting SVG Lines */}
          <div className="absolute left-4 top-0 pl-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 70 72" fill="none" className="text-[#eceff4] w-[4.25rem] min-w-[55.2px] absolute">
              <path d="M2 0V46C2 59.2548 12.7452 70 26 70H70" stroke="currentColor" strokeWidth="3" strokeDasharray="130" className="animate-[draw-line_2s_ease-out_forwards]" style={{ strokeDashoffset: '130px' }} />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 70 158" fill="none" className="text-[#eceff4] top-[6.4px] w-[4.25rem] min-w-[55.2px] absolute">
              <path d="M2 0V132C2 145.255 12.7452 156 26 156H70" stroke="currentColor" strokeWidth="3" strokeDasharray="220" className="animate-[draw-line_2.5s_ease-out_forwards]" style={{ strokeDashoffset: '220px' }} />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 70 248" fill="none" className="text-[#eceff4] top-[6.4px] w-[4.25rem] min-w-[55.2px] absolute">
              <path d="M2 0V222C2 235.255 12.7452 246 26 246H70" stroke="currentColor" strokeWidth="3" strokeDasharray="310" className="animate-[draw-line_3s_ease-out_forwards]" style={{ strokeDashoffset: '310px' }} />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 69 334" fill="none" className="text-[#eceff4] top-[6.4px] w-[4.25rem] min-w-[55.2px] absolute">
              <path d="M1.5 0.5V308.5C1.5 321.755 12.2452 332.5 25.5 332.5H69" stroke="currentColor" strokeWidth="3" strokeDasharray="400" className="animate-[draw-line_3.5s_ease-out_forwards]" style={{ strokeDashoffset: '400px' }} />
            </svg>
          </div>

          {/* Fund Cards with Staggered Animation */}
          {fundCards.map((fund, fundIndex) => (
            <div key={fundIndex} className="flex gap-10 items-center mb-6">
              <DollarIcon
                delay={getAnimationDelay(fundIndex)}
                isVisible={isSectionVisible}
              />
              <FundCard
                fund={fund}
                delay={getAnimationDelay(fundIndex + 0.5)}
                isVisible={isSectionVisible}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedSaveCard;

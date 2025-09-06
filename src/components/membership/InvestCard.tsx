
import React from 'react';
import { useParallaxScroll } from '../../hooks/useScrollAnimation';

const InvestCard: React.FC = () => {
  const scrollY = useParallaxScroll();
  
  // Calculate scroll progress for stacking effect
  const scrollProgress = Math.min(scrollY / 1000, 1);
  const stackOffset = scrollProgress * 30;

  return (
    <div className="w-[60%] h-[565px] pr-[120px] flex justify-center items-center relative" style={{ perspective: '1000px' }}>
      <div className="relative w-full max-w-[22rem]">
        {/* Main Investment Card Background */}
        <div 
          className="aspect-[1/1.5] rounded-[20px] bg-[#FEE9D1] w-[22rem] relative overflow-hidden"
          style={{ 
            transform: `translateY(${scrollY * -0.002}px) scale(${1 - scrollProgress * 0.05})`,
            zIndex: 1
          }}
        >
          <img 
            src="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/65cf9d3a4c4aec7151f77879_Cards%20%E2%80%93%20Invest.webp"
            alt="Investment portfolio visualization"
            className="object-cover rounded-[12px] w-full max-w-none h-[528px]"
            loading="lazy"
          />
        </div>

        {/* Portfolio Performance Chart - Stacks on top */}
        <div 
          className="absolute top-[40px] left-0 z-[3] w-[16rem]"
          style={{ 
            transform: `translateY(${scrollY * -0.003 + stackOffset}px) scale(${1 - scrollProgress * 0.02})`,
            opacity: 1 - scrollProgress * 0.1
          }}
        >
          <div className="bg-[#032F58] rounded-[20px] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-[#032F58] rounded-full"></div>
              </div>
              <div className="text-white text-sm font-semibold">+12.5%</div>
            </div>
            
            {/* Animated Chart Line */}
            <div className="relative h-16 mb-4">
              <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="xMidYMid meet">
                <path
                  d="M0,50 Q50,20 100,30 T200,10"
                  stroke="#4ADE80"
                  strokeWidth="3"
                  fill="none"
                  className="animate-[draw-line_3s_ease-out_forwards]"
                  style={{ strokeDasharray: '300', strokeDashoffset: '300' }}
                />
              </svg>
            </div>
            
            <div className="text-white text-xs opacity-80">Portfolio Growth</div>
          </div>
        </div>

        {/* Portfolio Breakdown Chart - Stacks in middle */}
        <div 
          className="absolute bottom-[40px] left-0 z-[2] w-[20rem]"
          style={{ 
            transform: `translateY(${scrollY * -0.001 + stackOffset * 0.7}px) scale(${1 - scrollProgress * 0.03})`,
            opacity: 1 - scrollProgress * 0.15
          }}
        >
          <div className="bg-white rounded-[20px] p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Portfolio Breakdown</h3>
              <div className="w-2 h-2 bg-[#1E8574] rounded-full"></div>
            </div>
            
            {/* Pie Chart Representation */}
            <div className="relative w-16 h-16 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#1E8574"
                  strokeWidth="8"
                  strokeDasharray="110 176"
                  className="animate-[draw-line_2s_ease-out_forwards]"
                  style={{ strokeDashoffset: '110' }}
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="8"
                  strokeDasharray="44 176"
                  strokeDashoffset="66"
                  className="animate-[draw-line_2.5s_ease-out_forwards]"
                />
              </svg>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#1E8574] rounded-full"></div>
                  <span>Stocks</span>
                </div>
                <span className="font-semibold">65%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#3B82F6] rounded-full"></div>
                  <span>Bonds</span>
                </div>
                <span className="font-semibold">25%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#E5E7EB] rounded-full"></div>
                  <span>Cash</span>
                </div>
                <span className="font-semibold">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Performance Indicator - Stacks on top */}
        <div 
          className="absolute top-8 right-4 z-[4] bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold animate-pulse"
          style={{ 
            transform: `translateY(${scrollY * -0.004 + stackOffset * 1.2}px) scale(${1 - scrollProgress * 0.01})` 
          }}
        >
          ↗ +8.2% YTD
        </div>

        {/* Additional Investment Metrics Card */}
        <div 
          className="absolute top-[160px] right-0 z-[3] w-[14rem]"
          style={{ 
            transform: `translateY(${scrollY * -0.002 + stackOffset * 0.8}px) scale(${1 - scrollProgress * 0.025})`,
            opacity: 1 - scrollProgress * 0.12
          }}
        >
          <div className="bg-gradient-to-br from-[#1E8574] to-[#0F5A4C] rounded-[16px] p-4 shadow-lg text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium opacity-80">Total Returns</div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-lg font-bold mb-2">MZN 1,207,392</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-green-400/20 text-green-300 px-2 py-1 rounded-full">
                +18.4%
              </span>
              <span className="opacity-70">vs last year</span>
            </div>
          </div>
        </div>

        {/* Risk Indicator */}
        <div 
          className="absolute bottom-[120px] right-0 z-[2] w-[12rem]"
          style={{ 
            transform: `translateY(${scrollY * -0.001 + stackOffset * 0.5}px) scale(${1 - scrollProgress * 0.035})`,
            opacity: 1 - scrollProgress * 0.18
          }}
        >
          <div className="bg-white rounded-[14px] p-3 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Risk Level</span>
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-4 h-2 rounded-sm ${
                    level <= 3 ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500">Moderate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestCard;

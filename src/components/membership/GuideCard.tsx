
import React from 'react';
import { useParallaxScroll } from '../../hooks/useScrollAnimation';

const GuideCard: React.FC = () => {
  const scrollY = useParallaxScroll();
  
  // Calculate scroll progress for animation effects
  const scrollProgress = Math.min(scrollY / 800, 1);
  const floatOffset = Math.sin(scrollY * 0.002) * 10;

  return (
    <div className="w-[60%] h-[565px] pr-[120px] flex justify-center items-center relative">
      <div className="relative w-full max-w-[28rem]">
        {/* Main Guide Interface */}
        <div 
          className="relative w-[28rem] h-[400px] rounded-[24px] bg-gradient-to-br from-[#054f31] to-[#032F58] shadow-2xl overflow-hidden"
          style={{ 
            transform: `translateY(${scrollY * -0.003}px) rotateX(${scrollProgress * 5}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Header Bar */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-black/20 backdrop-blur-sm flex items-center px-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 text-center text-white/80 text-sm font-medium">
              Fruitful Guide Session
            </div>
          </div>

          {/* Video Call Interface */}
          <div className="mt-16 p-6 h-full">
            <div className="relative w-full h-[200px] bg-gradient-to-br from-[#d1fad1]/20 to-transparent rounded-[16px] border border-white/10 mb-4">
              {/* Guide Avatar */}
              <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-[#d1fad1] to-[#a7f3d0] rounded-full flex items-center justify-center shadow-lg">
                <div className="w-12 h-12 bg-[#054f31] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  JD
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-medium">Live</span>
              </div>

              {/* Chat Messages */}
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                  "Let's review your portfolio allocation..."
                </div>
                <div className="bg-[#d1fad1]/20 backdrop-blur-sm rounded-lg p-3 text-white text-sm ml-8">
                  "Sounds great! I'm ready to optimize."
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button className="w-12 h-12 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center text-red-300 hover:bg-red-500/30 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Progress Cards */}
        <div 
          className="absolute -right-8 top-8 z-10 w-[180px]"
          style={{ 
            transform: `translateY(${floatOffset}px) translateX(${scrollY * -0.001}px)`
          }}
        >
          <div className="bg-white rounded-[16px] p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-800">Goal Progress</span>
              <div className="w-2 h-2 bg-[#054f31] rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Emergency Fund</span>
                  <span className="font-semibold">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#054f31] h-2 rounded-full w-[85%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Retirement</span>
                  <span className="font-semibold">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#054f31] h-2 rounded-full w-[92%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Session Notes */}
        <div 
          className="absolute -left-12 bottom-12 z-10 w-[200px]"
          style={{ 
            transform: `translateY(${-floatOffset * 0.7}px) translateX(${scrollY * 0.001}px)`
          }}
        >
          <div className="bg-[#d1fad1]/90 backdrop-blur-sm rounded-[16px] p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#054f31] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#054f31]">Session Notes</span>
            </div>
            <div className="space-y-2 text-xs text-[#054f31]">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-[#054f31] rounded-full"></div>
                <span>Review portfolio allocation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-[#054f31] rounded-full"></div>
                <span>Adjust risk tolerance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-[#054f31] rounded-full"></div>
                <span>Plan tax optimization</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideCard;


import React from 'react';
import { useCloudsScroll } from './CloudsScrollProvider';

const MainCloudsSection: React.FC = () => {
  const { currentStep, sectionRef, scrollProgress } = useCloudsScroll();

  return (
    <section 
      ref={sectionRef}
      className="relative z-10 h-[300vh] overflow-clip bg-soft-white"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sky-blue to-soft-white rounded-t-[40px]">
        <div className="sticky top-0 z-30 w-full h-screen relative">
          <img 
            src="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1c0e4bf185eefa67f0e_clouds.webp" 
            alt="" 
            className="object-cover w-full h-full transition-transform duration-150 ease-out"
            style={{ 
              transform: `translateX(${scrollProgress * -50}px) translateY(${scrollProgress * 25}px) scale(${1 + scrollProgress * 0.1})`
            }}
            sizes="100vw"
            srcSet="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1c0e4bf185eefa67f0e_clouds-p-500.webp 500w, https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1c0e4bf185eefa67f0e_clouds-p-800.webp 800w, https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1c0e4bf185eefa67f0e_clouds-p-1080.webp 1080w, https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1c0e4bf185eefa67f0e_clouds-p-1600.webp 1600w, https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1c0e4bf185eefa67f0e_clouds-p-2000.webp 2000w, https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1c0e4bf185eefa67f0e_clouds-p-2600.webp 2600w, https://cdn.prod.weather-files.com/659f15a242e58eb40c8cf14b/66b4d1c0e4bf185eefa67f0e_clouds-p-3200.webp 3200w, https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66b4d1c0e4bf185eefa67f0e_clouds.webp 3976w"
          />
          
          {/* Step 0: Initial Title */}
          <div 
            className={`absolute top-0 left-0 w-full h-full flex items-center justify-center z-40 transition-all duration-1000 ${
              currentStep === 0 ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <div className="text-center text-navy-blue">
              <h3 className="text-[3.25em] leading-[57.2px] font-medium mb-3">
                Membership<br />Benefits
              </h3>
              <div className="w-full max-w-[380px] mx-auto">
                <p className="text-lg leading-6 tracking-[-0.072px] mb-0">
                  One money membership.<br />Four game-changing benefits.
                </p>
              </div>
            </div>
          </div>

          {/* Step 1: Benefits List */}
          <div 
            className={`absolute top-0 left-0 w-full h-full flex items-center justify-center z-40 transition-all duration-1000 ${
              currentStep === 1 ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <div className="text-center text-navy-blue max-w-md">
              <h3 className="text-4xl font-medium mb-6">
                Your Benefits
              </h3>
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-mint-green rounded-full flex items-center justify-center text-navy-blue font-bold">1</div>
                  <span className="text-lg">Personal CFP® Guide</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-mint-green rounded-full flex items-center justify-center text-navy-blue font-bold">2</div>
                  <span className="text-lg">Custom Money System</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-mint-green rounded-full flex items-center justify-center text-navy-blue font-bold">3</div>
                  <span className="text-lg">Smart Spending Card</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-mint-green rounded-full flex items-center justify-center text-navy-blue font-bold">4</div>
                  <span className="text-lg">Automated Investing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Call to Action */}
          <div 
            className={`absolute top-0 left-0 w-full h-full flex items-center justify-center z-40 transition-all duration-1000 ${
              currentStep === 2 ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <div className="text-center text-navy-blue">
              <h3 className="text-4xl font-medium mb-6">
                Ready to Get Started?
              </h3>
              <p className="text-lg mb-8 max-w-md mx-auto">
                Join thousands who've transformed their financial future with Fruitful.
              </p>
              <a 
                href="https://my.fruitful.com/sign-up/start?promo=FIRSTMONTH50"
                className="bg-royal-blue text-soft-white rounded-[20px] px-8 py-3 inline-block transition-colors duration-300 hover:bg-navy-blue"
              >
                Start Your Journey
              </a>
            </div>
          </div>
        </div>
        
        <div 
          className="absolute inset-0 z-20 bg-gradient-to-b from-sky-blue via-sky-blue to-soft-white opacity-100 mix-blend-normal transition-opacity duration-300" 
          style={{ 
            background: 'linear-gradient(hsl(var(--sky-blue)) 70%, hsl(var(--soft-white)))',
            opacity: Math.max(1 - scrollProgress * 0.5, 0.3)
          }} 
        />
      </div>
    </section>
  );
};

export default MainCloudsSection;

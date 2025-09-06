
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';

const ScrollIndicator = () => {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Check if component should be hidden
  const shouldHide = location.pathname.startsWith('/admin');
  
  useEffect(() => {
    // Don't add listeners if component should be hidden
    if (shouldHide) return;
    
    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      
      if (maxScroll > 0) {
        const progress = Math.min(scrollTop / maxScroll, 1);
        setScrollProgress(progress);
        
        // Show indicator when scrolled more than 100px, hide when near bottom
        setIsVisible(scrollTop > 100 && progress < 0.95);
      }
    };

    // Initial calculation
    updateScrollProgress();
    
    // Add scroll listener with throttling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, [shouldHide]);
  
  const handleClick = () => {
    window.scrollTo({
      top: window.pageYOffset + window.innerHeight,
      behavior: 'smooth'
    });
  };
  
  // Hide scroll indicator on admin pages and booking flow page
  if (shouldHide) {
    return null;
  }
  
  return (
    <div className={`fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-500 ease-out ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
    }`}>
      <div 
        className="bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-1.5 sm:p-2 flex flex-col items-center cursor-pointer hover:bg-white/30 transition-all duration-300"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`Scroll progress: ${Math.round(scrollProgress * 100)}%`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Progress bar */}
        <div className="w-1 h-20 sm:h-32 bg-slate-grey/20 rounded-full backdrop-blur-sm border border-cool-grey/30 overflow-hidden">
          <div 
            className="w-full bg-gradient-to-b from-bright-royal to-vibrant-blue rounded-full transition-all duration-300 ease-out"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
        
        {/* Animated arrow - hide on very small screens */}
        <div className="hidden xs:flex justify-center mt-2 sm:mt-3">
          <div className="animate-bounce">
            <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-navy-blue" />
          </div>
        </div>
        
        {/* Progress percentage */}
        <div className="text-xs text-deep-navy text-center mt-1 sm:mt-2 font-medium">
          {Math.round(scrollProgress * 100)}%
        </div>
      </div>
    </div>
  );
};

export default ScrollIndicator;


import { useEffect, useRef, useState, useCallback } from 'react';

export const useControlSectionScroll = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate how much of the section has been scrolled through
    const sectionStart = -rect.top;
    const sectionHeight = rect.height - windowHeight;
    
    // Only update when section is in view
    if (rect.top <= windowHeight && rect.bottom >= 0) {
      const progress = Math.max(0, Math.min(1, sectionStart / Math.max(sectionHeight, 1)));
      setScrollProgress(progress);
      
      // Ultra smooth and very slow transitions with maximum overlap zones for fast scrollers
      // Step 0: Show three cards (0 - 0.75)
      // Step 1: Show Quem Somos (0.15 - 0.9) 
      // Step 2: Show Nossa História (0.3 - 1.0)
      let stepIndex;
      if (progress < 0.15) {
        stepIndex = 0;
      } else if (progress < 0.45) {
        stepIndex = 1;
      } else {
        stepIndex = 2;
      }
      
      if (stepIndex !== currentStep) {
        setCurrentStep(stepIndex);
      }
    }
  }, [currentStep]);

  useEffect(() => {
    let isScrolling = false;
    
    const throttledScroll = () => {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          handleScroll();
          isScrolling = false;
        });
        isScrolling = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  return { currentStep, scrollProgress, sectionRef };
};

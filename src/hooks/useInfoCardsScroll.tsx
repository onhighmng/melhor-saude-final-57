
import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfoCardsScroll = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress through the section
    const sectionStart = -rect.top;
    const sectionHeight = rect.height - windowHeight;
    
    if (sectionHeight > 0 && rect.top <= 0 && rect.bottom >= windowHeight) {
      const progress = Math.max(0, Math.min(1, sectionStart / sectionHeight));
      setScrollProgress(progress);
      
      // Divide into 5 steps (0-4) - 4 individual pillars, consolidated view
      const stepIndex = Math.floor(progress * 5);
      const clampedStep = Math.max(0, Math.min(4, stepIndex));
      
      if (clampedStep !== currentStep) {
        setCurrentStep(clampedStep);
      }
    }
  }, [currentStep]);

  useEffect(() => {
    const throttledScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  return { currentStep, scrollProgress, sectionRef };
};


import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';

interface ScrollAnimationContextType {
  currentStep: number;
  sectionRef: React.RefObject<HTMLElement>;
}

const ScrollAnimationContext = createContext<ScrollAnimationContextType | null>(null);

export const useScrollAnimation = () => {
  const context = useContext(ScrollAnimationContext);
  if (!context) {
    throw new Error('useScrollAnimation must be used within ScrollAnimationProvider');
  }
  return context;
};

interface ScrollAnimationProviderProps {
  children: React.ReactNode;
}

const ScrollAnimationProvider: React.FC<ScrollAnimationProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
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
    if (rect.top <= 0 && rect.bottom >= windowHeight) {
      const scrollProgress = Math.max(0, Math.min(1, sectionStart / sectionHeight));
      
      // Divide the scroll progress into 4 parts (0-3 steps)
      const stepIndex = Math.floor(scrollProgress * 4);
      const clampedStep = Math.max(0, Math.min(3, stepIndex));
      
      if (clampedStep !== currentStep) {
        setCurrentStep(clampedStep);
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

  return (
    <ScrollAnimationContext.Provider value={{ currentStep, sectionRef }}>
      {children}
    </ScrollAnimationContext.Provider>
  );
};

export default ScrollAnimationProvider;


import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';

interface CloudsScrollContextType {
  currentStep: number;
  sectionRef: React.RefObject<HTMLElement>;
  scrollProgress: number;
}

const CloudsScrollContext = createContext<CloudsScrollContextType | null>(null);

export const useCloudsScroll = () => {
  const context = useContext(CloudsScrollContext);
  if (!context) {
    throw new Error('useCloudsScroll must be used within CloudsScrollProvider');
  }
  return context;
};

interface CloudsScrollProviderProps {
  children: React.ReactNode;
}

const CloudsScrollProvider: React.FC<CloudsScrollProviderProps> = ({ children }) => {
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
    if (rect.top <= 0 && rect.bottom >= windowHeight) {
      const progress = Math.max(0, Math.min(1, sectionStart / sectionHeight));
      setScrollProgress(progress);
      
      // Divide the scroll progress into 3 parts (0-2 steps)
      const stepIndex = Math.floor(progress * 3);
      const clampedStep = Math.max(0, Math.min(2, stepIndex));
      
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
    <CloudsScrollContext.Provider value={{ currentStep, sectionRef, scrollProgress }}>
      {children}
    </CloudsScrollContext.Provider>
  );
};

export default CloudsScrollProvider;

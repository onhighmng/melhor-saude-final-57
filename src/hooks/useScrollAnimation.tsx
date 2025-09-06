
import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, we can stop observing to improve performance
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { 
        threshold,
        rootMargin: '50px 0px -50px 0px' // Trigger slightly before element is fully visible
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return [ref, isVisible] as const;
};

export const useParallaxScroll = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Throttle scroll updates and limit to viewport height for performance
          const newScrollY = Math.min(window.scrollY, window.innerHeight);
          setScrollY(newScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};

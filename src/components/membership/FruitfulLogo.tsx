
import React from 'react';
import { useParallaxScroll } from '../../hooks/useScrollAnimation';
import FruitfulText from './logo/FruitfulText';
import ModernText from './logo/ModernText';
import AnimatedCircles from './logo/AnimatedCircles';

const FruitfulLogo: React.FC = () => {
  const scrollY = useParallaxScroll();

  return (
    <div 
      className="relative w-80 h-20 flex items-center justify-center"
      style={{ transform: `translateY(${scrollY * -0.001}px)` }}
    >
      <svg
        width="320"
        height="100"
        viewBox="0 0 320 100"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
      >
        <FruitfulText />
        <ModernText />
        <AnimatedCircles />
      </svg>
    </div>
  );
};

export default FruitfulLogo;

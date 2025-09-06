import React, { useEffect, useRef } from 'react';
import { useParallaxScroll } from '../hooks/useScrollAnimation';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const scrollY = useParallaxScroll();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => {
        console.log('Hero video ready to play');
        video.play().catch(err => {
          console.warn('Hero video autoplay failed:', err);
        });
      };
      
      const handleError = (e: Event) => {
        console.error('Hero video failed to load:', e);
      };

      const handleLoadStart = () => {
        console.log('Hero video loading started');
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      video.addEventListener('loadstart', handleLoadStart);

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadstart', handleLoadStart);
      };
    }
  }, []);
  
  const handleGetStarted = () => {
    navigate('/');
  };
  
  const handleKnowMore = () => {
    const guidesSection = document.querySelector('[data-section="guides"]');
    if (guidesSection) {
      guidesSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full aspect-video overflow-hidden bg-gray-900 mt-20 sm:mt-0">
      {/* Video Background */}
      <video 
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        autoPlay 
        muted 
        loop 
        playsInline
        controls={false}
        preload="auto"
        style={{ 
          zIndex: 2,
          objectPosition: 'center center',
        }}
      >
        <source src="/Platform Ms(1).webm" type="video/webm" />
        <source src="/Platform Ms(1).mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Static background as reliable fallback */}
      <div 
        className="absolute inset-0 bg-white"
        style={{ 
          zIndex: 1,
        }}
      />

      {/* Logo positioned at bottom left */}
      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 lg:bottom-12 lg:left-12" style={{ zIndex: 10 }}>
        <img 
          src="/lovable-uploads/0dce0993-5b13-4451-8cf3-bfc35211e2da.png" 
          alt="Melhor Saúde Logo" 
          className="h-8 w-auto sm:h-12 md:h-16 lg:h-20 object-contain"
        />
      </div>

    </div>
  );
};

export default HeroSection;

import React, { useEffect, useRef } from 'react';
import { useScrollAnimation } from './ScrollAnimationProvider';

const MainGuidesSection: React.FC = () => {
  const {
    currentStep,
    sectionRef
  } = useScrollAnimation();
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => {
        console.log('Guides video ready to play');
        video.play().catch(err => {
          console.warn('Guides video autoplay failed:', err);
        });
      };
      
      const handleError = (e: Event) => {
        console.error('Guides video failed to load:', e);
      };

      const handleLoadStart = () => {
        console.log('Guides video loading started');
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
  
  return (
    <section ref={sectionRef} className="relative w-full aspect-video sm:h-screen bg-white py-8 sm:py-12 overflow-hidden">
      <div className="h-full flex items-center justify-center">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto">
          <div className="w-full max-w-5xl mx-auto">
            <div className="aspect-video w-full">
              <video
                ref={videoRef}
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className={`w-full h-full rounded-lg object-contain bg-black shadow-2xl transition-all duration-[1500ms] ease-out transform ${
                  currentStep >= 0 
                    ? 'scale-100 opacity-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)]' 
                    : 'scale-75 opacity-60 shadow-lg'
                }`}
              >
                <source src="https://jjgsucleibzqvccjnlov.supabase.co/storage/v1/object/public/temp-uploads/Loreno%20Melhor%20Saude.webm?v=2" type="video/webm" />
                <source src="https://jjgsucleibzqvccjnlov.supabase.co/storage/v1/object/public/temp-uploads/Loreno%20Melhor%20Saude.mp4?v=2" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainGuidesSection;


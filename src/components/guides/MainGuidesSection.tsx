
import React, { useEffect, useRef, useState } from 'react';
import { useScrollAnimation } from './ScrollAnimationProvider';

const MainGuidesSection: React.FC = () => {
  const {
    currentStep,
    sectionRef
  } = useScrollAnimation();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  // Intersection Observer for scroll detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isVisible = entry.isIntersecting;
        setIsInView(isVisible);

        if (isVisible) {
          // Video scrolled into view - play with sound
          video.muted = false;
          video.play().catch(err => {
            console.warn('Video autoplay failed:', err);
            // If autoplay fails, try muted first
            video.muted = true;
            video.play().catch(err2 => {
              console.warn('Muted video autoplay also failed:', err2);
            });
          });
          setHasPlayedOnce(true);
        } else if (hasPlayedOnce) {
          // Video scrolled out of view - mute but continue playing
          video.muted = true;
        }
      },
      {
        threshold: 0.5, // Video needs to be 50% visible
        rootMargin: '0px'
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [hasPlayedOnce]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => {
        console.log('Guides video ready to play');
        // Only autoplay if in view, otherwise wait for scroll
        if (isInView) {
          video.muted = false;
          video.play().catch(err => {
            console.warn('Guides video autoplay failed:', err);
          });
        }
      };
      
      const handleError = (e: Event) => {
        console.error('Guides video failed to load:', e);
      };

      const handleLoadStart = () => {
        console.log('Guides video loading started');
      };

      // Handle user interaction to unmute
      const handleUserInteraction = () => {
        if (isInView && video.muted) {
          video.muted = false;
        }
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('click', handleUserInteraction);

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('click', handleUserInteraction);
      };
    }
  }, [isInView]);
  
  return (
    <section ref={sectionRef} className="relative w-full aspect-video sm:h-screen bg-white pt-28 pb-8 sm:pb-12 scroll-mt-24 overflow-hidden">
      <div className="h-full flex items-center justify-center">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto">
          <div className="w-full max-w-5xl mx-auto">
            <div className="aspect-video w-full">
              <video
                ref={videoRef}
                controls
                loop
                playsInline
                preload="auto"
                className={`w-full h-full rounded-lg object-contain bg-black shadow-2xl transition-all duration-[1500ms] ease-out transform ${
                  currentStep >= 0 
                    ? 'scale-100 opacity-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)]' 
                    : 'scale-75 opacity-60 shadow-lg'
                } ${isInView ? 'ring-2 ring-primary/20' : ''}`}
              >
                <source src="https://ygxamuymjjpqhjoegweb.supabase.co/storage/v1/object/public/Videos/Loreno%20Melhor%20Saude.webm" type="video/webm" />
                <source src="https://ygxamuymjjpqhjoegweb.supabase.co/storage/v1/object/public/Videos/Loreno%20Melhor%20Saude.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            {/* Visual indicator when video is in view and playing with sound */}
            {isInView && !videoRef.current?.muted && (
              <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-full animate-fade-in">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm text-primary font-medium">Playing with sound</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainGuidesSection;


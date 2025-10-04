import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ZoomParallax } from '@/components/ui/zoom-parallax';
import heroBrain from '@/assets/hero-brain.jpg';
import heroCalculator from '@/assets/hero-calculator.jpg';
import heroFitness from '@/assets/hero-fitness.jpg';
import heroBalance from '@/assets/hero-balance.png';
import heroNeural from '@/assets/hero-neural.jpg';
import heroPlanning from '@/assets/hero-planning.jpg';

const HeroSection = () => {
  const { t } = useTranslation('common');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => {
        video.play().catch(() => {
          // Autoplay blocked - user interaction required
        });
      };
      
      video.addEventListener('canplay', handleCanPlay);
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, []);

  const images = [
    {
      src: heroBrain,
      alt: t('heroImages.mentalHealth'),
    },
    {
      src: heroCalculator,
      alt: t('heroImages.financialWellbeing'),
    },
    {
      src: heroFitness,
      alt: t('heroImages.physicalWellbeing'),
    },
    {
      src: heroBalance,
      alt: t('heroImages.balance'),
    },
    {
      src: heroNeural,
      alt: t('heroImages.neuralConnections'),
    },
    {
      src: heroPlanning,
      alt: t('heroImages.planning'),
    },
  ];

  const videoElement = (
    <video 
      ref={videoRef}
      className="w-full h-full object-cover rounded-lg shadow-2xl"
      autoPlay 
      muted 
      loop 
      playsInline
      controls={false}
      preload="none"
    >
      <source src="https://ygxamuymjjpqhjoegweb.supabase.co/storage/v1/object/public/Videos/Ms%20Hero%20Section%20Updated.mp4" type="video/mp4" />
    </video>
  );

  return (
    <div className="mt-20 sm:mt-0">
      <ZoomParallax images={images} videoElement={videoElement} />
    </div>
  );
};

export default HeroSection;
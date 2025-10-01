import React, { useEffect, useRef } from 'react';
import { ZoomParallax } from '@/components/ui/zoom-parallax';

const HeroSection = () => {
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
      src: '/lovable-uploads/8e051ede-f5b9-47a0-a9a1-53e8db6bf84f.png',
      alt: 'Saúde Mental',
    },
    {
      src: '/lovable-uploads/676d62ef-5d2a-46ab-9c4f-1c94521aabed.png',
      alt: 'Bem-estar',
    },
    {
      src: '/lovable-uploads/5d2071d4-8909-4e5f-b30d-cf52091ffba9.png',
      alt: 'Terapia',
    },
    {
      src: '/lovable-uploads/6f3eb5fe-a35b-4f90-afff-d0cc84a6cf3c.png',
      alt: 'Apoio',
    },
    {
      src: '/lovable-uploads/64839ced-48a0-4bc0-96d3-55b3c2d871a9.png',
      alt: 'Cuidado',
    },
    {
      src: '/lovable-uploads/5098d52a-638c-4f18-8bf0-36058ff94187.png',
      alt: 'Equilíbrio',
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
      preload="metadata"
    >
      <source src="https://ygxamuymjjpqhjoegweb.supabase.co/storage/v1/object/public/Videos/Platform%20Ms(1).webm" type="video/webm" />
      <source src="https://ygxamuymjjpqhjoegweb.supabase.co/storage/v1/object/public/Videos/Loreno%20Melhor%20Saude.mp4" type="video/mp4" />
    </video>
  );

  return (
    <div className="mt-20 sm:mt-0">
      <ZoomParallax images={images} videoElement={videoElement} />
    </div>
  );
};

export default HeroSection;
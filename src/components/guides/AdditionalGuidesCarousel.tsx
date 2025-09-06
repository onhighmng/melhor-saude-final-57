
import React, { useState } from 'react';
import VideoModal from './VideoModal';

interface AdditionalGuide {
  name: string;
  image: string;
  video: string;
  title: string;
  rotation: number;
}

interface AdditionalGuidesCarouselProps {
  guides: AdditionalGuide[];
}

const AdditionalGuidesCarousel: React.FC<AdditionalGuidesCarouselProps> = ({ guides }) => {
  const [selectedVideo, setSelectedVideo] = useState<{ src: string; name: string } | null>(null);

  const handleGuideClick = (guide: AdditionalGuide) => {
    setSelectedVideo({ src: guide.video, name: guide.name });
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      <div className="w-full relative">
        <div className="w-full max-w-5xl mx-auto">
          <div 
            className="flex justify-center items-center gap-0 rounded-[20px] overflow-hidden"
            style={{
              backgroundColor: 'rgb(254, 233, 209)',
              height: '300px'
            }}
          >
            {guides.map((guide, index) => (
              <div
                key={index}
                className="flex-1 h-full relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
                data-cursor={`More about ${guide.name.split(' ')[0]}`}
                onClick={() => handleGuideClick(guide)}
              >
                <img 
                  src={guide.image} 
                  loading="lazy" 
                  draggable="false" 
                  alt={guide.name} 
                  className="object-cover w-full h-full"
                />
                <video 
                  width="100%" 
                  height="100%" 
                  muted 
                  playsInline 
                  loop 
                  className="absolute inset-0 z-0 opacity-0 object-cover w-full h-full hover:opacity-100 transition-opacity duration-300"
                >
                  <source src={guide.video} />
                </video>
              </div>
            ))}
          </div>
        </div>
      </div>

      <VideoModal
        isOpen={!!selectedVideo}
        onClose={closeModal}
        videoSrc={selectedVideo?.src || ''}
        guideName={selectedVideo?.name || ''}
      />
    </>
  );
};

export default AdditionalGuidesCarousel;

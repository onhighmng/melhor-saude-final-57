
import React, { useRef } from 'react';

interface ProviderVideoCardProps {
  videoData: {
    hoverVideo: string;
    fullVideo: string;
    message: string;
  };
  index: number;
  onVideoClick: () => void;
  onMouseEnter: (index: number) => void;
  onMouseLeave: (index: number) => void;
  videoRef: (el: HTMLVideoElement | null) => void;
}

const ProviderVideoCard: React.FC<ProviderVideoCardProps> = ({
  videoData,
  index,
  onVideoClick,
  onMouseEnter,
  onMouseLeave,
  videoRef
}) => {
  return (
    <div 
      className="w-full aspect-video relative rounded-2xl overflow-hidden cursor-pointer group"
      onClick={onVideoClick}
      onMouseEnter={() => onMouseEnter(index)}
      onMouseLeave={() => onMouseLeave(index)}
    >
      <video
        ref={videoRef}
        width="100%"
        height="100%"
        muted
        playsInline
        loop
        className="w-full h-full object-cover rounded-2xl"
      >
        <source src={videoData.hoverVideo} />
      </video>
    </div>
  );
};

export default ProviderVideoCard;

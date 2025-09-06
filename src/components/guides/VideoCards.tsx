import React from 'react';

interface VideoCardsProps {
  isVisible: boolean;
}

const VideoCards: React.FC<VideoCardsProps> = ({ isVisible }) => {
  return (
    <div className={`absolute transition-all duration-1000 ${
      isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`}>
      <div className="aspect-[1.2/1] w-[22em] relative">
        {/* Bri Card */}
        <div className="absolute z-10 aspect-[1.37/1] text-white shadow-2xl rounded-[32px] flex flex-col justify-between w-[15em] p-3 overflow-hidden transform -translate-y-[10%] scale-45">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/681a6bc8b6a3fdb16071ee0a_cfp-bri.avif"
              alt="Bri, CFP®"
              className="w-full h-full object-cover rounded-xl"
            />
            <video 
              loop 
              autoPlay 
              muted 
              playsInline
              className="absolute inset-0 z-10 w-full h-full object-cover"
            >
              <source src="https://d1pwidzl9kib4u.cloudfront.net/marketing/video/web_graphics/20250512_Fruitful_Web_Get_Comfortable_Bri.mp4" />
            </video>
          </div>
          <div className="w-1 h-[16px] ml-auto relative z-20">
            <svg width="100%" viewBox="0 0 4 18" fill="none" className="text-white">
              <circle cx="2" cy="2" r="2" fill="currentColor" />
              <circle cx="2" cy="9" r="2" fill="currentColor" />
              <circle cx="2" cy="16" r="2" fill="currentColor" />
            </svg>
          </div>
          <span className="text-sm leading-4 z-10 relative tracking-[-0.064px]">Bri, CFP®</span>
        </div>

        {/* You Card */}
        <div className="absolute bottom-0 right-0 z-0 aspect-[1.37/1] text-white shadow-2xl rounded-[32px] flex flex-col justify-between w-[15em] p-3 overflow-hidden transform translate-y-[10%] scale-45">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/681a6bcaa95d657b0124b2e5_cfp-you.avif"
              alt="You"
              className="w-full h-full object-cover rounded-xl"
            />
            <video 
              loop 
              autoPlay 
              muted 
              playsInline
              className="absolute inset-0 z-10 w-full h-full object-cover"
            >
              <source src="https://d1pwidzl9kib4u.cloudfront.net/marketing/video/web_graphics/20250512_Fruitful_Web_Get_Comfortable_Member.mp4" />
            </video>
          </div>
          <div className="w-1 h-[16px] ml-auto relative z-20">
            <svg width="100%" viewBox="0 0 4 18" fill="none" className="text-white">
              <circle cx="2" cy="2" r="2" fill="currentColor" />
              <circle cx="2" cy="9" r="2" fill="currentColor" />
              <circle cx="2" cy="16" r="2" fill="currentColor" />
            </svg>
          </div>
          <span className="text-sm leading-4 z-10 relative tracking-[-0.064px]">You</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCards;

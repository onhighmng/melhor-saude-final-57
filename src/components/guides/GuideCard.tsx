
import React from 'react';

interface GuideCardProps {
  guide: {
    name: string;
    image: string;
    video: string;
    traits: string[];
  };
  index: number;
}

const GuideCard: React.FC<GuideCardProps> = ({ guide, index }) => {
  return (
    <div
      className={`relative aspect-[1/1.3] w-[calc(33.3333%-0.67rem)] group cursor-pointer transition-all duration-300 ${
        index === 1 ? 'z-[100] hover:scale-110 hover:rotate-12' : ''
      }`}
    >
      <div 
        className="bg-[#fee9d1] rounded-[10px] w-full h-full relative overflow-hidden"
        aria-label={guide.name}
      >
        <img
          src={guide.image}
          alt={guide.name}
          className="object-cover rounded-xl w-full h-full transition-opacity duration-300"
          loading="lazy"
        />
        <video
          width="100%"
          height="100%"
          muted
          playsInline
          loop
          className="absolute inset-0 z-0 opacity-0 object-cover rounded-xl w-full h-full group-hover:opacity-100 transition-opacity duration-300"
        >
          <source src={guide.video} />
        </video>
        
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-start items-start gap-2 text-white bg-gradient-to-t from-[#433123] to-transparent p-5">
          <h2 className="text-xs leading-[13.8px] tracking-[-0.048px] font-medium mb-0 mt-0">
            {guide.name}
          </h2>
          <div className="flex flex-wrap justify-start items-center gap-1">
            {guide.traits.map((trait, traitIndex) => (
              <div
                key={traitIndex}
                className="px-1.5 py-1.5 bg-white/40 rounded-full font-medium"
              >
                <span className="text-[8px] leading-2 tracking-[-0.032px] block">
                  {trait}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideCard;

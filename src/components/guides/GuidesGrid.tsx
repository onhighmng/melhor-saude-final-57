
import React from 'react';
import GuideCard from './GuideCard';

interface GuidesGridProps {
  guides: Array<{
    name: string;
    image: string;
    video: string;
    traits: string[];
  }>;
  isVisible: boolean;
}

const GuidesGrid: React.FC<GuidesGridProps> = ({ guides, isVisible }) => {
  return (
    <div className={`absolute transition-all duration-1000 ${
      isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`}>
      <div className="transform scale-75">
        <div className="max-w-[800px] mt-6 mx-auto">
          <div className="flex flex-wrap justify-center items-start gap-3">
            {guides.map((guide, index) => (
              <GuideCard key={index} guide={guide} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidesGrid;

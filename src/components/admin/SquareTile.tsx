import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SquareTileProps {
  title: string;
  subtitle: string;
  onClick: () => void;
}

const SquareTile: React.FC<SquareTileProps> = ({ title, subtitle, onClick }) => {
  return (
    <div 
      className="aspect-square rounded-2xl shadow-lg bg-white/80 backdrop-blur p-6 hover:shadow-xl transition cursor-pointer group"
      onClick={onClick}
    >
      <div className="h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-baskervville text-xl font-semibold text-foreground mb-2 leading-tight">
              {title}
            </h3>
            <p className="font-maname text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
        </div>
      </div>
    </div>
  );
};

export default SquareTile;
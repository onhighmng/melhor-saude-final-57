
import React from 'react';

interface FinancialSystemCardProps {
  isVisible: boolean;
}

const FinancialSystemCard: React.FC<FinancialSystemCardProps> = ({ isVisible }) => {
  return (
    <div className={`absolute transition-all duration-1000 ${
      isVisible ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-90'
    }`}
    style={{
      transform: isVisible ? 'matrix(1, 0, 0, 1, 0, 0)' : 'matrix(0.9, 0, 0, 0.9, 0, 75.68)'
    }}>
      <div className="aspect-[1/1.75] bg-soft-white shadow-2xl rounded-3xl flex justify-center items-center w-[10em] relative overflow-hidden border border-cool-grey/10">
        <div className="w-[8em] h-[8em] flex items-center justify-center">
          <img 
            src="https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/681e5ffabb30040a02ba6091_20250507_Fruitful_Money_Map_Graphic_Web.png"
            alt="Financial System"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialSystemCard;

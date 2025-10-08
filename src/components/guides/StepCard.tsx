import React from 'react';

interface StepCardProps {
  step: {
    title: string;
    description: string;
  };
  index: number;
  currentStep: number;
}

const StepCard: React.FC<StepCardProps> = ({ step, index, currentStep }) => {
  return (
    <div
      className={`absolute left-0 max-w-[320px] p-6 bg-soft-white/40 backdrop-blur-[20px] rounded-[24px] flex flex-col gap-2 transition-all duration-1000 border border-cool-grey/20 ${
        index === currentStep 
          ? 'opacity-[0.9323] visible' 
          : 'opacity-0 invisible'
      }`}
      style={{
        transform: index === currentStep 
          ? 'matrix(1, 0, 0, 1, 0, 3.55551)' 
          : index > currentStep 
            ? 'matrix(1, 0, 0, 1, 0, 48)'
            : 'matrix(1, 0, 0, 1, 0, 60)'
      }}
    >
      <h3 className="text-[28px] font-semibold leading-[36px] mb-0 mt-0 text-navy-blue">
        {step.title}
      </h3>
      <p className="text-sm leading-[20px] tracking-[-0.056px] mb-0 mt-0 text-navy-blue">
        {step.description}
      </p>
    </div>
  );
};

export default StepCard;

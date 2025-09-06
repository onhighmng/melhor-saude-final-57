
import React from 'react';
import { Heart, Scale, DollarSign, Users, CheckCircle, Clock } from 'lucide-react';

interface NeverStressSectionProps {
  isVisible: boolean;
}

const NeverStressSection: React.FC<NeverStressSectionProps> = ({ isVisible }) => {
  return (
    <div className={`relative z-10 flex items-center justify-center min-h-screen overflow-hidden ${
      isVisible ? 'block' : 'hidden'
    }`}>
      <div className="relative z-10 perspective-1000 text-navy-blue flex flex-col items-center gap-8">
        {/* Content Section */}
        <div className="text-center flex flex-col items-center gap-3 mb-6">
          <h4 className="font-semibold text-xl lg:text-2xl leading-tight tracking-tight mb-2">
            Apoio Contínuo Garantido
          </h4>
          <p className="text-sm leading-5 tracking-tight opacity-80 max-w-md">
            Os nossos especialistas acompanham o seu progresso<br />
            e ajustam o plano sempre que necessário.
          </p>
        </div>

        {/* Visual Illustration Section */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Central Hub */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-20 h-20 bg-mint-green rounded-full flex items-center justify-center shadow-lg border-2 border-navy-blue/10">
              <Users className="w-8 h-8 text-navy-blue" />
            </div>
          </div>

          {/* Support Services positioned in a clean circle layout */}
          {/* Top - Psychology */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
            <div className="w-16 h-16 bg-soft-white rounded-full flex items-center justify-center shadow-md border-2 border-mint-green/30">
              <Heart className="w-6 h-6 text-navy-blue" />
            </div>
            <p className="text-sm text-center mt-3 font-medium text-navy-blue">Psicologia</p>
          </div>

          {/* Right - Legal */}
          <div className="absolute top-1/2 right-8 transform -translate-y-1/2 flex flex-col items-center z-10">
            <div className="w-16 h-16 bg-soft-white rounded-full flex items-center justify-center shadow-md border-2 border-mint-green/30">
              <Scale className="w-6 h-6 text-navy-blue" />
            </div>
            <p className="text-sm text-center mt-3 font-medium text-navy-blue">Jurídico</p>
          </div>

          {/* Bottom - Finance */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
            <div className="w-16 h-16 bg-soft-white rounded-full flex items-center justify-center shadow-md border-2 border-mint-green/30">
              <DollarSign className="w-6 h-6 text-navy-blue" />
            </div>
            <p className="text-sm text-center mt-3 font-medium text-navy-blue">Finanças</p>
          </div>

          {/* Left - Health */}
          <div className="absolute top-1/2 left-8 transform -translate-y-1/2 flex flex-col items-center z-10">
            <div className="w-16 h-16 bg-soft-white rounded-full flex items-center justify-center shadow-md border-2 border-mint-green/30">
              <CheckCircle className="w-6 h-6 text-navy-blue" />
            </div>
            <p className="text-sm text-center mt-3 font-medium text-navy-blue">Saúde</p>
          </div>

          {/* Clean Connection Lines */}
          <div className="absolute inset-0 z-0">
            <svg className="w-full h-full" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
              {/* Clean straight lines from center to each service */}
              <line 
                x1="160" y1="160" 
                x2="160" y2="40" 
                stroke="hsl(var(--mint-green))" 
                strokeWidth="2" 
                strokeDasharray="8,6" 
                opacity="0.6" 
              />
              
              <line 
                x1="160" y1="160" 
                x2="280" y2="160" 
                stroke="hsl(var(--mint-green))" 
                strokeWidth="2" 
                strokeDasharray="8,6" 
                opacity="0.6" 
              />
              
              <line 
                x1="160" y1="160" 
                x2="160" y2="280" 
                stroke="hsl(var(--mint-green))" 
                strokeWidth="2" 
                strokeDasharray="8,6" 
                opacity="0.6" 
              />
              
              <line 
                x1="160" y1="160" 
                x2="40" y2="160" 
                stroke="hsl(var(--mint-green))" 
                strokeWidth="2" 
                strokeDasharray="8,6" 
                opacity="0.6" 
              />
            </svg>
          </div>
        </div>

        {/* Progress indicator - moved further down for better spacing */}
        <div className="mt-8 z-20">
          <div className="flex items-center gap-3 bg-soft-white/90 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg border border-mint-green/20">
            <Clock className="w-5 h-5 text-mint-green" />
            <span className="text-sm font-medium text-navy-blue">24/7 Disponível</span>
          </div>
        </div>
      </div>

      {/* Constrained Decorative Elements */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {/* Light rays - contained within section bounds */}
        <div className="absolute w-[50vw] h-6 bg-gradient-to-r from-soft-white/20 to-transparent opacity-30 transform rotate-[15deg] left-0" />
        <div className="absolute w-[50vw] h-3 bg-gradient-to-r from-soft-white/30 to-transparent opacity-40 transform rotate-[15deg] left-0 -translate-y-16" />
        
        {/* Blurred circles - smaller and better positioned */}
        <div className="absolute w-[15em] h-[15em] bg-soft-white/20 rounded-full blur-[30px] -translate-x-24 -translate-y-24" />
        <div className="absolute w-[2em] h-[2em] bg-soft-white/30 rounded-full blur-[4px] -translate-x-[80px] -translate-y-[15px]" />
        <div className="absolute w-[1em] h-[1em] bg-soft-white/30 rounded-full blur-[4px] -translate-x-[60px] translate-y-[10px]" />
      </div>
    </div>
  );
};

export default NeverStressSection;

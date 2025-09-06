
import React from 'react';
import { Provider } from '@/types/provider';
import ProviderVideoCard from './ProviderVideoCard';

interface ProviderCardProps {
  provider: Provider;
  index: number;
  videoData: {
    hoverVideo: string;
    fullVideo: string;
    message: string;
  };
  onViewProfile: (providerId: string) => void;
  onVideoClick: (provider: Provider, index: number) => void;
  onMouseEnter: (index: number) => void;
  onMouseLeave: (index: number) => void;
  videoRef: (el: HTMLVideoElement | null) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  index,
  videoData,
  onViewProfile,
  onVideoClick,
  onMouseEnter,
  onMouseLeave,
  videoRef
}) => {
  // Modern gradient combinations with new accent colors
  const cardVariants = [
    'from-soft-white via-accent-sage/8 to-vibrant-blue/5',
    'from-soft-white via-accent-sky/8 to-emerald-green/5',
    'from-soft-white via-vibrant-blue/5 to-accent-sage/8'
  ];
  
  const borderVariants = [
    'border-accent-sage/25 hover:border-accent-sage/45',
    'border-accent-sky/25 hover:border-accent-sky/45',
    'border-vibrant-blue/25 hover:border-vibrant-blue/45'
  ];

  const buttonVariants = [
    'from-accent-sage to-vibrant-blue hover:from-vibrant-blue hover:to-accent-sage shadow-accent-sage/25',
    'from-accent-sky to-bright-royal hover:from-bright-royal hover:to-accent-sky shadow-accent-sky/25',
    'from-vibrant-blue to-accent-sage hover:from-accent-sage hover:to-vibrant-blue shadow-vibrant-blue/25'
  ];

  const cardVariant = cardVariants[index % cardVariants.length];
  const borderVariant = borderVariants[index % borderVariants.length];
  const buttonVariant = buttonVariants[index % buttonVariants.length];

  return (
    <div 
      className={`bg-gradient-to-br ${cardVariant} rounded-2xl p-8 shadow-[0_24px_48px_rgba(0,0,0,0.04),0_12px_24px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_32px_64px_rgba(0,0,0,0.08),0_16px_32px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] border ${borderVariant} transition-all duration-500 animate-fade-in hover:scale-[1.02] backdrop-blur-sm relative overflow-hidden group`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Subtle background accent with new colors */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${
        index % 3 === 0 ? 'from-accent-sage/15' :
        index % 3 === 1 ? 'from-accent-sky/15' : 'from-vibrant-blue/15'
      } to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      <div className="flex flex-col items-center text-center relative z-10">
        {/* Enhanced Provider Profile Picture */}
        <div className={`w-28 h-28 mb-6 rounded-2xl overflow-hidden border-2 ${
          index % 3 === 0 ? 'border-accent-sage/35' :
          index % 3 === 1 ? 'border-accent-sky/35' : 'border-vibrant-blue/35'
        } shadow-xl relative group-hover:scale-105 transition-transform duration-300`}>
          <img 
            src={provider.photo} 
            alt={provider.name}
            className="w-full h-full object-cover"
          />
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        {/* Enhanced Video Section */}
        <div className="w-full mb-6">
          <ProviderVideoCard
            videoData={videoData}
            index={index}
            onVideoClick={() => onVideoClick(provider, index)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            videoRef={videoRef}
          />
        </div>
        
        {/* Modern Typography Hierarchy */}
        <h3 className="font-bold text-2xl lg:text-3xl leading-tight mb-3 text-deep-navy tracking-tight">
          {provider.name}
        </h3>
        
        <p className={`font-semibold text-base lg:text-lg leading-tight mb-4 ${
          index % 3 === 0 ? 'text-accent-sage' :
          index % 3 === 1 ? 'text-accent-sky' : 'text-vibrant-blue'
        }`}>
          {provider.specialization}
        </p>
        
        <p className="text-sm md:text-base leading-relaxed tracking-tight mb-6 text-slate-grey max-w-xs">
          {provider.shortBio}
        </p>
        
        {/* Modern Specialty Tags with new accent colors */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {provider.specialties.slice(0, 2).map((specialty, i) => (
            <span 
              key={i}
              className={`text-xs font-medium px-4 py-2 rounded-full border transition-all duration-300 hover:scale-105 ${
                index % 3 === 0 ? 'bg-accent-sage/12 text-accent-sage border-accent-sage/30 hover:bg-accent-sage/18' :
                index % 3 === 1 ? 'bg-accent-sky/12 text-accent-sky border-accent-sky/30 hover:bg-accent-sky/18' :
                'bg-vibrant-blue/12 text-vibrant-blue border-vibrant-blue/30 hover:bg-vibrant-blue/18'
              }`}
            >
              {specialty}
            </span>
          ))}
        </div>
        
        {/* Enhanced Modern Button with new gradient combinations */}
        <button 
          onClick={() => onViewProfile(provider.id)}
          className={`text-white rounded-2xl px-8 py-4 text-base lg:text-lg font-semibold tracking-tight transition-all duration-300 bg-gradient-to-r ${buttonVariant} hover:scale-105 hover:shadow-2xl relative overflow-hidden group/btn min-w-[180px]`}
        >
          <span className="relative z-10">Ver Perfil</span>
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
        </button>
      </div>
    </div>
  );
};

export default ProviderCard;


import React, { useRef } from 'react';
import { Provider } from '@/types/provider';
import ProviderCard from './ProviderCard';

interface ProvidersGridProps {
  providers: Provider[];
  onViewProfile: (providerId: string) => void;
}

const ProvidersGrid = ({ providers, onViewProfile }: ProvidersGridProps) => {

  return (
    <section className="relative bg-gradient-to-b from-vibrant-blue/8 via-soft-white to-emerald-green/10 pb-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-bright-royal/8 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-20 w-40 h-40 bg-gradient-to-br from-emerald-green/6 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-gradient-to-br from-vibrant-blue/5 to-transparent rounded-full blur-2xl"></div>
      
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.map((provider) => (
            <div
              key={provider.id}
              onClick={() => onViewProfile(provider.id)}
              className="bg-soft-white rounded-xl p-6 shadow-sm border border-sky-blue/10 hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={provider.photo} 
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <h3 className="font-semibold text-xl text-navy-blue mb-2 group-hover:text-royal-blue transition-colors">
                    {provider.name}
                  </h3>
                  <p className="text-royal-blue text-base mb-3">
                    {provider.specialization}
                  </p>
                  <p className="text-navy-blue/70 text-sm leading-relaxed">
                    {provider.shortBio}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {provider.specialties.slice(0, 3).map((specialty, idx) => (
                    <span 
                      key={idx}
                      className="bg-sky-blue/20 text-navy-blue text-xs px-2 py-1 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                  {provider.specialties.length > 3 && (
                    <span className="bg-accent-sage/20 text-navy-blue text-xs px-2 py-1 rounded-full">
                      +{provider.specialties.length - 3}
                    </span>
                  )}
                </div>
                
                <button className="mt-4 bg-gradient-to-r from-royal-blue to-vibrant-blue text-soft-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-md transition-all duration-300 group-hover:scale-105">
                  Ver Perfil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProvidersGrid;

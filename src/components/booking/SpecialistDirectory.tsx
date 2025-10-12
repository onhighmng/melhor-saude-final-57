import React from 'react';
import { mockProviders } from '@/data/mockData';
import { BookingPillar } from './BookingFlow';
import { ArrowLeft, Star } from 'lucide-react';

interface MockProvider {
  id: string;
  name: string;
  specialty: string;
  pillar: string;
  avatar_url: string;
  rating: number;
  experience: string;
  availability: string;
}

interface SpecialistDirectoryProps {
  pillar: BookingPillar;
  onProviderSelect: (provider: MockProvider) => void;
  onBack: () => void;
}

const SpecialistDirectory = ({ pillar, onProviderSelect, onBack }: SpecialistDirectoryProps) => {
  const pillarMapping = {
    'psicologica': 'saude_mental',
    'fisica': 'bem_estar_fisico',
    'financeira': 'assistencia_financeira',
    'juridica': 'assistencia_juridica'
  };

  const pillarNames = {
    'psicologica': 'Saúde Mental',
    'fisica': 'Bem-estar Físico',
    'financeira': 'Assistência Financeira',
    'juridica': 'Assistência Jurídica'
  };

  const mappedPillar = pillarMapping[pillar];
  const pillarName = pillarNames[pillar];
  const filteredProviders = mockProviders.filter(provider => 
    provider.pillar === mappedPillar
  );

  return (
    <div className="min-h-screen bg-soft-white text-navy-blue font-medium antialiased" style={{ fontFamily: "'PP Neue Montreal', sans-serif" }}>
      <section className="relative pt-32 pb-24">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={onBack}
            className="inline-flex items-center text-royal-blue hover:text-navy-blue transition-colors duration-200 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Pilares
          </button>

          <div className="text-center mb-16">
            <h1 className="font-semibold text-4xl sm:text-5xl leading-tight mb-6 text-navy-blue animate-fade-in">
              Especialistas de {pillarName}
            </h1>
            <p className="font-medium text-xl lg:text-2xl leading-tight text-royal-blue">
              Escolha o especialista ideal para si
            </p>
          </div>

          {filteredProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProviders.map((provider, index) => (
                <div 
                  key={provider.id}
                  className="bg-gradient-to-br from-soft-white via-accent-sage/8 to-vibrant-blue/5 rounded-2xl p-6 shadow-[0_24px_48px_rgba(0,0,0,0.04)] hover:shadow-[0_32px_64px_rgba(0,0,0,0.08)] border border-accent-sage/25 hover:border-accent-sage/45 transition-all duration-500 animate-fade-in hover:scale-[1.02] group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => onProviderSelect(provider)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 mb-4 rounded-2xl overflow-hidden border-2 border-accent-sage/35 shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <img 
                        src={provider.avatar_url} 
                        alt={provider.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <h3 className="font-bold text-xl lg:text-2xl leading-tight mb-2 text-deep-navy tracking-tight">
                      {provider.name}
                    </h3>
                    
                    <p className="font-semibold text-base lg:text-lg leading-tight mb-3 text-accent-sage">
                      {provider.specialty}
                    </p>
                    
                    <p className="text-sm md:text-base leading-relaxed tracking-tight mb-4 text-slate-grey">
                      {provider.experience} anos de experiência
                    </p>
                    
                    <div className="flex items-center mb-4">
                      <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                      <span className="text-sm font-medium">{provider.rating}</span>
                    </div>
                    
                    <div className="text-white rounded-2xl px-6 py-3 text-base lg:text-lg font-semibold tracking-tight transition-all duration-300 bg-gradient-to-r from-accent-sage to-vibrant-blue hover:from-vibrant-blue hover:to-accent-sage hover:scale-105 hover:shadow-2xl relative overflow-hidden group/btn min-w-[140px]">
                      <span className="relative z-10">Agendar</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Não há especialistas disponíveis no momento para este pilar.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SpecialistDirectory;

import React from 'react';
import BackButton from '@/components/navigation/BackButton';
import { BookingPillar } from './BookingFlow';
import { Brain, Heart, DollarSign, Scale } from 'lucide-react';

interface PillarSelectionProps {
  onPillarSelect: (pillar: BookingPillar) => void;
}

const PillarSelection = ({ onPillarSelect }: PillarSelectionProps) => {
  const pillars = [
    {
      id: 'psicologica' as BookingPillar,
      icon: Brain,
      title: 'Saúde Mental',
      description: 'Apoio psicológico e bem-estar emocional',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-700',
      hoverColor: 'hover:from-purple-600 hover:to-purple-800'
    },
    {
      id: 'fisica' as BookingPillar,
      icon: Heart,
      title: 'Bem-estar Físico',
      description: 'Saúde física e qualidade de vida',
      bgColor: 'bg-gradient-to-br from-green-500 to-green-700',
      hoverColor: 'hover:from-green-600 hover:to-green-800'
    },
    {
      id: 'financeira' as BookingPillar,
      icon: DollarSign,
      title: 'Assistência Financeira',
      description: 'Consultoria financeira e planeamento',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700',
      hoverColor: 'hover:from-blue-600 hover:to-blue-800'
    },
    {
      id: 'juridica' as BookingPillar,
      icon: Scale,
      title: 'Assistência Jurídica',
      description: 'Apoio e aconselhamento legal',
      bgColor: 'bg-gradient-to-br from-amber-500 to-amber-700',
      hoverColor: 'hover:from-amber-600 hover:to-amber-800'
    }
  ];

  return (
    <div className="min-h-screen bg-soft-white text-navy-blue font-medium antialiased" style={{ fontFamily: "'PP Neue Montreal', sans-serif" }}>
      <section className="relative pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl mx-auto">
          
          {/* Back Button positioned above the title */}
          <div className="mb-6">
            <BackButton />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="font-semibold text-2xl sm:text-3xl leading-tight mb-3 text-navy-blue animate-fade-in">
              Como podemos ajudar?
            </h1>
            <p className="font-medium text-base text-royal-blue">
              Selecione a área em que precisa de apoio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pillars.map((pillar, index) => {
              const IconComponent = pillar.icon;
              return (
                <button
                  key={pillar.id}
                  onClick={() => onPillarSelect(pillar.id)}
                  className={`${pillar.bgColor} ${pillar.hoverColor} rounded-xl p-6 shadow-lg hover:shadow-xl border border-white/20 transition-all duration-300 hover:scale-105 group text-left min-h-[160px] flex flex-col`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-center mb-4">
                    <IconComponent className="h-10 w-10 text-white drop-shadow-sm" />
                  </div>
                  <h3 className="font-bold text-xl leading-tight mb-3 text-white drop-shadow-sm group-hover:text-white/95 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-base leading-relaxed text-white/90 drop-shadow-sm group-hover:text-white/80 transition-colors flex-1">
                    {pillar.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PillarSelection;

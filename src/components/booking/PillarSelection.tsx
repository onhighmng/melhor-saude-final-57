import React from 'react';
import { BookingPillar } from './BookingFlow';
import { Brain, Heart, DollarSign, Scale, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PillarSelectionProps {
  onPillarSelect: (pillar: BookingPillar) => void;
}

const PillarSelection = ({ onPillarSelect }: PillarSelectionProps) => {
  const navigate = useNavigate();

  const handleBackToHealth = () => {
    navigate('/');
  };

  const pillars = [
    {
      id: 'psicologica' as BookingPillar,
      icon: Brain,
      title: 'Saúde Mental',
      description: 'Apoio psicológico e bem-estar emocional',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700',
      hoverColor: 'hover:from-blue-600 hover:to-blue-800'
    },
    {
      id: 'fisica' as BookingPillar,
      icon: Heart,
      title: 'Bem-estar Físico',
      description: 'Saúde física e qualidade de vida',
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-700',
      hoverColor: 'hover:from-orange-600 hover:to-orange-800'
    },
    {
      id: 'financeira' as BookingPillar,
      icon: DollarSign,
      title: 'Assistência Financeira',
      description: 'Consultoria financeira e planeamento',
      bgColor: 'bg-gradient-to-br from-green-500 to-green-700',
      hoverColor: 'hover:from-green-600 hover:to-green-800'
    },
    {
      id: 'juridica' as BookingPillar,
      icon: Scale,
      title: 'Assistência Jurídica',
      description: 'Apoio e aconselhamento legal',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-700',
      hoverColor: 'hover:from-purple-600 hover:to-purple-800'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Blue gradient background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1600 900\'%3E%3Cdefs%3E%3ClinearGradient id=\'blueGrad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23F0F9FF;stop-opacity:1\' /%3E%3Cstop offset=\'20%25\' style=\'stop-color:%23E0F2FE;stop-opacity:1\' /%3E%3Cstop offset=\'40%25\' style=\'stop-color:%23BAE6FD;stop-opacity:1\' /%3E%3Cstop offset=\'60%25\' style=\'stop-color:%237DD3FC;stop-opacity:1\' /%3E%3Cstop offset=\'80%25\' style=\'stop-color:%2338BDF8;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%230EA5E9;stop-opacity:1\' /%3E%3C/linearGradient%3E%3CradialGradient id=\'highlight\' cx=\'50%25\' cy=\'20%25\' r=\'60%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23FFFFFF;stop-opacity:0.3\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23FFFFFF;stop-opacity:0\' /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width=\'1600\' height=\'900\' fill=\'url(%23blueGrad)\'/%3E%3Crect width=\'1600\' height=\'900\' fill=\'url(%23highlight)\'/%3E%3C/svg%3E")'
        }}
      ></div>
      
      {/* Back Button */}
      <div className="relative z-10 pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <button
            onClick={handleBackToHealth}
            className="flex items-center gap-2 text-black hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg font-medium">Voltar à Minha Saúde</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black mb-4">
              Como podemos ajudar?
            </h2>
            <p className="text-xl text-black/80 max-w-3xl mx-auto">
              Selecione a área em que precisa de apoio
            </p>
          </div>
        </div>
      </div>

      {/* Pillar Cards */}
      <div className="relative z-10 pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">

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
      </div>
    </div>
  );
};

export default PillarSelection;

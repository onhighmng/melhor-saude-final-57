import { useState } from 'react';
import { ArrowLeft, Brain, Heart, DollarSign, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { MobileBottomNav } from '../shared/MobileBottomNav';

type Pillar = 'saude_mental' | 'bem_estar_fisico' | 'assistencia_financeira' | 'assistencia_juridica';

export function MobileBookingPage() {
  const navigate = useNavigate();

  const pillars = [
    {
      id: 'saude_mental' as Pillar,
      name: 'Saúde Mental',
      description: 'Apoio psicológico e bem-estar emocional',
      icon: Brain,
      bgColor: 'bg-blue-300',
      iconColor: 'text-blue-700',
    },
    {
      id: 'bem_estar_fisico' as Pillar,
      name: 'Bem-Estar Físico',
      description: 'Exercício, nutrição e saúde física',
      icon: Heart,
      bgColor: 'bg-orange-300',
      iconColor: 'text-orange-700',
    },
    {
      id: 'assistencia_financeira' as Pillar,
      name: 'Assistência Financeira',
      description: 'Gestão financeira e planeamento',
      icon: DollarSign,
      bgColor: 'bg-green-300',
      iconColor: 'text-green-700',
    },
    {
      id: 'assistencia_juridica' as Pillar,
      name: 'Assistência Jurídica',
      description: 'Aconselhamento legal e direitos',
      icon: Scale,
      bgColor: 'bg-purple-300',
      iconColor: 'text-purple-700',
    },
  ];

  const handleSelectPillar = (pillarId: Pillar) => {
    // Navigate to booking flow with selected pillar
    navigate(`/user/book?pillar=${pillarId}`);
  };

  return (
    <div className="min-h-screen bg-blue-200 pb-20">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-4">
          <button 
            onClick={() => navigate('/user/dashboard')}
            className="flex items-center gap-2 text-gray-700 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar à Minha Saúde
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-gray-900 text-3xl font-bold mb-2">Como podemos ajudar?</h1>
          <p className="text-gray-700">Selecione a área em que precisa de apoio</p>
        </div>

        {/* Grid of Pillars */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <button 
                key={pillar.id}
                onClick={() => handleSelectPillar(pillar.id)}
                className={`relative overflow-hidden ${pillar.bgColor} rounded-3xl active:scale-95 transition-transform shadow-sm`}
              >
                <div className="relative h-[200px] p-4 flex flex-col justify-end">
                  <div className={`w-12 h-12 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${pillar.iconColor}`} />
                  </div>
                  <h3 className="text-gray-900 font-semibold text-left text-base">
                    {pillar.name}
                  </h3>
                  <p className="text-gray-700 text-xs text-left mt-1">
                    {pillar.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border-none shadow-sm">
          <p className="text-gray-600 text-sm text-center">
            Escolha uma área e será conectado com um especialista qualificado
          </p>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav userType="user" />
    </div>
  );
}


import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Dumbbell, DollarSign, Scale } from 'lucide-react';

const pillars = [
  {
    id: 'saude_mental',
    name: 'Saúde Mental',
    description: 'Suporte psicológico e bem-estar emocional',
    icon: Brain,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'bem_estar_fisico',
    name: 'Bem-Estar Físico',
    description: 'Orientação física e nutricional',
    icon: Dumbbell,
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'assistencia_financeira',
    name: 'Assistência Financeira',
    description: 'Consultoria e planeamento financeiro',
    icon: DollarSign,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 'assistencia_juridica',
    name: 'Assistência Jurídica',
    description: 'Apoio legal e consultoria jurídica',
    icon: Scale,
    color: 'from-purple-500 to-purple-600'
  }
];

interface PillarSelectorProps {
  onPillarSelect: (pillar: string) => void;
}

export default function PillarSelector({ onPillarSelect }: PillarSelectorProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Escolha o seu Pilar</h1>
          <p className="text-gray-600">Selecione a área onde precisa de apoio</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {pillars.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <Card 
                key={pillar.id}
                className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => onPillarSelect(pillar.id)}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {pillar.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                  <Button 
                    className="mt-6 w-full bg-emerald-green hover:bg-emerald-green/90 hover:text-white text-white"
                    size="lg"
                  >
                    Selecionar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
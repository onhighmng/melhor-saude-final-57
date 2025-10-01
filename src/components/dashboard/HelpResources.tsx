import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Dumbbell, TrendingUp, Scale, ExternalLink, HelpCircle } from 'lucide-react';
import FullscreenModal from '@/components/admin/FullscreenModal';

const resources = [
  {
    id: 'self-help',
    title: 'Artigos de Autoajuda',
    description: 'Técnicas e dicas para o bem-estar mental',
    icon: BookOpen,
    color: 'bg-blue-500',
    count: '24 artigos'
  },
  {
    id: 'exercises',
    title: 'Exercícios Físicos',
    description: 'Rotinas e práticas para manter-se ativo',
    icon: Dumbbell,
    color: 'bg-green-500',
    count: '15 exercícios'
  },
  {
    id: 'financial',
    title: 'Guias Financeiros',
    description: 'Dicas para gestão das suas finanças',
    icon: TrendingUp,
    color: 'bg-yellow-500',
    count: '18 guias'
  },
  {
    id: 'legal',
    title: 'Orientação Jurídica',
    description: 'Informações sobre os seus direitos',
    icon: Scale,
    color: 'bg-purple-500',
    count: '12 documentos'
  }
];

export const HelpResources = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="group relative overflow-hidden border-0 shadow-custom-sm hover:shadow-custom-md transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-grey/5 opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-green/5 to-mint-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <CardHeader className="relative pb-2 pt-4" onClick={() => setIsModalOpen(true)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-green shadow-custom-sm">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Ajuda & Recursos
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Acesse conteúdos exclusivos para o seu bem-estar
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <FullscreenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajuda & Recursos"
        description="Acesse conteúdos exclusivos para o seu bem-estar"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource, index) => {
            const IconComponent = resource.icon;
            
            return (
              <Card 
                key={resource.id} 
                className="group relative overflow-hidden border-0 shadow-custom-sm hover:shadow-custom-md transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-grey/5 opacity-80"></div>
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  index === 0 ? 'from-bright-royal/5 to-vibrant-blue/10' :
                  index === 1 ? 'from-emerald-green/5 to-mint-green/10' :
                  index === 2 ? 'from-warm-orange/5 to-peach-orange/10' :
                  'from-purple-500/5 to-purple-600/10'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <CardHeader className="relative pb-2 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${resource.color} shadow-custom-sm group-hover:shadow-custom-md transition-all duration-300`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-bright-royal transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-foreground leading-tight">
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative space-y-3 pb-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className="text-xs font-medium bg-bright-royal/10 text-bright-royal hover:bg-bright-royal/20 border-bright-royal/20 py-1"
                    >
                      {resource.count}
                    </Badge>
                    <div className="text-xs text-bright-royal font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explorar →
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </FullscreenModal>
    </>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Brain, Heart, DollarSign, Scale, Users } from 'lucide-react';
import FullscreenModal from '@/components/admin/FullscreenModal';

const pillars = [
  {
    id: 'mental',
    title: 'Saúde Mental',
    icon: Brain,
    color: 'bg-blue-500',
    provider: {
      name: 'Dr. Ana Silva',
      avatar: '/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png',
      specialty: 'Psicóloga Clínica'
    }
  },
  {
    id: 'physical',
    title: 'Bem-Estar Físico',
    icon: Heart,
    color: 'bg-green-500',
    provider: null // No provider assigned yet
  },
  {
    id: 'financial',
    title: 'Assistência Financeira',
    icon: DollarSign,
    color: 'bg-yellow-500',
    provider: {
      name: 'Carlos Santos',
      avatar: '/lovable-uploads/085a608e-3a3e-45e5-898b-2f9b4c0f7f67.png',
      specialty: 'Consultor Financeiro'
    }
  },
  {
    id: 'legal',
    title: 'Assistência Jurídica',
    icon: Scale,
    color: 'bg-purple-500',
    provider: null // No provider assigned yet
  }
];

export const ProviderPillars = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="group relative overflow-hidden border-0 shadow-custom-sm hover:shadow-custom-md transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-grey/5 opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-bright-royal/5 to-vibrant-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <CardHeader className="relative pb-2 pt-4" onClick={() => setIsModalOpen(true)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-bright-royal shadow-custom-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Seus Prestadores por Pilar
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Profissionais dedicados ao seu bem-estar
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <FullscreenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Seus Prestadores por Pilar"
        description="Profissionais dedicados ao seu bem-estar em cada área"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((pillar, index) => {
            const IconComponent = pillar.icon;
            
            return (
              <Card 
                key={pillar.id} 
                className="group relative overflow-hidden border-0 shadow-custom-sm hover:shadow-custom-md transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-grey/5 opacity-80"></div>
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  index === 0 ? 'from-blue-500/5 to-blue-600/10' :
                  index === 1 ? 'from-green-500/5 to-green-600/10' :
                  index === 2 ? 'from-yellow-500/5 to-orange-500/10' :
                  'from-purple-500/5 to-purple-600/10'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <CardHeader className="relative pb-2 pt-4">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${pillar.color} shadow-custom-sm`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-foreground leading-tight">
                      {pillar.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="relative space-y-3 pb-4">
                  {pillar.provider ? (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Avatar className="w-10 h-10 border border-white shadow-custom-sm">
                          <AvatarImage 
                            src={pillar.provider.avatar} 
                            alt={pillar.provider.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-bright-royal to-vibrant-blue text-white text-xs font-semibold">
                            {pillar.provider.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-medium text-xs text-foreground leading-tight">
                            {pillar.provider.name}
                          </p>
                          <p className="text-xs text-muted-foreground leading-tight">
                            {pillar.provider.specialty}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="w-full justify-center text-xs font-medium bg-emerald-green/10 text-emerald-green hover:bg-emerald-green/20 border-emerald-green/20 py-1">
                        Prestador Fixo
                      </Badge>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-slate-grey/10 to-slate-grey/20 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Sem prestador</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs font-medium border-bright-royal/20 text-bright-royal hover:bg-bright-royal/5 hover:border-bright-royal/40 transition-colors duration-200 h-7"
                        >
                          Atribuir na 1ª Sessão
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </FullscreenModal>
    </>
  );
};
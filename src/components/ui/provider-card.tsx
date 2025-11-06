import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Brain, Dumbbell, DollarSign, Scale, CheckCircle, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const pillarIcons = {
  'saude_mental': Brain,
  'bem_estar_fisico': Dumbbell,
  'assistencia_financeira': DollarSign,
  'assistencia_juridica': Scale
};

const pillarColors = {
  'saude_mental': 'text-blue-600 bg-blue-100',
  'bem_estar_fisico': 'text-yellow-600 bg-yellow-100',
  'assistencia_financeira': 'text-green-600 bg-green-100',
  'assistencia_juridica': 'text-purple-600 bg-purple-100'
};

const pillarNames = {
  'saude_mental': 'Saúde Mental',
  'bem_estar_fisico': 'Bem-Estar Físico',
  'assistencia_financeira': 'Assistência Financeira',
  'assistencia_juridica': 'Assistência Jurídica'
};

interface Provider {
  id: string;
  name: string;
  photo?: string;
  specialty: string;
  pillar?: keyof typeof pillarIcons;
  email?: string;
  phone?: string;
  isAvailable?: boolean;
}

interface ProviderCardProps {
  provider: Provider;
  showContact?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProviderCard({ 
  provider, 
  showContact = false, 
  className,
  size = 'md' 
}: ProviderCardProps) {
  const Icon = provider.pillar ? pillarIcons[provider.pillar] : Brain;
  const iconColor = provider.pillar ? pillarColors[provider.pillar] : pillarColors.saude_mental;
  const pillarName = provider.pillar ? pillarNames[provider.pillar] : provider.specialty;

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6', 
    lg: 'p-8'
  };

  const avatarSizes = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  };

  return (
    <Card className={cn(
      "border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300",
      className
    )}>
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className={avatarSizes[size]}>
              <AvatarImage 
                src={provider.photo} 
                alt={provider.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-100 text-gray-600">
                {provider.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {provider.pillar && (
              <div className={cn(
                "absolute -bottom-2 -right-2 rounded-full p-1.5 shadow-lg",
                iconColor
              )}>
                <Icon className="h-3 w-3" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                "font-semibold text-gray-900 truncate",
                size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-xl'
              )}>
                {provider.name}
              </h3>
              {provider.isAvailable && (
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              )}
            </div>
            
            <p className="text-sm text-blue-600 font-medium mb-2">
              {pillarName}
            </p>
            
            <div className="flex items-center gap-2 mb-3">
              <Badge 
                variant="outline" 
                className="text-xs bg-green-50 text-green-700 border-green-200"
              >
                Affiliate atribuído
              </Badge>
            </div>

            {showContact && (provider.email || provider.phone) && (
              <div className="space-y-1">
                {provider.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{provider.email}</span>
                  </div>
                )}
                {provider.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="h-3 w-3" />
                    <span>{formatPhoneNumber(provider.phone)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
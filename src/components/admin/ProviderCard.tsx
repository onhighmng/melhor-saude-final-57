
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Users } from 'lucide-react';
import { Provider } from '@/types/provider';

interface ProviderCardProps {
  provider: Provider;
  onEdit: (provider: Provider) => void;
}

const ProviderCard = ({ provider, onEdit }: ProviderCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
            <img 
              src={provider.photo || '/placeholder.svg'} 
              alt={provider.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
          
          <h3 className="font-semibold text-lg mb-2 text-navy-blue">
            {provider.name}
          </h3>
          
          <p className="text-sm text-royal-blue mb-2">
            {provider.specialization}
          </p>
          
          <p className="text-xs text-navy-blue opacity-80 mb-4">
            {provider.shortBio}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-sky-blue/20 text-navy-blue">
              <Users className="w-3 h-3 mr-1" />
              {provider.activeCases} casos ativos
            </Badge>
          </div>
          
          
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-4"
            onClick={() => onEdit(provider)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderCard;

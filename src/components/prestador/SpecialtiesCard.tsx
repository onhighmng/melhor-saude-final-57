
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from 'lucide-react';
import { Provider } from '@/types/provider';

interface SpecialtiesCardProps {
  provider: Provider;
  onEditRequest: (field: string, fieldLabel: string, currentValue: string) => void;
}

const SpecialtiesCard = ({ provider, onEditRequest }: SpecialtiesCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-navy-blue">Especialidades</h3>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onEditRequest('specialties', 'Especialidades', provider.specialties.join(', '))}
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {provider.specialties.map((specialty, index) => (
            <Badge key={index} variant="secondary" className="bg-sky-blue/20 text-navy-blue">
              {specialty}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpecialtiesCard;


import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';
import { Provider } from '@/types/provider';

interface BiographyCardProps {
  provider: Provider;
  onEditRequest: (field: string, fieldLabel: string, currentValue: string) => void;
}

const BiographyCard = ({ provider, onEditRequest }: BiographyCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-navy-blue">Biografia</h3>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onEditRequest('fullBio', 'Biografia Completa', provider.fullBio)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
        </div>
        <p className="text-base leading-relaxed text-navy-blue opacity-80">
          {provider.fullBio}
        </p>
      </CardContent>
    </Card>
  );
};

export default BiographyCard;

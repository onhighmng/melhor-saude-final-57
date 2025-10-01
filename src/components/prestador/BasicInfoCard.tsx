
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';
import { Provider } from '@/types/provider';

interface BasicInfoCardProps {
  provider: Provider;
  onEditRequest: (field: string, fieldLabel: string, currentValue: string) => void;
}

const BasicInfoCard = ({ provider, onEditRequest }: BasicInfoCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-navy-blue">Nome</h3>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onEditRequest('name', 'Nome', provider.name)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
          </div>
          <p className="text-xl font-semibold text-navy-blue">{provider.name}</p>
          
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-navy-blue">Especialização</h3>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onEditRequest('specialization', 'Especialização', provider.specialization)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
          </div>
          <p className="text-lg text-royal-blue">{provider.specialization}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoCard;


import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';
import { Provider } from '@/types/provider';

interface ProfilePhotoCardProps {
  provider: Provider;
  onEditRequest: (field: string, fieldLabel: string, currentValue: string) => void;
}

const ProfilePhotoCard = ({ provider, onEditRequest }: ProfilePhotoCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-navy-blue">Foto de Perfil</h3>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onEditRequest('photo', 'Foto de Perfil', provider.photo)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            <img 
              src={provider.photo} 
              alt={provider.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm text-navy-blue opacity-80">
              Esta é a foto que aparece no seu perfil público
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePhotoCard;

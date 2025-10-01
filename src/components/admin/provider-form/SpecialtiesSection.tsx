
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Provider } from '@/types/provider';

interface SpecialtiesSectionProps {
  provider: Partial<Provider>;
  onChange: (updates: Partial<Provider>) => void;
}

const SpecialtiesSection = ({ provider, onChange }: SpecialtiesSectionProps) => {
  const handleSpecialtiesChange = (index: number, value: string) => {
    const newSpecialties = [...(provider.specialties || [''])];
    newSpecialties[index] = value;
    onChange({ specialties: newSpecialties });
  };

  const addSpecialty = () => {
    onChange({ specialties: [...(provider.specialties || ['']), ''] });
  };

  const removeSpecialty = (index: number) => {
    const newSpecialties = (provider.specialties || ['']).filter((_, i) => i !== index);
    onChange({ specialties: newSpecialties.length > 0 ? newSpecialties : [''] });
  };

  return (
    <div>
      <Label>Especialidades</Label>
      {(provider.specialties || ['']).map((specialty, index) => (
        <div key={index} className="flex gap-2 mt-2">
          <Input
            value={specialty}
            onChange={(e) => handleSpecialtiesChange(index, e.target.value)}
            placeholder="Gestão de Stress, Ansiedade, etc."
          />
          {(provider.specialties?.length || 0) > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeSpecialty(index)}
            >
              Remover
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addSpecialty}
        className="mt-2"
      >
        Adicionar Especialidade
      </Button>
    </div>
  );
};

export default SpecialtiesSection;

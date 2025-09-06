
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Provider } from '@/types/provider';

interface EducationSectionProps {
  provider: Partial<Provider>;
  onChange: (updates: Partial<Provider>) => void;
}

const EducationSection = ({ provider, onChange }: EducationSectionProps) => {
  const handleEducationChange = (index: number, value: string) => {
    const newEducation = [...(provider.education || [''])];
    newEducation[index] = value;
    onChange({ education: newEducation });
  };

  const addEducation = () => {
    onChange({ education: [...(provider.education || ['']), ''] });
  };

  const removeEducation = (index: number) => {
    const newEducation = (provider.education || ['']).filter((_, i) => i !== index);
    onChange({ education: newEducation.length > 0 ? newEducation : [''] });
  };

  return (
    <div>
      <Label>Formação Académica</Label>
      {(provider.education || ['']).map((edu, index) => (
        <div key={index} className="flex gap-2 mt-2">
          <Input
            value={edu}
            onChange={(e) => handleEducationChange(index, e.target.value)}
            placeholder="Formação académica"
          />
          {(provider.education?.length || 0) > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeEducation(index)}
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
        onClick={addEducation}
        className="mt-2"
      >
        Adicionar Formação
      </Button>
    </div>
  );
};

export default EducationSection;

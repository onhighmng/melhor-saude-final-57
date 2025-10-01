
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Provider } from '@/types/provider';

interface LinksConfigSectionProps {
  provider: Partial<Provider>;
  onChange: (updates: Partial<Provider>) => void;
}

const LinksConfigSection = ({ provider, onChange }: LinksConfigSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="activeCases">Casos Ativos</Label>
        <Input
          id="activeCases"
          type="number"
          value={provider.activeCases || 0}
          onChange={(e) => onChange({ activeCases: parseInt(e.target.value) || 0 })}
          placeholder="0"
        />
      </div>
    </div>
  );
};

export default LinksConfigSection;

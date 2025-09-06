
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Provider } from '@/types/provider';
import PhotoUpload from './PhotoUpload';

interface BasicInfoSectionProps {
  provider: Partial<Provider>;
  onChange: (updates: Partial<Provider>) => void;
}

const BasicInfoSection = ({ provider, onChange }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={provider.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Nome completo"
          />
        </div>
        <div>
          <Label htmlFor="pillar">Pilar</Label>
          <select
            id="pillar"
            value={provider.pillar || ''}
            onChange={(e) => onChange({ pillar: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecionar Pilar...</option>
            <option value="psicologica">Saúde Psicológica</option>
            <option value="financeira">Saúde Financeira</option>
            <option value="fisica">Saúde Física</option>
            <option value="juridica">Saúde Jurídica e Social</option>
          </select>
        </div>
      </div>

      <PhotoUpload
        value={provider.photo || ''}
        onChange={(url) => onChange({ photo: url })}
      />

      <div>
        <Label htmlFor="shortBio">Biografia Curta</Label>
        <Textarea
          id="shortBio"
          value={provider.shortBio || ''}
          onChange={(e) => onChange({ shortBio: e.target.value })}
          placeholder="Breve descrição para listagens"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="fullBio">Biografia Completa</Label>
        <Textarea
          id="fullBio"
          value={provider.fullBio || ''}
          onChange={(e) => onChange({ fullBio: e.target.value })}
          placeholder="Biografia detalhada para o perfil"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="experience">Experiência</Label>
        <Input
          id="experience"
          value={provider.experience || ''}
          onChange={(e) => onChange({ experience: e.target.value })}
          placeholder="10+ anos, 5 anos, etc."
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;

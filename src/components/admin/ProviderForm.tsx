
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Provider } from '@/types/provider';
import BasicInfoSection from './provider-form/BasicInfoSection';
import EducationSection from './provider-form/EducationSection';
import SpecialtiesSection from './provider-form/SpecialtiesSection';
import LinksConfigSection from './provider-form/LinksConfigSection';

interface ProviderFormProps {
  provider: Partial<Provider>;
  onChange: (updates: Partial<Provider>) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}

const ProviderForm = ({ provider, onChange, onSave, onCancel, isNew = false }: ProviderFormProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{isNew ? 'Adicionar Novo Prestador' : 'Editar Prestador'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <BasicInfoSection provider={provider} onChange={onChange} />
        <EducationSection provider={provider} onChange={onChange} />
        <SpecialtiesSection provider={provider} onChange={onChange} />
        <LinksConfigSection provider={provider} onChange={onChange} />

        <div className="flex gap-3 pt-4">
          <Button onClick={onSave}>
            {isNew ? 'Criar Prestador' : 'Guardar Alterações'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderForm;

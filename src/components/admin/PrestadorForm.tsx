
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPrestador } from '@/types/admin';

interface PrestadorFormProps {
  onSubmit: (prestadorData: { name: string; email: string; specialty: string; isActive: boolean }) => Promise<void>;
  onCancel: () => void;
}

const PrestadorForm = ({ onSubmit, onCancel }: PrestadorFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData({ name: '', email: '', specialty: '', isActive: true });
    } catch (error) {
      console.error('Error creating prestador:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Criar Nova Conta de Prestador</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specialty">Especialidade</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder="Psicologia Clínica, Nutrição, etc."
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'A Criar...' : 'Criar Prestador'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PrestadorForm;

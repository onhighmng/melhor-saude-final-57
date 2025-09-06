
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminUser } from '@/types/admin';

interface UserFormProps {
  onSubmit: (userData: { name: string; email: string; company: string | null; companySessions: number; isActive: boolean }) => Promise<void>;
  onCancel: () => void;
}

const UserForm = ({ onSubmit, onCancel }: UserFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    companySessions: 5,
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData({ name: '', email: '', company: '', companySessions: 5, isActive: true });
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Criar Nova Conta de Utilizador</CardTitle>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Nome da Empresa"
                required
              />
            </div>
            <div>
              <Label htmlFor="companySessions">Sessões Pagas pela Empresa</Label>
              <Input
                id="companySessions"
                type="number"
                min="0"
                value={formData.companySessions}
                onChange={(e) => setFormData({ ...formData, companySessions: parseInt(e.target.value) || 0 })}
                placeholder="5"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Este colaborador terá direito a {formData.companySessions} sessões pagas pela empresa
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'A Criar...' : 'Criar Utilizador'}
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

export default UserForm;

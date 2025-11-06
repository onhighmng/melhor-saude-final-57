import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, Users, TrendingUp, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { formatPhoneNumber, PHONE_PLACEHOLDER } from '@/utils/phoneFormat';

interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CompanyFormData {
  name: string;
  nuit: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  sessionsAllocated: number;
  employeeSeats: number;
  hrContactPerson: string;
  hrEmail: string;
  programStartDate: string;
}

export function AddCompanyModal({ open, onOpenChange, onSuccess }: AddCompanyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    nuit: '',
    email: '',
    phone: '+258 ',
    address: '',
    industry: '',
    sessionsAllocated: 0,
    employeeSeats: 0,
    hrContactPerson: '',
    hrEmail: '',
    programStartDate: ''
  });

  const handleInputChange = (field: keyof CompanyFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email) {
      toast.error('Nome da empresa e email são obrigatórios');
      return;
    }

    if (formData.sessionsAllocated <= 0) {
      toast.error('Número de sessões deve ser maior que zero');
      return;
    }

    if (formData.employeeSeats <= 0) {
      toast.error('Número de lugares deve ser maior que zero');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.name,
          company_name: formData.name, // Some queries use company_name
          nuit: formData.nuit || null,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address || null,
          industry: formData.industry || null,
          sessions_allocated: formData.sessionsAllocated,
          sessions_used: 0,
          employee_seats: formData.employeeSeats,
          hr_contact_person: formData.hrContactPerson || null,
          hr_email: formData.hrEmail || null,
          program_start_date: formData.programStartDate || null,
          is_active: true,
          plan_type: 'custom',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (companyError) throw companyError;

      toast.success('Empresa adicionada com sucesso!', {
        description: `${formData.name} foi criada com ${formData.sessionsAllocated} sessões e ${formData.employeeSeats} lugares`
      });

      // Reset form
      setFormData({
        name: '',
        nuit: '',
        email: '',
        phone: '+258 ',
        address: '',
        industry: '',
        sessionsAllocated: 0,
        employeeSeats: 0,
        hrContactPerson: '',
        hrEmail: '',
        programStartDate: ''
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating company:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar empresa';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Adicionar Nova Empresa
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para registar uma nova empresa no programa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Informações da Empresa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Nome da Empresa *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: TechCorp Lda"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nuit">NUIT</Label>
                <Input
                  id="nuit"
                  value={formData.nuit}
                  onChange={(e) => handleInputChange('nuit', e.target.value)}
                  placeholder="Ex: 123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Corporativo *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contato@empresa.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
                  placeholder={PHONE_PLACEHOLDER}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Indústria/Setor
                </Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="Ex: Tecnologia, Saúde, Finanças"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="programStartDate">Data de Início do Programa</Label>
                <Input
                  id="programStartDate"
                  type="date"
                  value={formData.programStartDate}
                  onChange={(e) => handleInputChange('programStartDate', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Endereço completo da empresa"
                rows={2}
              />
            </div>
          </div>

          {/* Program Settings - KEY FIELDS */}
          <div className="space-y-4 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
              Definições do Programa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionsAllocated" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Número Total de Sessões *</span>
                </Label>
                <Input
                  id="sessionsAllocated"
                  type="number"
                  min="1"
                  value={formData.sessionsAllocated || ''}
                  onChange={(e) => handleInputChange('sessionsAllocated', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 100"
                  required
                  className="text-lg font-semibold"
                />
                <p className="text-xs text-muted-foreground">
                  Total de sessões disponíveis para todos os colaboradores
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeSeats" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Número de Lugares (Seats) *</span>
                </Label>
                <Input
                  id="employeeSeats"
                  type="number"
                  min="1"
                  value={formData.employeeSeats || ''}
                  onChange={(e) => handleInputChange('employeeSeats', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 50"
                  required
                  className="text-lg font-semibold"
                />
                <p className="text-xs text-muted-foreground">
                  Máximo de contas de colaboradores permitidas
                </p>
              </div>
            </div>

            {/* Sessions per Employee Calculation */}
            {formData.sessionsAllocated > 0 && formData.employeeSeats > 0 && (
              <div className="p-3 bg-white rounded border border-primary/30">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">
                    ~{Math.floor(formData.sessionsAllocated / formData.employeeSeats)} sessões
                  </span>
                  {' '}por colaborador (distribuição equitativa)
                </p>
              </div>
            )}
          </div>

          {/* HR Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contacto de RH
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hrContactPerson">Nome do Gestor de RH</Label>
                <Input
                  id="hrContactPerson"
                  value={formData.hrContactPerson}
                  onChange={(e) => handleInputChange('hrContactPerson', e.target.value)}
                  placeholder="Nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hrEmail">Email do Gestor de RH</Label>
                <Input
                  id="hrEmail"
                  type="email"
                  value={formData.hrEmail}
                  onChange={(e) => handleInputChange('hrEmail', e.target.value)}
                  placeholder="rh@empresa.com"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'A adicionar...' : 'Adicionar Empresa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


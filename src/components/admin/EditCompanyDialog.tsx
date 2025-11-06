import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPhoneNumber, PHONE_PLACEHOLDER } from '@/utils/phoneFormat';

interface Company {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  planType: string;
  sessionsAllocated: number;
  finalNotes: string;
}

interface EditCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
  onSave: (updatedCompany: Company) => void;
}

export function EditCompanyDialog({
  open,
  onOpenChange,
  company,
  onSave,
}: EditCompanyDialogProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [formData, setFormData] = useState<Company>(company);
  const [isSaving, setIsSaving] = useState(false);

  // Format phone number on mount and when company changes
  useEffect(() => {
    if (company.contactPhone) {
      setFormData(prev => ({
        ...prev,
        contactPhone: formatPhoneNumber(company.contactPhone)
      }));
    }
  }, [company]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Fetch current values for change tracking
      const { data: currentCompany } = await supabase
        .from('companies')
        .select('name, contact_email, contact_phone, sessions_allocated, plan_type, final_notes')
        .eq('id', company.id)
        .single();

      // Update company in database with correct column names
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          sessions_allocated: formData.sessionsAllocated,
          plan_type: formData.planType,
          final_notes: formData.finalNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id);

      if (error) throw error;

      // Calculate actual changes for audit log
      const changes = {
        before: currentCompany,
        after: {
          name: formData.name,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          sessions_allocated: formData.sessionsAllocated,
          plan_type: formData.planType,
          final_notes: formData.finalNotes
        },
        modified_fields: Object.keys(formData).filter(key => {
          const dbKey = key === 'name' ? 'name' : 
                        key === 'contactEmail' ? 'contact_email' : 
                        key === 'contactPhone' ? 'contact_phone' : 
                        key === 'sessionsAllocated' ? 'sessions_allocated' : 
                        key === 'planType' ? 'plan_type' : 
                        key === 'finalNotes' ? 'final_notes' : key;
          return currentCompany?.[dbKey as keyof typeof currentCompany] !== formData[key as keyof typeof formData];
        })
      };

      // Log admin action with specific changes
      if (profile?.id) {
        await supabase.from('admin_logs').insert({
          admin_id: profile.id,
          action: 'company_updated',
          entity_type: 'company',
          entity_id: company.id,
          details: changes
        });
      }

      toast({
        title: 'Empresa atualizada',
        description: 'As alterações foram guardadas com sucesso.',
      });

      onSave(formData);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Ocorreu um erro ao atualizar a empresa',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
          <DialogDescription>
            Atualize os dados da empresa
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Nome da Empresa</Label>
            <Input
              id="companyName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Email de Contacto</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactPhone">Telefone de Contacto</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: formatPhoneNumber(e.target.value) })}
                placeholder={PHONE_PLACEHOLDER}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="planType">Tipo de Plano</Label>
              <Select
                value={formData.planType}
                onValueChange={(value) => setFormData({ ...formData, planType: value })}
              >
                <SelectTrigger id="planType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (100 sessões/mês)</SelectItem>
                  <SelectItem value="professional">Professional (400 sessões/mês)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (1000 sessões/mês)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sessionsAllocated">Sessões Alocadas</Label>
              <Input
                id="sessionsAllocated"
                type="number"
                value={formData.sessionsAllocated}
                onChange={(e) => setFormData({ ...formData, sessionsAllocated: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="finalNotes">Notas Finais</Label>
            <Textarea
              id="finalNotes"
              rows={4}
              value={formData.finalNotes}
              onChange={(e) => setFormData({ ...formData, finalNotes: e.target.value })}
              placeholder="Notas adicionais sobre a empresa..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'A processar...' : 'Guardar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
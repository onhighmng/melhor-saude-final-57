import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CalendarSlot } from '@/types/adminProvider';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';
import { EmployeeAutocomplete } from '@/components/admin/EmployeeAutocomplete';
import { supabase } from '@/integrations/supabase/client';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: any;
  slot: CalendarSlot;
}

export const BookingModal = ({ open, onOpenChange, provider, slot }: BookingModalProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    sessionType: provider?.sessionType === 'Ambos' ? '' : (provider?.sessionType || ''),
    notes: '',
  });

  if (!provider) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      toast({
        title: 'Selecione um colaborador',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.sessionType) {
      toast({
        title: 'Selecione o tipo de sessão',
        variant: 'destructive',
      });
      return;
    }

    if (selectedEmployee.sessions_remaining <= 0) {
      toast({
        title: 'Colaborador sem sessões disponíveis',
        description: 'Atribua mais sessões antes de agendar.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: selectedEmployee.user_id,
          prestador_id: provider.id,
          company_id: selectedEmployee.company_id,
          booking_date: slot.date.toISOString(),
          date: format(slot.date, 'yyyy-MM-dd'),
          start_time: format(slot.date, 'HH:mm:ss'),
          end_time: format(new Date(slot.date.getTime() + 60 * 60 * 1000), 'HH:mm:ss'),
          session_type: formData.sessionType,
          pillar: provider.pillar || 'saude_mental',
          meeting_type: formData.sessionType === 'Virtual' ? 'online' : 'presencial',
          status: 'scheduled',
          notes: formData.notes || null,
          booking_source: 'admin_manual',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Decrement employee quota
      const { error: employeeError } = await supabase
        .from('company_employees')
        .update({
          sessions_used: selectedEmployee.sessions_used + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', selectedEmployee.user_id)
        .eq('company_id', selectedEmployee.company_id);

      if (employeeError) throw employeeError;

      // Get current company sessions_used to increment
      const { data: companyData } = await supabase
        .from('companies')
        .select('sessions_used')
        .eq('id', selectedEmployee.company_id)
        .single();

      // Decrement company quota
      const { error: companyError } = await supabase
        .from('companies')
        .update({
          sessions_used: (companyData?.sessions_used || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedEmployee.company_id);

      if (companyError) throw companyError;

      toast({
        title: 'Sessão agendada com sucesso!',
        description: `Sessão marcada para ${selectedEmployee.name}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Erro ao agendar sessão',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Sessão</DialogTitle>
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(slot.date, "d 'de' MMMM 'de' yyyy", { locale: pt })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(slot.date, 'HH:mm', { locale: pt })}</span>
            </div>
            <div className="text-sm font-medium">{provider.name}</div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Escolher colaborador</Label>
            <EmployeeAutocomplete
              value={selectedEmployee?.user_id}
              onSelect={setSelectedEmployee}
            />
            {selectedEmployee && (
              <p className="text-sm text-muted-foreground">
                Sessões disponíveis: {selectedEmployee.sessions_remaining}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionType">Tipo de sessão</Label>
            <Select
              value={formData.sessionType}
              onValueChange={(value) => setFormData({ ...formData, sessionType: value })}
              disabled={provider.sessionType !== 'Ambos'}
            >
              <SelectTrigger>
                <SelectValue placeholder={provider.sessionType} />
              </SelectTrigger>
              <SelectContent>
                {(provider.sessionType === 'Ambos' || provider.sessionType === 'Virtual') && (
                  <SelectItem value="Virtual">Virtual</SelectItem>
                )}
                {(provider.sessionType === 'Ambos' || provider.sessionType === 'Presencial') && (
                  <SelectItem value="Presencial">Presencial</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione informações relevantes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'A agendar...' : 'Confirmar Sessão'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

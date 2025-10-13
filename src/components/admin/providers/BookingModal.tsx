import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useToast } from '@/hooks/use-toast';
import { AdminProvider } from '@/data/adminMockData';
import { CalendarSlot } from '@/types/adminProvider';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: AdminProvider | null;
  slot: CalendarSlot;
}

export const BookingModal = ({ open, onOpenChange, provider, slot }: BookingModalProps) => {
  const { t } = useTranslation('admin-providers');
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    collaboratorName: '',
    sessionType: provider?.sessionType === 'Ambos' ? '' : (provider?.sessionType || ''),
    notes: '',
  });

  if (!provider) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.collaboratorName || !formData.sessionType) {
      toast({
        title: t('bookingModal.error'),
        variant: 'destructive',
      });
      return;
    }

    // TODO: Implement actual booking logic
    console.log('Creating booking:', {
      provider: provider.id,
      slot: slot.date,
      ...formData,
    });

    toast({
      title: t('bookingModal.success'),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('bookingModal.title')}</DialogTitle>
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
            <Label htmlFor="collaborator">{t('bookingModal.selectCollaborator')}</Label>
            <Input
              id="collaborator"
              placeholder={t('bookingModal.collaboratorPlaceholder')}
              value={formData.collaboratorName}
              onChange={(e) => setFormData({ ...formData, collaboratorName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionType">{t('bookingModal.sessionType')}</Label>
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
            <Label htmlFor="notes">{t('bookingModal.notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('bookingModal.notesPlaceholder')}
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
            >
              {t('bookingModal.cancel')}
            </Button>
            <Button type="submit">
              {t('bookingModal.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

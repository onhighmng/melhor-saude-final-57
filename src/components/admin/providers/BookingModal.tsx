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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Provider, CalendarSlot, SessionType } from '@/types/adminProvider';
import { mockCollaborators } from '@/data/adminProvidersData';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Calendar, Clock, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider;
  slot: CalendarSlot;
}

export const BookingModal = ({ open, onOpenChange, provider, slot }: BookingModalProps) => {
  const { t } = useTranslation('admin-providers');
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    collaboratorId: '',
    collaboratorName: '',
    sessionType: provider.sessionType === 'both' ? '' : provider.sessionType,
    notes: '',
  });

  const [openCollaboratorSelect, setOpenCollaboratorSelect] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.collaboratorId || !formData.sessionType) {
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
            <Label>{t('bookingModal.selectCollaborator')}</Label>
            <Popover open={openCollaboratorSelect} onOpenChange={setOpenCollaboratorSelect}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCollaboratorSelect}
                  className="w-full justify-between"
                >
                  {formData.collaboratorId
                    ? mockCollaborators.find((c) => c.id === formData.collaboratorId)?.name
                    : t('bookingModal.collaboratorPlaceholder')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder={t('bookingModal.collaboratorPlaceholder')} />
                  <CommandList>
                    <CommandEmpty>{t('noResults')}</CommandEmpty>
                    <CommandGroup>
                      {mockCollaborators.map((collaborator) => (
                        <CommandItem
                          key={collaborator.id}
                          value={`${collaborator.name} ${collaborator.email}`}
                          onSelect={() => {
                            setFormData({
                              ...formData,
                              collaboratorId: collaborator.id,
                              collaboratorName: collaborator.name,
                            });
                            setOpenCollaboratorSelect(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              formData.collaboratorId === collaborator.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{collaborator.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {collaborator.email} • {collaborator.company}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionType">{t('bookingModal.sessionType')}</Label>
            <Select
              value={formData.sessionType}
              onValueChange={(value) => setFormData({ ...formData, sessionType: value as SessionType })}
              disabled={provider.sessionType !== 'both'}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('sessionTypes.' + provider.sessionType)} />
              </SelectTrigger>
              <SelectContent>
                {(provider.sessionType === 'both' || provider.sessionType === 'virtual') && (
                  <SelectItem value="virtual">{t('sessionTypes.virtual')}</SelectItem>
                )}
                {(provider.sessionType === 'both' || provider.sessionType === 'presential') && (
                  <SelectItem value="presential">{t('sessionTypes.presential')}</SelectItem>
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

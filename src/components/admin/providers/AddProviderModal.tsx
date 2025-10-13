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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Pillar, SessionType, ProviderStatus } from '@/types/adminProvider';

interface AddProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddProviderModal = ({ open, onOpenChange, onSuccess }: AddProviderModalProps) => {
  const { t } = useTranslation('admin-providers');
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    pillar: '' as Pillar | '',
    costPerSession: '',
    sessionType: '' as SessionType | '',
    availability: '',
    status: 'active' as ProviderStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.email || !formData.pillar || !formData.costPerSession || !formData.sessionType) {
      toast({
        title: t('addModal.error'),
        variant: 'destructive',
      });
      return;
    }

    // TODO: Implement actual provider creation logic here
    console.log('Creating provider:', formData);
    
    toast({
      title: t('addModal.success'),
    });

    // Reset form
    setFormData({
      fullName: '',
      email: '',
      pillar: '',
      costPerSession: '',
      sessionType: '',
      availability: '',
      status: 'active',
    });

    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('addModal.title')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t('addModal.fullName')}</Label>
            <Input
              id="fullName"
              placeholder={t('addModal.fullNamePlaceholder')}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('addModal.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('addModal.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pillar">{t('addModal.pillar')}</Label>
            <Select
              value={formData.pillar}
              onValueChange={(value) => setFormData({ ...formData, pillar: value as Pillar })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('addModal.pillarPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mental_health">{t('pillars.mental_health')}</SelectItem>
                <SelectItem value="physical_wellness">{t('pillars.physical_wellness')}</SelectItem>
                <SelectItem value="financial_assistance">{t('pillars.financial_assistance')}</SelectItem>
                <SelectItem value="legal_assistance">{t('pillars.legal_assistance')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPerSession">{t('addModal.costPerSession')}</Label>
            <Input
              id="costPerSession"
              type="number"
              placeholder={t('addModal.costPlaceholder')}
              value={formData.costPerSession}
              onChange={(e) => setFormData({ ...formData, costPerSession: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionType">{t('addModal.sessionType')}</Label>
            <Select
              value={formData.sessionType}
              onValueChange={(value) => setFormData({ ...formData, sessionType: value as SessionType })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('addModal.sessionTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">{t('sessionTypes.virtual')}</SelectItem>
                <SelectItem value="presential">{t('sessionTypes.presential')}</SelectItem>
                <SelectItem value="both">{t('sessionTypes.both')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">{t('addModal.availability')}</Label>
            <Input
              id="availability"
              placeholder={t('addModal.availabilityPlaceholder')}
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t('addModal.status')}</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as ProviderStatus })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('addModal.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('status.active')}</SelectItem>
                <SelectItem value="busy">{t('status.busy')}</SelectItem>
                <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('addModal.cancel')}
            </Button>
            <Button type="submit">
              {t('addModal.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

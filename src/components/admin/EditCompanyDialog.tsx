import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { showCompanyUpdatedSuccess } from '@/data/adminCompanyToasts';

interface Company {
  id: string;
  name: string;
  nuit: string;
  totalEmployees: number;
  planType: string;
  sessionsAllocated: number;
  sessionsUsed: number;
  status: 'active' | 'onboarding' | 'inactive';
  contactEmail: string;
  contactPhone: string;
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
  const { t } = useTranslation('admin-company-detail');
  const [formData, setFormData] = useState<Company>(company);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onSave(formData);
    showCompanyUpdatedSuccess(t);
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('dialogs.editCompany.title')}</DialogTitle>
          <DialogDescription>
            {t('dialogs.editCompany.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">{t('dialogs.editCompany.companyName')}</Label>
            <Input
              id="companyName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nuit">{t('dialogs.editCompany.nuit')}</Label>
            <Input
              id="nuit"
              value={formData.nuit}
              onChange={(e) => setFormData({ ...formData, nuit: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">{t('dialogs.editCompany.contactEmail')}</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactPhone">{t('dialogs.editCompany.contactPhone')}</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="planType">{t('dialogs.editCompany.planType')}</Label>
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
              <Label htmlFor="sessionsAllocated">{t('dialogs.editCompany.sessionsAllocated')}</Label>
              <Input
                id="sessionsAllocated"
                type="number"
                value={formData.sessionsAllocated}
                onChange={(e) => setFormData({ ...formData, sessionsAllocated: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="finalNotes">{t('dialogs.editCompany.finalNotes')}</Label>
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
            {t('dialogs.editCompany.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('progress.processing', { current: 1, total: 1 }) : t('dialogs.editCompany.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
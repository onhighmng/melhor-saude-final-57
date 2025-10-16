import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, Calendar } from 'lucide-react';

const addCompanySchema = z.object({
  companyName: z.string().min(1, 'Campo obrigatório'),
  nuit: z.string().min(9, 'NUIT deve ter pelo menos 9 dígitos'),
  corporateEmail: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Telefone inválido'),
  address: z.string().optional(),
  numberOfEmployees: z.number().min(1, 'Deve ter pelo menos 1 colaborador'),
  hrContactPerson: z.string().min(1, 'Campo obrigatório'),
  hrEmail: z.string().email('Email inválido'),
  programStartDate: z.string().min(1, 'Campo obrigatório'),
  sessionsPerEmployee: z.number().min(1, 'Deve ter pelo menos 1 sessão'),
  sessionModel: z.enum(['pool', 'fixed']),
  pricePerSession: z.number().min(0, 'Preço inválido'),
});

type AddCompanyFormData = z.infer<typeof addCompanySchema>;

interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddCompanyModal = ({ open, onOpenChange }: AddCompanyModalProps) => {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const [selectedPillars, setSelectedPillars] = useState<string[]>([
    'mental',
    'physical',
    'financial',
    'legal',
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<AddCompanyFormData>({
    resolver: zodResolver(addCompanySchema),
    defaultValues: {
      sessionModel: 'pool',
      sessionsPerEmployee: 4,
      pricePerSession: 350,
    },
  });

  const sessionModel = watch('sessionModel');

  const handlePillarToggle = (pillar: string) => {
    setSelectedPillars((prev) =>
      prev.includes(pillar)
        ? prev.filter((p) => p !== pillar)
        : [...prev, pillar]
    );
  };

  const onSubmit = async (data: AddCompanyFormData) => {
    try {
      // TODO: Implement API call to create company
      console.log('Company data:', {
        ...data,
        pillars: selectedPillars,
      });

      toast({
        title: t('addCompany.successTitle'),
        description: t('addCompany.successDescription'),
      });

      reset();
      setSelectedPillars(['mental', 'physical', 'financial', 'legal']);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t('addCompany.errorTitle'),
        description: t('addCompany.errorDescription'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="h-6 w-6" />
            {t('addCompany.title')}
          </DialogTitle>
          <DialogDescription>
            {t('addCompany.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t('addCompany.companyInfoTitle')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  {t('addCompany.companyName')} *
                </Label>
                <Input
                  id="companyName"
                  {...register('companyName')}
                  placeholder="Ex: TechCorp Lda"
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nuit">{t('addCompany.nuit')} *</Label>
                <Input
                  id="nuit"
                  {...register('nuit')}
                  placeholder="Ex: 501234567"
                />
                {errors.nuit && (
                  <p className="text-sm text-destructive">{errors.nuit.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="corporateEmail">
                  {t('addCompany.corporateEmail')} *
                </Label>
                <Input
                  id="corporateEmail"
                  type="email"
                  {...register('corporateEmail')}
                  placeholder="contato@empresa.com"
                />
                {errors.corporateEmail && (
                  <p className="text-sm text-destructive">
                    {errors.corporateEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('addCompany.phone')} *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="Ex: 840000000"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">{t('addCompany.address')}</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Ex: Av. Julius Nyerere, Maputo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfEmployees">
                  {t('addCompany.numberOfEmployees')} *
                </Label>
                <Input
                  id="numberOfEmployees"
                  type="number"
                  {...register('numberOfEmployees', { valueAsNumber: true })}
                  placeholder="Ex: 50"
                />
                {errors.numberOfEmployees && (
                  <p className="text-sm text-destructive">
                    {errors.numberOfEmployees.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hrContactPerson">
                  {t('addCompany.hrContactPerson')} *
                </Label>
                <Input
                  id="hrContactPerson"
                  {...register('hrContactPerson')}
                  placeholder="Ex: João Silva"
                />
                {errors.hrContactPerson && (
                  <p className="text-sm text-destructive">
                    {errors.hrContactPerson.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hrEmail">
                  {t('addCompany.hrEmail')} *
                </Label>
                <Input
                  id="hrEmail"
                  type="email"
                  {...register('hrEmail')}
                  placeholder="rh@empresa.com"
                />
                {errors.hrEmail && (
                  <p className="text-sm text-destructive">
                    {errors.hrEmail.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Program Settings Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">
              {t('addCompany.programSettingsTitle')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="programStartDate">
                  {t('addCompany.programStartDate')} *
                </Label>
                <div className="relative">
                  <Input
                    id="programStartDate"
                    type="date"
                    {...register('programStartDate')}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.programStartDate && (
                  <p className="text-sm text-destructive">
                    {errors.programStartDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionsPerEmployee">
                  {t('addCompany.sessionsPerEmployee')} *
                </Label>
                <Input
                  id="sessionsPerEmployee"
                  type="number"
                  {...register('sessionsPerEmployee', { valueAsNumber: true })}
                  placeholder="Ex: 4"
                />
                {errors.sessionsPerEmployee && (
                  <p className="text-sm text-destructive">
                    {errors.sessionsPerEmployee.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionModel">
                  {t('addCompany.sessionModel')} *
                </Label>
                <Select
                  value={sessionModel}
                  onValueChange={(value: 'pool' | 'fixed') =>
                    setValue('sessionModel', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pool">
                      {t('addCompany.poolMonthly')}
                    </SelectItem>
                    <SelectItem value="fixed">
                      {t('addCompany.fixedSessions')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerSession">
                  {t('addCompany.pricePerSession')} *
                </Label>
                <Input
                  id="pricePerSession"
                  type="number"
                  {...register('pricePerSession', { valueAsNumber: true })}
                  placeholder="Ex: 350"
                />
                {errors.pricePerSession && (
                  <p className="text-sm text-destructive">
                    {errors.pricePerSession.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{t('addCompany.sessionTypesIncluded')} *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'mental', label: t('addCompany.mental') },
                    { value: 'physical', label: t('addCompany.physical') },
                    { value: 'financial', label: t('addCompany.financial') },
                    { value: 'legal', label: t('addCompany.legal') },
                  ].map((pillar) => (
                    <div key={pillar.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={pillar.value}
                        checked={selectedPillars.includes(pillar.value)}
                        onCheckedChange={() => handlePillarToggle(pillar.value)}
                      />
                      <Label
                        htmlFor={pillar.value}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {pillar.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('addCompany.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('addCompany.adding') : t('addCompany.addCompany')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

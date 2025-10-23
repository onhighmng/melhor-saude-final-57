import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserCog } from 'lucide-react';

const addProviderSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Telefone inválido'),
  specialty: z.string().min(1, 'Campo obrigatório'),
  pillar: z.enum(['mental_health', 'physical_wellness', 'financial_assistance', 'legal_assistance']),
  sessionType: z.enum(['virtual', 'presential', 'both']),
  costPerSession: z.number().min(0, 'Preço inválido'),
  credentials: z.string().min(1, 'Campo obrigatório'),
  experience: z.number().min(0, 'Experiência inválida'),
});

type AddProviderFormData = z.infer<typeof addProviderSchema>;

interface AddProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddProviderModal = ({ open, onOpenChange }: AddProviderModalProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<AddProviderFormData>({
    resolver: zodResolver(addProviderSchema),
    defaultValues: {
      sessionType: 'both',
      costPerSession: 350,
      experience: 0,
      pillar: 'mental_health',
    },
  });

  const pillar = watch('pillar');
  const sessionType = watch('sessionType');

  const onSubmit = async (data: AddProviderFormData) => {
    try {
      // TODO: Implement API call to create provider
      console.log('Provider data:', data);

      toast({
        title: 'Prestador adicionado com sucesso',
        description: 'O prestador foi registado e já pode receber agendamentos',
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao adicionar prestador',
        description: 'Ocorreu um erro ao tentar adicionar o prestador. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <UserCog className="h-6 w-6" />
            Adicionar Prestador
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para registar um novo prestador no programa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Informações Pessoais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ex: Dr. Carlos Mendes"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="prestador@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="Ex: 840000000"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">
                  Anos de Experiência *
                </Label>
                <Input
                  id="experience"
                  type="number"
                  {...register('experience', { valueAsNumber: true })}
                  placeholder="Ex: 5"
                />
                {errors.experience && (
                  <p className="text-sm text-destructive">
                    {errors.experience.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">
              Informações Profissionais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pillar">
                  Área de Atuação *
                </Label>
                <Select
                  value={pillar}
                  onValueChange={(value: any) =>
                    setValue('pillar', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mental_health">
                      Saúde Mental
                    </SelectItem>
                    <SelectItem value="physical_wellness">
                      Bem-Estar Físico
                    </SelectItem>
                    <SelectItem value="financial_assistance">
                      Apoio Financeiro
                    </SelectItem>
                    <SelectItem value="legal_assistance">
                      Assistência Legal
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">
                  Especialidade *
                </Label>
                <Input
                  id="specialty"
                  {...register('specialty')}
                  placeholder="Ex: Psicologia Clínica"
                />
                {errors.specialty && (
                  <p className="text-sm text-destructive">
                    {errors.specialty.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionType">
                  Tipo de Sessão *
                </Label>
                <Select
                  value={sessionType}
                  onValueChange={(value: any) =>
                    setValue('sessionType', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">
                      Virtual
                    </SelectItem>
                    <SelectItem value="presential">
                      Presencial
                    </SelectItem>
                    <SelectItem value="both">
                      Ambos
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPerSession">
                  Custo por Sessão (MZN) *
                </Label>
                <Input
                  id="costPerSession"
                  type="number"
                  {...register('costPerSession', { valueAsNumber: true })}
                  placeholder="Ex: 350"
                />
                {errors.costPerSession && (
                  <p className="text-sm text-destructive">
                    {errors.costPerSession.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="credentials">
                  Credenciais / Certificações *
                </Label>
                <Input
                  id="credentials"
                  {...register('credentials')}
                  placeholder="Ex: Licenciatura em Psicologia, Ordem dos Psicólogos"
                />
                {errors.credentials && (
                  <p className="text-sm text-destructive">
                    {errors.credentials.message}
                  </p>
                )}
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
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'A adicionar...' : 'Adicionar Prestador'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

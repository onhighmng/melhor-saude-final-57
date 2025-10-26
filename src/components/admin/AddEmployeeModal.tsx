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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Send } from 'lucide-react';

const formSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  position: z.string().min(1, 'Cargo é obrigatório'),
  company: z.string().min(1, 'Empresa é obrigatória'),
  accessCode: z.string().min(1, 'Código de acesso é obrigatório'),
});

type FormData = z.infer<typeof formSchema>;

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock companies - in production, this would come from the database
const mockCompanies = [
  { id: '1', name: 'TechCorp Lda' },
  { id: '2', name: 'HealthPlus SA' },
  { id: '3', name: 'StartupHub' },
  { id: '4', name: 'ConsultPro' },
];

export const AddEmployeeModal = ({ open, onOpenChange }: AddEmployeeModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      position: '',
      company: '',
      accessCode: generateAccessCode(),
    },
  });

  function generateAccessCode(): string {
    // Generate a 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  const handleGenerateCode = () => {
    const newCode = generateAccessCode();
    form.setValue('accessCode', newCode);
    toast({
      title: 'Código gerado',
      description: `Novo código de acesso: ${newCode}`,
    });
  };

  const handleSendCodeEmail = () => {
    const email = form.getValues('email');
    const accessCode = form.getValues('accessCode');

    if (!email) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha o email do colaborador primeiro.',
        variant: 'destructive',
      });
      return;
    }

    // In production, this would trigger an actual email
    toast({
      title: 'Email enviado',
      description: `Código de acesso enviado para ${email}`,
    });
  };

  const { profile } = useAuth();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Get company ID
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('name', data.company)
        .single();

      if (companyError) throw companyError;

      // Create user and employee record
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: generateAccessCode(),
        email_confirm: true
      });

      if (authError) throw authError;

      // Create profile
      await supabase.from('profiles').insert({
        id: authData.user.id,
        email: data.email,
        name: data.fullName,
        phone: data.phone,
        role: 'user',
        company_id: company.id,
        position: data.position
      });

      // Create company_employee link
      await supabase.from('company_employees').insert({
        company_id: company.id,
        user_id: authData.user.id,
        position: data.position,
        sessions_quota: 6 // Default quota
      });

      // Create invite record
      await supabase.from('invites').insert({
        invite_code: data.accessCode,
        invited_by: profile?.id,
        company_id: company.id,
        email: data.email,
        role: 'user',
        status: 'accepted'
      });

      toast({
        title: 'Colaborador adicionado com sucesso',
        description: `${data.fullName} foi registado no sistema`,
      });

      form.reset({
        fullName: '',
        email: '',
        phone: '',
        position: '',
        company: '',
        accessCode: generateAccessCode(),
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar colaborador',
        description: error.message || 'Ocorreu um erro. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Colaborador</DialogTitle>
          <DialogDescription>
            Preencha os dados para registar um novo colaborador no programa
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações do Colaborador */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                👤 Informações do Colaborador
              </h3>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo do colaborador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email usado para aceder à plataforma"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone / WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Contacto direto para notificações"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo / Função</FormLabel>
                    <FormControl>
                      <Input placeholder="Função atual dentro da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa Associada</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha a empresa a que pertence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockCompanies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Acesso à Plataforma */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                🔐 Acesso à Plataforma
              </h3>

              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Acesso</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          placeholder="Código único de login inicial"
                          className="font-mono text-lg"
                        />
                      </FormControl>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateCode}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Gerar Código
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSendCodeEmail}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Código por Email
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botões de Ação */}
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
                {isSubmitting ? 'A guardar...' : 'Guardar Colaborador'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

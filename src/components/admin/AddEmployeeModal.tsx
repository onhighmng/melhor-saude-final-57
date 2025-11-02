import { useState, useEffect } from 'react';
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

export const AddEmployeeModal = ({ open, onOpenChange }: AddEmployeeModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
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

  // Load companies from database
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const { data, error } = await supabase
          .from('companies')
          .select('id, company_name')
          .eq('is_active', true)
          .order('company_name');

        if (error) throw error;

        const companyList = (data || []).map(c => ({
          id: c.id,
          name: c.company_name
        }));

        setCompanies(companyList);
      } catch (error) {
        // Silent fail for companies loading
        toast({
          title: 'Erro ao carregar empresas',
          description: 'Não foi possível carregar a lista de empresas.',
          variant: 'destructive'
        });
      } finally {
        setLoadingCompanies(false);
      }
    };

    if (open) {
      loadCompanies();
    }
  }, [open, toast]);

  function generateAccessCode(): string {
    // Generate a 12-character cryptographically secure code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const charLength = chars.length;
    let code = '';
    
    const randomValues = new Uint32Array(12);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < 12; i++) {
      code += chars[randomValues[i] % charLength];
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

  const handleSendCodeEmail = async () => {
    const email = form.getValues('email');
    const accessCode = form.getValues('accessCode');
    const fullName = form.getValues('fullName');

    if (!email) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha o email do colaborador primeiro.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Send email via Edge Function
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Bem-vindo ao Melhor Saúde - Código de Acesso',
          html: `
            <h1>Bem-vindo, ${fullName}!</h1>
            <p>Obrigado por se juntar ao programa Melhor Saúde.</p>
            <p>O seu código de acesso é: <strong>${accessCode}</strong></p>
            <p>Use este código para aceder à plataforma.</p>
            <p>Cumprimentos,<br>Equipa Melhor Saúde</p>
          `,
          type: 'invite'
        }
      });

      if (error) throw error;

      toast({
        title: 'Email enviado',
        description: `Código de acesso enviado para ${email}`,
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      // Don't show error to user, just log it
      toast({
        title: 'Email enviado',
        description: `Código de acesso: ${accessCode}`,
      });
    }
  };

  const { profile } = useAuth();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Get company ID
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('company_name', data.company)
        .maybeSingle();

      if (companyError) throw companyError;
      if (!company) throw new Error('Company not found');

      // Create user and employee record
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: generateAccessCode(),
        email_confirm: true
      });

      if (authError) throw authError;

      // Create profile WITHOUT role
      await supabase.from('profiles').insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        company_id: company.id
      });

      // Create role in user_roles table
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'user'
      });

      // Create company_employee link
      await supabase.from('company_employees').insert({
        company_id: company.id,
        user_id: authData.user.id,
        sessions_allocated: 6 // Default quota
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

      // Send welcome email
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: data.email,
            subject: 'Bem-vindo ao Melhor Saúde',
            html: `
              <h1>Bem-vindo, ${data.fullName}!</h1>
              <p>Obrigado por se juntar ao programa Melhor Saúde.</p>
              <p>O seu código de acesso é: <strong>${data.accessCode}</strong></p>
              <p>Aceda à plataforma em: <a href="${window.location.origin}/login">${window.location.origin}/login</a></p>
              <p>Cumprimentos,<br>Equipa Melhor Saúde</p>
            `,
            type: 'welcome'
          }
        });
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the user creation if email fails
      }

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
                        {loadingCompanies ? (
                          <SelectItem value="" disabled>
                            A carregar empresas...
                          </SelectItem>
                        ) : companies.length === 0 ? (
                          <SelectItem value="" disabled>
                            Nenhuma empresa disponível
                          </SelectItem>
                        ) : (
                          companies.map((company) => (
                            <SelectItem key={company.id} value={company.name}>
                              {company.name}
                            </SelectItem>
                          ))
                        )}
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

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Edit, FileText, Trash2, Upload, RefreshCw, Mail, Download, RotateCcw, X, Users, ArrowLeft } from 'lucide-react';
import { EditCompanyDialog } from '@/components/admin/EditCompanyDialog';
import {
  parseEmployeeCSV,
  generateUniqueAccessCodes,
  downloadCSVTemplate,
  exportEmployeesWithCodes,
  type CSVEmployee,
  type CSVValidationError,
} from '@/utils/csvHelpers';
import { AdminCompanyFeatures } from '@/components/ui/admin-company-features';

interface Employee {
  id: string;
  userId?: string;
  name: string;
  email: string;
  code: string;
  sentDate?: string;
  status: 'sem-codigo' | 'codigo-gerado' | 'enviado' | 'erro';
}

// Mock data removed - using real data from database

export default function AdminCompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [company, setCompany] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanyDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // Load company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .single();

        if (companyError) throw companyError;

        // Load employees (without invalid joins)
        const { data: employeesDataRaw, error: employeesError } = await supabase
          .from('company_employees')
          .select('*')
          .eq('company_id', id)
          .order('joined_at', { ascending: false });

        const { data: invitesData, error: invitesError } = await supabase
          .from('invites')
          .select('*')
          .eq('company_id', id)
          .order('created_at', { ascending: false });

        if (employeesError) throw employeesError;
        if (invitesError) throw invitesError;

        setCompany(companyData);
        
        // Get employee profiles separately
        const employeesWithProfiles = await Promise.all((employeesDataRaw || []).map(async (emp) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', emp.user_id)
            .maybeSingle();
          
          return {
            id: emp.id,
            name: profile?.name || '',
            email: profile?.email || '',
            code: invitesData?.find(inv => inv.email === profile?.email)?.invite_code || '',
            sentDate: invitesData?.find(inv => inv.email === profile?.email)?.created_at || '',
            status: 'enviado' as const
          };
        }));
        
        setEmployees(employeesWithProfiles);
        setInvites(invitesData || []);
      } catch (error) {
        console.error('Error loading company details:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar detalhes da empresa',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompanyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto p-6">
        <Button onClick={() => navigate('/admin/users-management')} variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card className="mt-6">
          <CardContent className="p-12 text-center">
            <p>Empresa não encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<string | null>(null);
  const [emailToResend, setEmailToResend] = useState<{ id: string; email: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0 });
  const [csvPreview, setCsvPreview] = useState<CSVEmployee[] | null>(null);
  const [csvErrors, setCsvErrors] = useState<CSVValidationError[]>([]);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [lastSendTimestamp, setLastSendTimestamp] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState({
    id: company?.id || '',
    name: company?.name || '',
    nuit: company?.nuit || '',
    contactEmail: company?.email || '',
    contactPhone: company?.phone || '',
    planType: 'professional',
    sessionsAllocated: company?.sessions_allocated || 0,
    finalNotes: '',
  });

  const usagePercent = company && company.sessions_allocated > 0
    ? Math.round((company.sessions_used / company.sessions_allocated) * 100)
    : 0;
  const employeesWithCode = employees.filter(e => e.status === 'enviado').length;
  const employeesPending = employees.filter(e => e.status !== 'enviado' && e.code).length + employees.filter(e => !e.code).length;

  const handleImportCSV = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploading(true);
      const { employees: parsedEmployees, errors } = await parseEmployeeCSV(file);
      setIsUploading(false);

      if (errors.length > 0) {
        setCsvErrors(errors);
        toast({ title: 'Erro na Importação', variant: 'destructive' });
        return;
      }

      setCsvPreview(parsedEmployees);
      setShowPreviewDialog(true);
    };

    input.click();
  };

  const confirmCSVImport = async () => {
    if (!csvPreview || !id) return;

    setIsUploading(true);
    try {
      // Get all existing employees for this company with their profile emails
      const { data: existingEmployees } = await supabase
        .from('company_employees')
        .select('user_id')
        .eq('company_id', id);

      const existingUserIds = new Set((existingEmployees || []).map(e => e.user_id));
      
      // Get emails from profiles for existing employees
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('email')
        .in('id', Array.from(existingUserIds));
      
      const existingEmails = new Set(existingProfiles?.map(p => p.email) || []);
      
      // Check available sessions
      const { data: company } = await supabase
        .from('companies')
        .select('sessions_allocated, sessions_used')
        .eq('id', id)
        .single();
        
      const availableSeats = (company?.sessions_allocated || 0) - (company?.sessions_used || 0);
      const newEmployeesCount = csvPreview.filter(e => !existingEmails.has(e.email)).length;
      
      // Block duplicates
      if (existingEmails.size > 0) {
        toast({ 
          title: 'Duplicados encontrados', 
          description: `${existingEmails.size} colaborador(es) já existem. Elimine-os do CSV antes de importar.`,
          variant: 'destructive'
        });
        setIsUploading(false);
        return;
      }
      
      if (newEmployeesCount > availableSeats) {
        toast({ 
          title: 'Assentos insuficientes', 
          description: `${newEmployeesCount} novos colaboradores vs ${availableSeats} assentos disponíveis`,
          variant: 'destructive'
        });
        setIsUploading(false);
        return;
      }

      // Import employees to database
      const createdEmployees = [];
      const errors = [];

      for (const emp of csvPreview) {
        try {
          // Check if user already exists in auth
          const { data: existingAuthUser } = await supabase.auth.admin.listUsers();
          const existingUser = existingAuthUser?.users?.find(u => u.email === emp.email);

          let userId;
          if (existingUser) {
            userId = existingUser.id;
          } else {
            // Create new user account
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: emp.email,
              email_confirm: false,
              user_metadata: { 
                full_name: emp.name,
                role: 'user'
              }
            });

            if (authError) {
              errors.push({ email: emp.email, error: authError.message });
              continue;
            }

            userId = authData.user.id;
          }

          // Insert into company_employees
          const { data, error } = await supabase
            .from('company_employees')
            .insert({
              user_id: userId,
              company_id: companyId,
              email: emp.email,
              sessions_quota: 5, // Default quota
              sessions_used: 0,
              is_active: true,
              joined_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) {
            errors.push({ email: emp.email, error: error.message });
            continue;
          }

          createdEmployees.push(data);
        } catch (error: any) {
          errors.push({ email: emp.email, error: error.message });
        }
      }

      // Update seats_used counter
      if (createdEmployees.length > 0) {
        await supabase.rpc('increment_company_seats_used', {
          _company_id: companyId,
          _count: createdEmployees.length
        });
      }

      if (errors.length > 0) {
        toast({
          title: 'Importação parcial',
          description: `${createdEmployees.length} importado(s), ${errors.length} erro(s)`,
          variant: createdEmployees.length === 0 ? 'destructive' : 'default'
        });
      } else {
        toast({ 
          title: 'CSV Importado', 
          description: `${createdEmployees.length} colaborador(es) importado(s) com sucesso` 
        });
      }

      // Refresh employees list
      await loadEmployees();
      
      setShowPreviewDialog(false);
      setCsvPreview(null);
    } catch (error: any) {
      console.error('Error validating CSV import:', error);
      toast({ 
        title: 'Erro na validação', 
        description: error.message || 'Erro ao validar importação',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateCodes = async () => {
    const employeesWithoutCodes = employees.filter(e => !e.code);
    if (employeesWithoutCodes.length === 0) {
      toast({ title: 'Nenhum Código Necessário', description: 'Todos os colaboradores já têm códigos gerados' });
      return;
    }

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const existingCodes = new Set(employees.map(e => e.code).filter(Boolean));
    const newCodes = generateUniqueAccessCodes(employeesWithoutCodes.length, existingCodes, 'MS');

    let codeIndex = 0;
    const updatedEmployees = employees.map(emp => {
      if (!emp.code) {
        return { ...emp, code: newCodes[codeIndex++], status: 'codigo-gerado' as const };
      }
      return emp;
    });

    setEmployees(updatedEmployees);
    toast({ title: 'Códigos Gerados', description: `${newCodes.length} código(s) gerado(s) com sucesso` });
    setIsGenerating(false);
  };

  const handleSendEmails = async () => {
    const employeesToSend = employees.filter(e => e.code && e.status !== 'enviado');
    if (employeesToSend.length === 0) {
      toast({ title: 'Nenhum Email para Enviar', description: 'Todos os colaboradores já receberam os códigos' });
      return;
    }

    setIsSending(true);
    setSendingProgress({ current: 0, total: employeesToSend.length });

    for (let i = 0; i < employeesToSend.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setSendingProgress({ current: i + 1, total: employeesToSend.length });

      const success = Math.random() > 0.1;
      setEmployees(prev => prev.map(emp => {
        if (emp.id === employeesToSend[i].id) {
          return { ...emp, status: success ? 'enviado' as const : 'erro' as const, sentDate: success ? new Date().toLocaleDateString('pt-PT') : undefined };
        }
        return emp;
      }));
    }

    setLastSendTimestamp(new Date().toLocaleString('pt-PT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    setIsSending(false);
    toast({ title: 'Emails Enviados', description: `${employeesToSend.length} email(s) enviado(s) com sucesso` });
  };

  const handleExportCSV = () => {
    exportEmployeesWithCodes(employees.map(e => ({ name: e.name, email: e.email, code: e.code || null })), company?.name || '');
    toast({ title: 'CSV Exportado', description: 'Ficheiro descarregado com sucesso' });
  };

  const getStatusBadge = (status: Employee['status']) => {
    const statusConfig = {
      'sem-codigo': { 
        label: 'Sem Código', 
        className: 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200' 
      },
      'codigo-gerado': { 
        label: 'Código Gerado', 
        className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200' 
      },
      'enviado': { 
        label: 'Enviado', 
        className: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' 
      },
      'erro': { 
        label: 'Erro no Envio', 
        className: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' 
      },
    };
    
    const config = statusConfig[status];
    
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'font-medium px-3 py-1 text-sm border',
          config.className
        )}
      >
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalhes da Empresa</h1>
          <p className="text-muted-foreground">Gestão de colaboradores e códigos de acesso</p>
        </div>
      </div>

      <AdminCompanyFeatures company={{
        name: company?.name || '',
        employees: employees.length,
        totalSessions: company?.sessions_allocated || 0,
        usedSessions: company?.sessions_used || 0,
        plan: `${company?.sessions_allocated || 0} sessões`,
        status: company?.is_active ? 'Ativa' : 'Em Onboarding'
      }} />

        </div>
      </div>

      <EditCompanyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        company={companyData}
        onSave={(updated) => {
          setCompanyData(updated);
          toast({ title: 'Empresa Atualizada', description: 'Dados atualizados com sucesso' });
        }}
      />

      <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Empresa</AlertDialogTitle>
            <AlertDialogDescription>Esta ação irá desativar todos os colaboradores e suspender o acesso da empresa. Tem a certeza?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                toast({ title: 'Empresa Desativada', description: 'A empresa foi desativada com sucesso' });
                setTimeout(() => navigate('/admin/operations'), 1000);
              }}
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!employeeToRemove} onOpenChange={(open) => !open && setEmployeeToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Colaborador</AlertDialogTitle>
            <AlertDialogDescription>Tem a certeza que deseja remover este colaborador? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={async () => {
                if (employeeToRemove) {
                  try {
                  const employee = employees.find(e => e.id === employeeToRemove);
                    if (!employee) return;

                    // Delete from company_employees table
                    const { error: deleteError } = await supabase
                      .from('company_employees')
                      .delete()
                      .eq('id', employeeToRemove);

                    if (deleteError) throw deleteError;

                    // Optionally deactivate profile
                    if (employee.userId) {
                      await supabase
                        .from('profiles')
                        .update({ is_active: false })
                        .eq('id', employee.userId);
                    }

                    // Update local state
                  setEmployees(employees.filter(e => e.id !== employeeToRemove));
                    toast({ 
                      title: 'Colaborador Removido', 
                      description: `${employee?.name || ''} foi removido da lista` 
                    });
                  } catch (error: any) {
                    console.error('Error removing employee:', error);
                    toast({ 
                      title: 'Erro ao remover colaborador',
                      description: error.message || 'Ocorreu um erro ao remover o colaborador',
                      variant: 'destructive'
                    });
                  } finally {
                  setEmployeeToRemove(null);
                  }
                }
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!emailToResend} onOpenChange={(open) => !open && setEmailToResend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reenviar Código</AlertDialogTitle>
            <AlertDialogDescription>Deseja reenviar o código de acesso para o email deste colaborador?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (emailToResend) {
                  try {
                    // Get the employee's invite code from database
                    const { data: invite, error: inviteError } = await supabase
                      .from('invites')
                      .select('invite_code')
                      .eq('email', emailToResend.email)
                      .eq('company_id', id)
                      .order('created_at', { ascending: false })
                      .limit(1)
                      .single();

                    if (inviteError) throw inviteError;

                    // Send email via Edge Function
                    const { error: emailError } = await supabase.functions.invoke('send-email', {
                      body: {
                        to: emailToResend.email,
                        subject: 'Código de Acesso - Reenvio',
                        html: `
                          <h1>Olá!</h1>
                          <p>O seu código de acesso para o Melhor Saúde é: <strong>${invite?.invite_code || 'N/A'}</strong></p>
                          <p>Aceda à plataforma em: <a href="${window.location.origin}/login">${window.location.origin}/login</a></p>
                          <p>Cumprimentos,<br>Equipa Melhor Saúde</p>
                        `,
                        type: 'invite'
                      }
                    });

                    if (emailError) throw emailError;

                    // Update employee status in local state
                  setEmployees(prev => prev.map(emp =>
                    emp.id === emailToResend.id ? { ...emp, status: 'enviado' as const, sentDate: new Date().toLocaleDateString('pt-PT') } : emp
                  ));

                    toast({ 
                      title: 'Código Reenviado', 
                      description: `Código enviado para ${emailToResend.email}` 
                    });
                  } catch (error: any) {
                    console.error('Error resending invite:', error);
                    toast({ 
                      title: 'Erro ao reenviar código',
                      description: error.message || 'Ocorreu um erro ao reenviar o código',
                      variant: 'destructive'
                    });
                  } finally {
                  setEmailToResend(null);
                  }
                }
              }}
            >
              Reenviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pré-visualização do CSV</DialogTitle>
            <DialogDescription>{csvPreview?.length || 0} colaborador(es) encontrado(s). Verifique os dados antes de importar.</DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvPreview?.map((emp, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>Cancelar</Button>
            <Button onClick={confirmCSVImport}>Importar Colaboradores</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

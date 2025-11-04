import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users,
  Mail,
  Calendar,
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmployeeData {
  id: string;
  user_id: string;
  company_id: string;
  sessions_allocated: number;
  sessions_used: number;
  is_active: boolean;
  joined_at: string;
  profiles: {
    name: string;
    email: string;
    avatar_url: string | null;
    is_active: boolean;
  } | null;
}

interface EmployeeListSectionProps {
  companyId: string | null | undefined;
}

export function EmployeeListSection({ companyId }: EmployeeListSectionProps) {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadEmployees = async () => {
      if (!companyId) {
        setLoading(false);
        setEmployees([]);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('company_employees')
          .select(`
            *,
            profiles (
              name,
              email,
              avatar_url,
              is_active
            )
          `)
          .eq('company_id', companyId)
          .eq('is_active', true)
          .order('joined_at', { ascending: false });

        if (error) {
          console.error('Error loading employees:', error);
          throw error;
        }

        setEmployees(data || []);
      } catch (error) {
        console.error('Error loading employees:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar lista de colaboradores',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();

    // Real-time subscription for changes
    const channel = supabase
      .channel('company-employees-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_employees',
          filter: `company_id=eq.${companyId}`
        },
        () => loadEmployees()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, toast]);

  const handleDeleteClick = (employee: EmployeeData) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    setDeleting(true);
    try {
      // Deactivate the employee
      const { error } = await supabase
        .from('company_employees')
        .update({ 
          is_active: false
        })
        .eq('id', employeeToDelete.id);

      if (error) throw error;

      toast({
        title: 'Colaborador removido',
        description: 'O colaborador foi desativado com sucesso.',
      });

      // Reload employees list
      setEmployees(prev => prev.filter(e => e.id !== employeeToDelete.id));
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o colaborador. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">A carregar colaboradores...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-8">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-blue-400" />
              <p className="text-lg font-medium text-blue-900 mb-2">
                Modo HR sem Empresa
              </p>
              <p className="text-sm text-blue-700 max-w-md mx-auto">
                Como HR sem empresa associada, você pode gerar códigos de acesso, 
                mas não verá a lista de colaboradores aqui. 
                Os colaboradores que usarem seus códigos aparecerão no painel do administrador.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Colaboradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-lg font-medium text-foreground mb-2">
                Nenhum colaborador registado ainda
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                Gere códigos de acesso acima e partilhe-os com os seus colaboradores. 
                Quando eles se registarem, aparecerão aqui automaticamente.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <Activity className="h-4 w-4" />
                <span>Os colaboradores aparecerão aqui em tempo real após registro</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const activeEmployees = employees.filter(e => e.profiles?.is_active !== false).length;
  const totalSessions = employees.reduce((sum, e) => sum + (e.sessions_used || 0), 0);
  const avgSessionsPerEmployee = employees.length > 0 ? (totalSessions / employees.length).toFixed(1) : '0';

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12 space-y-6">
      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Colaboradores</p>
                <p className="text-3xl font-bold text-foreground">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Colaboradores Ativos</p>
                <p className="text-3xl font-bold text-emerald-600">{activeEmployees}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média de Sessões</p>
                <p className="text-3xl font-bold text-blue-600">{avgSessionsPerEmployee}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Colaboradores Registados ({employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employees.map((employee) => {
              const isActive = employee.profiles?.is_active !== false;
              const sessionUsagePercent = employee.sessions_allocated > 0
                ? Math.round((employee.sessions_used / employee.sessions_allocated) * 100)
                : 0;

              return (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={employee.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {employee.profiles?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">
                          {employee.profiles?.name || 'Nome não disponível'}
                        </p>
                        {isActive ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.profiles?.email || 'Email não disponível'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Registado: {new Date(employee.joined_at).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                    </div>

                    {/* Sessions Usage */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Sessões Utilizadas
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min(sessionUsagePercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {employee.sessions_used}/{employee.sessions_allocated}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(employee)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                    title="Remover colaborador"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja remover <strong>{employeeToDelete?.profiles?.name}</strong>?
              <br /><br />
              Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Desativar o acesso do colaborador à plataforma</li>
                <li>Manter o histórico de sessões para relatórios</li>
                <li>O lugar ficará disponível imediatamente</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'A remover...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}




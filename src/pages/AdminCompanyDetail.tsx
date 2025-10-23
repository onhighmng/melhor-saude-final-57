import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

interface Employee {
  id: string;
  name: string;
  email: string;
  code: string;
  sentDate?: string;
  status: 'sem-codigo' | 'codigo-gerado' | 'enviado' | 'erro';
}

const mockCompany = {
  id: '4',
  name: 'TechCorp Lda',
  nuit: '123456789',
  employees: 100,
  plan: 'Professional',
  totalSessions: 400,
  usedSessions: 245,
  status: 'Ativa' as const,
};

const mockEmployees: Employee[] = [
  { id: '1', name: 'Ana Silva', email: 'ana.silva@techcorp.co.mz', code: 'MS-X9K2', sentDate: '13/10/2025', status: 'enviado' },
  { id: '2', name: 'João Santos', email: 'joao.santos@techcorp.co.mz', code: 'MS-P7M3', sentDate: '13/10/2025', status: 'enviado' },
  { id: '3', name: 'Maria Costa', email: 'maria.costa@techcorp.co.mz', code: 'MS-R4N8', sentDate: '', status: 'codigo-gerado' },
  { id: '4', name: 'Pedro Lima', email: 'pedro.lima@techcorp.co.mz', code: '', sentDate: '', status: 'sem-codigo' },
];

export default function AdminCompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
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
    id: mockCompany.id,
    name: mockCompany.name,
    nuit: mockCompany.nuit,
    contactEmail: 'contato@techcorp.co.mz',
    contactPhone: '+258 84 123 4567',
    planType: 'professional',
    sessionsAllocated: mockCompany.totalSessions,
    finalNotes: '',
  });

  const usagePercent = Math.round((mockCompany.usedSessions / mockCompany.totalSessions) * 100);
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

  const confirmCSVImport = () => {
    if (!csvPreview) return;

    const newEmployees = csvPreview.map((emp, idx) => ({
      id: `emp-${Date.now()}-${idx}`,
      name: emp.name,
      email: emp.email,
      code: '',
      status: 'sem-codigo' as const,
    }));

    setEmployees([...employees, ...newEmployees]);
    toast({ title: 'CSV Importado', description: `${newEmployees.length} colaborador(es) importado(s) com sucesso` });
    setShowPreviewDialog(false);
    setCsvPreview(null);
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
    exportEmployeesWithCodes(employees.map(e => ({ name: e.name, email: e.email, code: e.code || null })), mockCompany.name);
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/operations')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalhes da Empresa</h1>
          <p className="text-muted-foreground">Gestão de colaboradores e códigos de acesso</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-10">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-5xl mb-3">{mockCompany.name}</CardTitle>
              <CardDescription className="text-xl">NUIT: {mockCompany.nuit}</CardDescription>
            </div>
            <div className="flex flex-col gap-4">
              <Button variant="outline" size="lg" className="text-lg px-6 py-6" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-6 w-6 mr-3" />
                Editar Empresa
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-6 py-6" onClick={() => navigate(`/admin/reports?company=${id}`)}>
                <FileText className="h-6 w-6 mr-3" />
                Ver Relatório Mensal
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-6 py-6 text-destructive" onClick={() => setIsDeactivateDialogOpen(true)}>
                <Trash2 className="h-6 w-6 mr-3" />
                Desativar Empresa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <p className="text-xl text-muted-foreground mb-3">Colaboradores</p>
              <p className="text-5xl font-bold">{mockCompany.employees}</p>
            </div>
            <div>
              <p className="text-xl text-muted-foreground mb-3">Plano</p>
              <p className="text-5xl font-bold">{mockCompany.plan}</p>
              <p className="text-base text-muted-foreground mt-2">{mockCompany.totalSessions} sessões/mês</p>
            </div>
            <div>
              <p className="text-xl text-muted-foreground mb-3">Sessões</p>
              <Progress value={usagePercent} className="mt-4 h-4" />
              <p className="text-base text-muted-foreground mt-3">{mockCompany.usedSessions} de {mockCompany.totalSessions}</p>
            </div>
            <div>
              <p className="text-xl text-muted-foreground mb-3">Estado</p>
              <Badge variant="default" className="mt-3 text-lg px-6 py-2">Ativa</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
          <Card>
            <CardHeader className="pb-8">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-3xl">Gestão de Colaboradores</CardTitle>
                  <CardDescription className="text-lg mt-2">Importe, gere e distribua códigos de acesso</CardDescription>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="lg" onClick={handleImportCSV} disabled={isUploading} className="justify-start">
                            <Upload className="h-5 w-5 mr-2" />
                            {isUploading ? 'A carregar ficheiro...' : 'Importar Colaboradores'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-base"><p>Faça upload de um ficheiro .csv com nome e email dos colaboradores</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="lg" onClick={handleGenerateCodes} disabled={isGenerating} className="justify-start">
                            <RefreshCw className="h-5 w-5 mr-2" />
                            {isGenerating ? 'A gerar códigos...' : 'Gerar Códigos'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-base"><p>Cria códigos únicos para todos os colaboradores importados</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="lg" onClick={handleSendEmails} disabled={isSending} className="justify-start">
                            <Mail className="h-5 w-5 mr-2" />
                            {isSending ? `A enviar emails (${sendingProgress.current}/${sendingProgress.total})` : 'Enviar por Email'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-base"><p>Envia automaticamente os códigos para o email de cada colaborador</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="lg" onClick={handleExportCSV} className="justify-start">
                            <Download className="h-5 w-5 mr-2" />
                            Exportar CSV
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-base"><p>Descarregue um ficheiro com nomes e códigos para enviar à empresa</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">

              <p className="text-lg text-muted-foreground">
                <a href="#" onClick={(e) => { e.preventDefault(); downloadCSVTemplate(); }} className="text-vibrant-blue hover:underline text-lg">
                  📎 Descarregar modelo CSV
                </a>
              </p>

              {isSending && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-900">A enviar emails...</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p className="text-sm text-blue-700">
                      {sendingProgress.current} de {sendingProgress.total} emails enviados
                    </p>
                    <Progress 
                      value={(sendingProgress.current / sendingProgress.total) * 100} 
                      className="h-2"
                    />
                  </AlertDescription>
                </Alert>
              )}

              {csvErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTitle>Erros de Validação</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {csvErrors.slice(0, 5).map((error, idx) => (
                        <li key={idx}>Linha {error.line}: {error.field} - {error.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum colaborador importado</h3>
                  <p className="text-muted-foreground mb-4">Comece por importar colaboradores através de um ficheiro CSV</p>
                  <Button onClick={handleImportCSV}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Colaboradores
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Data de Envio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map(emp => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>{emp.email}</TableCell>
                        <TableCell className="font-mono">{emp.code || '-'}</TableCell>
                        <TableCell>{emp.sentDate || '-'}</TableCell>
                        <TableCell>{getStatusBadge(emp.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {emp.code && (
                              <Button variant="ghost" size="icon" onClick={() => setEmailToResend({ id: emp.id, email: emp.email })}>
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => setEmployeeToRemove(emp.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        </div>
      </div>

      <div className="border-t p-6">
        <div className="container mx-auto">
          <div className="pb-6">
            <h3 className="text-3xl font-semibold">Estatísticas Rápidas</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div>
              <p className="text-base text-muted-foreground mb-2">Total de colaboradores</p>
              <p className="text-4xl font-bold">{employees.length}</p>
            </div>
            <div>
              <p className="text-base text-muted-foreground mb-2">Com código enviado</p>
              <p className="text-4xl font-bold">{employeesWithCode}</p>
            </div>
            <div>
              <p className="text-base text-muted-foreground mb-2">Por enviar</p>
              <p className="text-4xl font-bold">{employeesPending}</p>
            </div>
            <div className="space-y-3">
              <p className="text-base text-muted-foreground">Taxa de envio de códigos</p>
              <p className="text-4xl font-bold">{employees.length > 0 ? Math.round((employeesWithCode / employees.length) * 100) : 0}%</p>
              <Progress 
                value={employees.length > 0 ? (employeesWithCode / employees.length) * 100 : 0} 
                className="h-3"
              />
            </div>
            <div>
              <p className="text-base text-muted-foreground mb-2">Último envio</p>
              <p className="text-base font-medium">
                {lastSendTimestamp || 'Nenhum envio realizado'}
              </p>
            </div>
          </div>
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
              onClick={() => {
                if (employeeToRemove) {
                  const employee = employees.find(e => e.id === employeeToRemove);
                  setEmployees(employees.filter(e => e.id !== employeeToRemove));
                  toast({ title: 'Colaborador Removido', description: `${employee?.name || ''} foi removido da lista` });
                  setEmployeeToRemove(null);
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
              onClick={() => {
                if (emailToResend) {
                  setEmployees(prev => prev.map(emp =>
                    emp.id === emailToResend.id ? { ...emp, status: 'enviado' as const, sentDate: new Date().toLocaleDateString('pt-PT') } : emp
                  ));
                  toast({ title: 'Código Reenviado', description: `Código enviado para ${emailToResend.email}` });
                  setEmailToResend(null);
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

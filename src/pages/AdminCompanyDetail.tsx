import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Building2,
  Users,
  TrendingUp,
  Upload,
  RefreshCw,
  Mail,
  Download,
  Edit,
  FileText,
  Trash2,
  RotateCcw,
  X
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  code: string;
  sentDate?: string;
  status: 'sem-codigo' | 'codigo-gerado' | 'enviado' | 'erro';
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@empresa.co.mz',
    code: 'MSX9-2K1',
    sentDate: '13/10/2025',
    status: 'enviado'
  },
  {
    id: '2',
    name: 'Carlos Mateus',
    email: 'carlos@empresa.co.mz',
    code: 'MSX9-2K2',
    status: 'codigo-gerado'
  },
  {
    id: '3',
    name: 'Maria João',
    email: 'maria.joao@empresa.co.mz',
    code: '',
    status: 'sem-codigo'
  },
  {
    id: '4',
    name: 'Pedro Santos',
    email: 'pedro@empresa.co.mz',
    code: 'MSX9-2K4',
    sentDate: '12/10/2025',
    status: 'erro'
  },
];

const mockCompany = {
  id: '1',
  name: 'TechCorp Lda',
  nuit: '501234567',
  employees: 100,
  plan: '400 sessões/mês',
  totalSessions: 400,
  usedSessions: 287,
  status: 'Ativa' as const,
  adhesionRate: 65
};

export default function AdminCompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [isUploading, setIsUploading] = useState(false);

  const usagePercent = (mockCompany.usedSessions / mockCompany.totalSessions) * 100;
  const employeesWithCode = employees.filter(e => e.code).length;
  const employeesSent = employees.filter(e => e.status === 'enviado').length;
  const employeesPending = employees.filter(e => e.status === 'codigo-gerado').length;

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploading(true);
        setTimeout(() => {
          setIsUploading(false);
          toast({
            title: 'CSV Importado',
            description: `${file.name} foi importado com sucesso.`
          });
        }, 1500);
      }
    };
    input.click();
  };

  const handleGenerateCodes = () => {
    toast({
      title: 'Códigos Gerados',
      description: `${employees.filter(e => !e.code).length} códigos únicos foram criados.`
    });
    
    setEmployees(employees.map(emp => {
      if (!emp.code) {
        return {
          ...emp,
          code: `MSX9-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
          status: 'codigo-gerado' as const
        };
      }
      return emp;
    }));
  };

  const handleSendEmails = () => {
    toast({
      title: 'Emails em Envio',
      description: 'Os códigos estão a ser enviados para os colaboradores.'
    });
    
    setEmployees(employees.map(emp => {
      if (emp.code && emp.status !== 'enviado') {
        return {
          ...emp,
          status: 'enviado' as const,
          sentDate: new Date().toLocaleDateString('pt-PT')
        };
      }
      return emp;
    }));
  };

  const handleExportCSV = () => {
    toast({
      title: 'CSV Exportado',
      description: 'O ficheiro com os códigos foi descarregado.'
    });
  };

  const handleResendCode = (employeeId: string) => {
    toast({
      title: 'Código Reenviado',
      description: 'O código foi enviado novamente para o colaborador.'
    });
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setEmployees(employees.filter(emp => emp.id !== employeeId));
    toast({
      title: 'Colaborador Removido',
      description: 'O colaborador foi removido da lista.'
    });
  };

  const getStatusBadge = (status: Employee['status']) => {
    const config = {
      'sem-codigo': { label: 'Sem Código', variant: 'secondary' as const, className: 'bg-slate-200 text-slate-700' },
      'codigo-gerado': { label: 'Código Gerado', variant: 'default' as const, className: 'bg-blue-100 text-blue-700' },
      'enviado': { label: 'Enviado', variant: 'default' as const, className: 'bg-emerald-100 text-emerald-700' },
      'erro': { label: 'Erro no Envio', variant: 'destructive' as const, className: 'bg-red-100 text-red-700' }
    };
    
    const { label, className } = config[status];
    
    return (
      <Badge variant="secondary" className={className}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/operations')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Empresas
      </Button>

      {/* Company Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-vibrant-blue" />
                <CardTitle className="text-3xl">{mockCompany.name}</CardTitle>
                <Badge 
                  variant={mockCompany.status === 'Ativa' ? 'default' : 'secondary'}
                  className={mockCompany.status === 'Ativa' ? 'bg-success' : ''}
                >
                  {mockCompany.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">NUIT: {mockCompany.nuit}</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar Empresa
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Ver Relatório Mensal
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Desativar Empresa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Nº de Colaboradores</p>
              <p className="text-2xl font-bold">{mockCompany.employees}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Plano Atual</p>
              <p className="text-lg font-semibold">{mockCompany.plan}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Sessões Usadas/Restantes</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {mockCompany.usedSessions}/{mockCompany.totalSessions}
                  </span>
                  <span className="text-muted-foreground">
                    {mockCompany.totalSessions - mockCompany.usedSessions} restantes
                  </span>
                </div>
                <Progress value={usagePercent} className="h-2" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Taxa de Adesão</p>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{mockCompany.adhesionRate}%</p>
                <Progress value={mockCompany.adhesionRate} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Gestão de Colaboradores</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleImportCSV}
                disabled={isUploading}
                title="Faça upload de um ficheiro .csv com nome e email dos colaboradores."
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'A Importar...' : 'Importar Colaboradores (CSV)'}
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateCodes}
                title="Cria códigos únicos para todos os colaboradores importados."
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar Códigos de Acesso
              </Button>
              <Button
                variant="outline"
                onClick={handleSendEmails}
                title="Envia automaticamente os códigos para o email de cada colaborador."
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Códigos por Email
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                title="Descarregue um ficheiro com nomes e códigos para enviar à empresa."
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV com Códigos
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            📎 <a href="#" className="text-vibrant-blue hover:underline">Descarregar modelo CSV</a>
          </p>
        </CardHeader>
        <CardContent>
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
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell className="text-muted-foreground">{employee.email}</TableCell>
                  <TableCell>
                    {employee.code ? (
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {employee.code}
                      </code>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {employee.sentDate || '—'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(employee.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {employee.status === 'enviado' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendCode(employee.id)}
                          title="Reenviar código"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {employee.status === 'erro' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendCode(employee.id)}
                          title="Reenviar código"
                          className="text-amber-600"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEmployee(employee.id)}
                        className="text-destructive hover:text-destructive"
                        title="Remover colaborador"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Statistics Panel */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-vibrant-blue/10 rounded-lg">
                <Users className="h-5 w-5 text-vibrant-blue" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Colaboradores</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Mail className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Com Código Enviado</p>
                <p className="text-2xl font-bold">{employeesSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <RefreshCw className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Por Enviar</p>
                <p className="text-2xl font-bold">{employeesPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-mint-green/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-mint-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Adesão Atual</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{mockCompany.adhesionRate}%</p>
                  <Progress value={mockCompany.adhesionRate} className="h-2 flex-1" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Último envio: 13/10/2025 às 09h24
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users,
  UserPlus,
  Key,
  Copy,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Shield,
  TrendingUp,
  Activity,
  Target,
  BarChart3
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { InviteEmployeeModal } from '@/components/company/InviteEmployeeModal';
import { mockCompanies } from '@/data/companyMockData';
import { mockEmployeeMetrics } from '@/data/companyMetrics';

const CompanyCollaborators = () => {
  const { toast } = useToast();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  
  // Mock company data (in real app, fetch from context/API)
  const company = mockCompanies[0];
  const seatUsagePercent = Math.round((company.seatUsed / company.seatLimit) * 100);

  useEffect(() => {
    // Add admin-page class to body for gray background
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  const generateInviteCode = () => {
    // Check if we can still generate codes based on available seats
    if (generatedCodes.length >= company.seatAvailable) {
      toast({
        title: "Limite atingido",
        description: `Já foram gerados ${company.seatAvailable} códigos (limite disponível)`,
        variant: "destructive"
      });
      return;
    }

    const code = `MS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setGeneratedCodes([...generatedCodes, code]);
    toast({
      title: "Código gerado",
      description: `Código de acesso: ${code}`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência",
    });
  };

  const downloadCodes = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Código de Acesso,Data de Criação\n" +
      generatedCodes.map(code => `${code},${new Date().toLocaleDateString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "codigos-acesso.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download iniciado",
      description: `${generatedCodes.length} código(s) exportado(s)`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Acessos</h1>
        <p className="text-muted-foreground">
          Convide colaboradores e gere códigos de acesso de forma segura e anónima
        </p>
      </div>


      {/* Seat Usage Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contas</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.seatLimit}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Contas contratadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.seatUsed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em utilização
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.seatAvailable}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Contas restantes
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Privacy Notice */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="flex items-start gap-3 p-4">
          <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Privacidade e Proteção de Dados
            </p>
            <p className="text-sm text-muted-foreground">
              Por motivos de privacidade, não é possível visualizar dados individuais dos colaboradores. 
              As funcionalidades abaixo permitem convidar e gerir acessos de forma anónima.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Functionality Tabs */}
      <Tabs defaultValue="invite" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invite">Convidar Colaborador</TabsTrigger>
          <TabsTrigger value="codes">Códigos de Acesso</TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Convite Individual</CardTitle>
              <p className="text-sm text-muted-foreground">
                Envie um convite personalizado por e-mail para um colaborador
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setInviteModalOpen(true)}
                  disabled={company.seatAvailable === 0}
                  className="w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar por E-mail
                </Button>
              </div>

              {company.seatAvailable === 0 && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">
                    Todas as contas estão em uso. Contacte o administrador para aumentar o limite.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geração de Códigos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Crie códigos de acesso únicos para distribuição em massa
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={generateInviteCode}
                  disabled={company.seatAvailable === 0 || generatedCodes.length >= company.seatAvailable}
                  variant="outline"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Gerar Código ({generatedCodes.length}/{company.seatAvailable})
                </Button>

                {generatedCodes.length > 0 && (
                  <>
                    <Button 
                      onClick={downloadCodes}
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Códigos ({generatedCodes.length})
                    </Button>
                  </>
                )}
              </div>

              {generatedCodes.length >= company.seatAvailable && company.seatAvailable > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20">
                  <XCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Limite de códigos atingido. Já foram gerados {company.seatAvailable} códigos disponíveis.
                  </p>
                </div>
              )}

              {generatedCodes.length > 0 && (
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {generatedCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/50">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {code}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {generatedCodes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nenhum código gerado ainda</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload em Massa</CardTitle>
              <p className="text-sm text-muted-foreground">
                Importe uma lista de colaboradores via ficheiro CSV
              </p>
            </CardHeader>
            <CardContent>
              <Button variant="outline" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV (Em breve)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InviteEmployeeModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        company={company}
        onInviteSuccess={() => {
          toast({
            title: "Convite enviado",
            description: "O colaborador receberá as credenciais por e-mail",
          });
        }}
      />
    </div>
  );
};

export default CompanyCollaborators;

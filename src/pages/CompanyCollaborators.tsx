import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users,
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
import { mockCompanies } from '@/data/companyMockData';
import { mockEmployeeMetrics } from '@/data/companyMetrics';
import { FeaturesGrid } from '@/components/ui/features-grid';

const CompanyCollaborators = () => {
  const { toast } = useToast();
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  
  const company = mockCompanies[0];
  const seatUsagePercent = Math.round((company.seatUsed / company.seatLimit) * 100);

  useEffect(() => {
    document.body.classList.add('company-page');
    
    return () => {
      document.body.classList.remove('company-page');
    };
  }, []);

  const generateInviteCode = () => {
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
    <div className="space-y-0">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">Gestão de Colaboradores</h1>
        <p className="text-muted-foreground text-lg">
          Convide e gerencie o acesso dos colaboradores à plataforma de bem-estar
        </p>
      </div>

      {/* Features Grid Section */}
      <FeaturesGrid />

      {/* Access Management Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Seat Usage Cards */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Utilização de Contas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg border">
                  <div className="text-3xl font-bold text-foreground">{company.seatLimit}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="text-3xl font-bold text-emerald-600">{company.seatUsed}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ativas</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-3xl font-bold text-blue-600">{company.seatAvailable}</div>
                  <p className="text-xs text-muted-foreground mt-1">Disponíveis</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Taxa de Utilização</span>
                  <span className="font-semibold">{seatUsagePercent}%</span>
                </div>
                <Progress value={seatUsagePercent} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 hover-lift">
            <CardContent className="flex items-start gap-3 p-6">
              <Shield className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-base font-semibold text-foreground mb-2">
                  Privacidade e Proteção de Dados
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Por motivos de privacidade, não é possível visualizar dados individuais dos colaboradores. 
                  As funcionalidades abaixo permitem convidar e gerir acessos de forma anónima e segura, 
                  em conformidade com o RGPD.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Generation */}
        <Card className="mt-6 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Geração de Códigos de Acesso
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Crie códigos únicos para distribuição em massa aos colaboradores
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={generateInviteCode}
                disabled={company.seatAvailable === 0 || generatedCodes.length >= company.seatAvailable}
                size="lg"
                className="gap-2"
              >
                <Key className="h-4 w-4" />
                Gerar Código ({generatedCodes.length}/{company.seatAvailable})
              </Button>

              {generatedCodes.length > 0 && (
                <Button 
                  onClick={downloadCodes}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar Códigos ({generatedCodes.length})
                </Button>
              )}
            </div>

            {generatedCodes.length >= company.seatAvailable && company.seatAvailable > 0 && (
              <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20">
                <XCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Limite de códigos atingido. Já foram gerados {company.seatAvailable} códigos disponíveis.
                </p>
              </div>
            )}

            {generatedCodes.length > 0 && (
              <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
                {generatedCodes.map((code, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <code className="text-base font-mono bg-muted px-3 py-2 rounded font-semibold">
                      {code}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(code)}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {generatedCodes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Key className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-base">Nenhum código gerado ainda</p>
                <p className="text-sm mt-1">Clique no botão acima para gerar códigos de acesso</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyCollaborators;

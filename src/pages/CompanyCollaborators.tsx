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
      <FeaturesGrid 
        onGenerateCode={generateInviteCode}
        codesGenerated={generatedCodes.length}
        seatsAvailable={company.seatAvailable}
        canGenerateMore={company.seatAvailable > 0 && generatedCodes.length < company.seatAvailable}
        generatedCodes={generatedCodes}
        onCopyCode={copyToClipboard}
        onDownloadCodes={downloadCodes}
        seatLimit={company.seatLimit}
        seatUsed={company.seatUsed}
        seatUsagePercent={seatUsagePercent}
      />

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
                  As funcionalidades acima permitem convidar e gerir acessos de forma anónima e segura, 
                  em conformidade com o RGPD.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyCollaborators;

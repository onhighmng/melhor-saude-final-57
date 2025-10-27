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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { mockCompanies } from '@/data/companyMockData';
import { mockEmployeeMetrics } from '@/data/companyMetrics';
import { FeaturesGrid } from '@/components/ui/features-grid';

const CompanyCollaborators = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  
  const company = mockCompanies[0];
  const seatUsagePercent = Math.round((company.seatUsed / company.seatLimit) * 100);

  useEffect(() => {
    document.body.classList.add('company-page');
    
    return () => {
      document.body.classList.remove('company-page');
    };
  }, []);

  // Load existing invite codes from database
  useEffect(() => {
    const loadInviteCodes = async () => {
      if (!profile?.company_id) return;
      
      try {
        const { data } = await supabase
          .from('invites')
          .select('invite_code')
          .eq('company_id', profile.company_id)
          .eq('status', 'pending');
        
        if (data) {
          setGeneratedCodes(data.map(inv => inv.invite_code));
        }
      } catch (error) {
        console.error('Error loading invite codes:', error);
      }
    };
    
    loadInviteCodes();
  }, [profile?.company_id]);

  const generateInviteCode = async () => {
    if (generatedCodes.length >= company.seatAvailable) {
      toast({
        title: "Limite atingido",
        description: `Já foram gerados ${company.seatAvailable} códigos (limite disponível)`,
        variant: "destructive"
      });
      return;
    }

    try {
      const code = `MS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Persist to database
      const { error } = await supabase.from('invites').insert({
        invite_code: code,
        company_id: profile?.company_id,
        invited_by: profile?.id,
        email: '', // To be filled by invited user
        role: 'user',
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

      if (error) throw error;

      setGeneratedCodes([...generatedCodes, code]);
      toast({
        title: "Código gerado",
        description: `Código de acesso: ${code}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o código",
        variant: "destructive"
      });
    }
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
      </div>
    </div>
  );
};

export default CompanyCollaborators;

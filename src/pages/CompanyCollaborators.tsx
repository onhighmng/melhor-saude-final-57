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
import { FeaturesGrid } from '@/components/ui/features-grid';

const CompanyCollaborators = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [companyData, setCompanyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!profile?.company_id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();

        if (companyError) {
          console.error('Company error:', companyError);
          throw companyError;
        }

        // Use left join instead of inner join to avoid missing data
        const { data: employees, error: empError } = await supabase
          .from('company_employees')
          .select(`
            *,
            profiles(name, email, avatar_url)
          `)
          .eq('company_id', profile.company_id);
        
        if (empError) {
          console.error('Employees error:', empError);
          throw empError;
        }

        // Get bookings separately
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, user_id, status, rating')
          .eq('company_id', profile.company_id);

        if (bookingsError) {
          console.error('Bookings error:', bookingsError);
        }

        // Merge bookings with employees
        const enrichedEmployees = employees?.map(emp => ({
          ...emp,
          bookings: bookings?.filter(b => b.user_id === emp.user_id) || []
        })) || [];

        const registeredEmployees = enrichedEmployees.length;
        const activeEmployees = enrichedEmployees.filter(e => e.is_active).length;
        const totalSessions = enrichedEmployees.reduce((sum, e) => sum + (e.sessions_used || 0), 0);
        const avgSessions = registeredEmployees > 0 ? totalSessions / registeredEmployees : 0;
        const allRatings = enrichedEmployees.flatMap(e => e.bookings.filter((b: any) => b.rating).map((b: any) => b.rating));
        const avgRating = allRatings.length > 0 ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length : 0;

        setCompanyData({
          ...company,
          name: company.company_name,
          registeredEmployees,
          activeEmployees,
          avgSessions: Math.round(avgSessions * 10) / 10,
          avgRating: Math.round(avgRating * 10) / 10
        });
      } catch (error) {
        console.error('Error loading company data:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados da empresa',
          variant: 'destructive'
        });
        setCompanyData(null);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [profile?.company_id]);

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
    if (!companyData) {
      toast({
        title: "Erro",
        description: "Dados da empresa não carregados",
        variant: "destructive"
      });
      return;
    }

    const seatsAvailable = (companyData.sessions_allocated || 0) - (companyData.sessions_used || 0);
    if (generatedCodes.length >= seatsAvailable) {
      toast({
        title: "Limite atingido",
        description: `Já foram gerados ${seatsAvailable} códigos (limite disponível)`,
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

  if (loading) {
    return (
      <div className="space-y-0 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">A carregar dados...</p>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="space-y-0 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Erro ao carregar dados da empresa</p>
        </div>
      </div>
    );
  }

  const seatLimit = companyData.sessions_allocated || 0;
  const seatUsed = companyData.sessions_used || 0;
  const seatAvailable = seatLimit - seatUsed;
  const seatUsagePercent = seatLimit > 0 ? Math.round((seatUsed / seatLimit) * 100) : 0;

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
        seatsAvailable={seatAvailable}
        canGenerateMore={seatAvailable > 0 && generatedCodes.length < seatAvailable}
        generatedCodes={generatedCodes}
        onCopyCode={copyToClipboard}
        onDownloadCodes={downloadCodes}
        seatLimit={seatLimit}
        seatUsed={seatUsed}
        seatUsagePercent={seatUsagePercent}
      />

      {/* Access Management Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
      </div>
    </div>
  );
};

export default CompanyCollaborators;

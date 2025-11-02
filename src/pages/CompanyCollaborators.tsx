import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users,
  Key,
  Copy,
  Download,
  Building2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FeaturesGrid } from '@/components/ui/features-grid';
import { EmployeeListSection } from '@/components/company/EmployeeListSection';

const CompanyCollaborators = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [companyData, setCompanyData] = useState<any>(null);
  const [seatStats, setSeatStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!profile?.company_id) {
        setLoading(false);
        // Set empty data to prevent infinite loading
        setCompanyData({
          registeredEmployees: 0,
          activeEmployees: 0,
          totalSessions: 0,
          avgSatisfaction: 0,
          employees: []
        });
        setSeatStats({
          employee_seats: 0,
          active_employees: 0,
          pending_invites: 0,
          total_used_seats: 0,
          available_seats: 0,
          sessions_allocated: 0,
          sessions_used: 0,
          sessions_available: 0
        });
        return;
      }
      
      setLoading(true);
      try {
        // Get company basic info
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();

        if (companyError) {
          console.error('Company error:', companyError);
          throw companyError;
        }

        // Get seat statistics using RPC function
        const { data: seatData, error: seatError } = await supabase
          .rpc('get_company_seat_stats', { p_company_id: profile.company_id })
          .single();

        if (seatError) {
          console.error('Seat stats error:', seatError);
        } else {
          setSeatStats(seatData);
        }

        // Use left join instead of inner join to avoid missing data
        const { data: employees, error: empError } = await supabase
          .from('company_employees')
          .select(`
            *,
            profiles(name, email, avatar_url, is_active)
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
        const activeEmployees = enrichedEmployees.filter(e => e.profiles?.is_active !== false).length;
        const totalSessions = enrichedEmployees.reduce((sum, e) => sum + (e.sessions_used || 0), 0);
        const avgSessions = registeredEmployees > 0 ? totalSessions / registeredEmployees : 0;
        const allRatings = enrichedEmployees.flatMap(e => e.bookings.filter((b: any) => b.rating).map((b: any) => b.rating));
        const avgRating = allRatings.length > 0 ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length : 0;

        setCompanyData({
          ...company,
          name: company.company_name || company.name,
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
      if (!profile?.id) return;
      
      try {
        // Load codes created by this HR user
        const { data } = await supabase
          .from('invites')
          .select('invite_code')
          .eq('invited_by', profile.id)
          .eq('status', 'pending')
          .eq('role', 'user'); // Only count employee codes
        
        if (data) {
          setGeneratedCodes(data.map(inv => inv.invite_code));
        }
      } catch (error) {
        console.error('Error loading invite codes:', error);
      }
    };
    
    loadInviteCodes();
  }, [profile?.id]);

  const generateInviteCode = async () => {
    // HR users can generate codes without company restriction
    // The company_id from their profile will be used if available, otherwise NULL
    
    try {
      // Use the RPC function to generate access code
      const { data, error } = await supabase.rpc('generate_access_code', {
        p_user_type: 'user',
        p_company_id: profile?.company_id || null, // Use company_id if exists, otherwise NULL
        p_metadata: {
          generated_by: profile?.email || 'unknown',
          generated_at: new Date().toISOString(),
          hr_generated: true
        },
        p_expires_days: 30
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum código foi gerado');
      }

      const code = data[0].invite_code;
      
      setGeneratedCodes([...generatedCodes, code]);
      
      // Refresh seat stats only if company exists
      if (profile?.company_id && seatStats) {
        const { data: updatedSeats } = await supabase
          .rpc('get_company_seat_stats', { p_company_id: profile.company_id })
          .single();
        if (updatedSeats) {
          setSeatStats(updatedSeats);
        }
      }

      toast({
        title: "Código gerado com sucesso!",
        description: `Código de acesso: ${code}`,
        duration: 5000
      });
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar o código",
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

  // Use seat stats if available, otherwise fall back to default values
  const seatLimit = seatStats?.employee_seats || 50;
  const seatUsed = seatStats?.total_used_seats || 0;
  const seatAvailable = seatStats?.available_seats || seatLimit - seatUsed;
  const seatUsagePercent = seatLimit > 0 ? Math.round((seatUsed / seatLimit) * 100) : 0;

  // Sessions statistics (separate from seat statistics)
  const sessionsTotal = seatStats?.sessions_allocated || companyData?.sessions_allocated || 0;
  const sessionsUsed = seatStats?.sessions_used || companyData?.sessions_used || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">Gestão de Colaboradores</h1>
        <p className="text-muted-foreground text-lg">
          Convide e gerencie o acesso dos colaboradores à plataforma de bem-estar
        </p>
      </div>

      {/* Subscription Plan Summary Card - Only show if company exists */}
      {seatStats && profile?.company_id && (
        <div className="max-w-7xl mx-auto px-6">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plano de Subscrição</p>
                    <p className="text-2xl font-bold text-foreground">{seatLimit} Lugares para Colaboradores</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{seatStats.active_employees}</p>
                    <p className="text-xs text-muted-foreground">Ativos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{seatStats.pending_invites}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{seatAvailable}</p>
                    <p className="text-xs text-muted-foreground">Disponíveis</p>
                  </div>
                </div>
              </div>
              
              {seatAvailable <= 5 && seatAvailable > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <span className="text-amber-600 text-sm">⚠️</span>
                  <p className="text-sm text-amber-800">
                    Atenção: Restam apenas {seatAvailable} lugar{seatAvailable !== 1 ? 'es' : ''} disponível{seatAvailable !== 1 ? 'is' : ''} no seu plano. 
                    {seatAvailable === 1 ? ' Considere fazer upgrade para adicionar mais colaboradores.' : ''}
                  </p>
                </div>
              )}
              
              {seatAvailable <= 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <span className="text-red-600 text-sm">🚫</span>
                  <p className="text-sm text-red-800">
                    Limite do plano atingido. Você usou todos os {seatLimit} lugares disponíveis. 
                    Entre em contato para fazer upgrade do seu plano.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* HR Info Card - Show when no company is linked */}
      {!profile?.company_id && (
        <div className="max-w-7xl mx-auto px-6">
          <Card className="border-primary/20 bg-gradient-to-r from-blue-50 via-blue-25 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Key className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gerador de Códigos HR</p>
                  <p className="text-lg font-bold text-foreground">Sem limite de subscrição</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Como HR, você pode gerar códigos de acesso ilimitados para colaboradores
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Grid Section */}
      <FeaturesGrid 
        onGenerateCode={generateInviteCode}
        codesGenerated={generatedCodes.length}
        seatsAvailable={profile?.company_id ? seatAvailable : 999} // Unlimited if no company
        canGenerateMore={true} // HR can always generate codes
        generatedCodes={generatedCodes}
        onCopyCode={copyToClipboard}
        onDownloadCodes={downloadCodes}
        seatLimit={profile?.company_id ? seatLimit : 999}
        seatUsed={profile?.company_id ? seatUsed : 0}
        seatUsagePercent={profile?.company_id ? seatUsagePercent : 0}
      />

      {/* Employee Management Section */}
      <EmployeeListSection companyId={profile?.company_id} />
    </div>
  );
};

export default CompanyCollaborators;

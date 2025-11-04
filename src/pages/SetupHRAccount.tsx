import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, CheckCircle, Loader2 } from 'lucide-react';

export default function SetupHRAccount() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, email, employee_seats')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkToCompany = async () => {
    if (!selectedCompanyId) {
      toast({
        title: 'Erro',
        description: 'Selecione uma empresa',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você não está autenticado',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      // Update profile to HR role and link to company
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'hr',
          company_id: selectedCompanyId,
          is_active: true
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Add HR role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'hr'
        } as any);

      // Ignore duplicate errors
      if (roleError && roleError.code !== '23505') {
        console.error('Role error:', roleError);
      }

      toast({
        title: 'Sucesso!',
        description: 'Conta configurada como HR. Redirecionando...'
      });

      // Reload to refresh auth context
      setTimeout(() => {
        window.location.href = '/company/colaboradores';
      }, 1500);

    } catch (error) {
      console.error('Error linking account:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível configurar a conta',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configurar Conta HR</CardTitle>
          <CardDescription>
            Configure sua conta como gestor de RH de uma empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecione a Empresa</label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Escolha uma empresa..." />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{company.name}</span>
                      <span className="text-xs text-muted-foreground ml-4">
                        {company.employee_seats} lugares
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {companies.length === 0 && (
            <div className="text-center p-6 border border-dashed rounded-lg">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma empresa disponível. 
                <br />
                <Button 
                  variant="link" 
                  className="p-0 h-auto mt-2"
                  onClick={() => navigate('/register/company')}
                >
                  Registar nova empresa →
                </Button>
              </p>
            </div>
          )}

          <Button 
            onClick={handleLinkToCompany}
            disabled={!selectedCompanyId || submitting}
            className="w-full h-12"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configurando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Configurar Conta HR
              </>
            )}
          </Button>

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/register/company')}
              className="text-sm"
            >
              Ou registar nova empresa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}






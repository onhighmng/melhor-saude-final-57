import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2, CheckCircle } from 'lucide-react';

export default function QuickSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fixing, setFixing] = useState(false);

  const handleQuickFix = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado',
        variant: 'destructive'
      });
      return;
    }

    setFixing(true);

    try {
      // Create company for this user
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: `Company ${user.email?.split('@')[0]}`,
          email: user.email!,
          phone: '',
          employee_seats: 50,
          sessions_allocated: 200,
          sessions_used: 0,
          plan_type: 'business',
          is_active: true
        } as any)
        .select()
        .single();

      if (companyError) {
        // Company might already exist for this email
        if (companyError.code === '23505') {
          // Get existing company
          const { data: existingCompany } = await supabase
            .from('companies')
            .select()
            .eq('email', user.email!)
            .single();
          
          if (existingCompany) {
            // Use existing company
            await linkToCompany(user.id, existingCompany.id);
            return;
          }
        }
        throw companyError;
      }

      await linkToCompany(user.id, company.id);

    } catch (error) {
      console.error('Error in quick setup:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao configurar conta',
        variant: 'destructive'
      });
    } finally {
      setFixing(false);
    }
  };

  const linkToCompany = async (userId: string, companyId: string) => {
    // Create/update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: user!.email!,
        name: user!.email?.split('@')[0] || 'HR Manager',
        role: 'hr',
        company_id: companyId,
        is_active: true
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('Profile error:', profileError);
    }

    // Add HR role
    await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'hr'
      } as any, {
        onConflict: 'user_id,role',
        ignoreDuplicates: true
      });

    toast({
      title: '✅ Configurado!',
      description: 'Conta configurada com 50 lugares. Redirecionando...'
    });

    setTimeout(() => {
      window.location.href = '/company/colaboradores';
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configuração Rápida</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Clique para configurar sua conta como HR com 50 lugares para colaboradores.
          </p>

          <Button 
            onClick={handleQuickFix}
            disabled={fixing}
            size="lg"
            className="w-full"
          >
            {fixing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Configurando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Configurar Agora
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Isso criará uma empresa vinculada ao seu email e permitirá gerar códigos de acesso.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


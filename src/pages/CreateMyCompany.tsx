import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, Loader2, CheckCircle } from 'lucide-react';

const packageOptions = [
  { id: 'starter', name: 'Starter', seats: 10, sessions: 40, price: '€99/mês' },
  { id: 'business', name: 'Business', seats: 50, sessions: 200, price: '€399/mês', popular: true },
  { id: 'professional', name: 'Professional', seats: 100, sessions: 400, price: '€699/mês' },
  { id: 'enterprise', name: 'Enterprise', seats: 200, sessions: 1000, price: 'Personalizado' }
];

export default function CreateMyCompany() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('business');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateCompany = async () => {
    if (!companyName.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite o nome da empresa',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const selectedPkg = packageOptions.find(p => p.id === selectedPackage)!;

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          email: user.email!,
          phone: phone,
          employee_seats: selectedPkg.seats,
          sessions_allocated: selectedPkg.sessions,
          sessions_used: 0,
          plan_type: selectedPackage,
          is_active: true
        } as any)
        .select()
        .single();

      if (companyError) throw companyError;

      // Update profile to HR and link to company
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'hr',
          company_id: company.id,
          phone: phone,
          is_active: true
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Add HR role
      await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'hr'
        } as any)
        .then(res => {
          if (res.error && res.error.code !== '23505') {
            console.error('Role error:', res.error);
          }
        });

      toast({
        title: '✅ Empresa criada!',
        description: `${companyName} agora tem ${selectedPkg.seats} lugares para colaboradores.`
      });

      // Reload to refresh auth context
      setTimeout(() => {
        window.location.href = '/company/colaboradores';
      }, 1500);

    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a empresa',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Criar Minha Empresa</CardTitle>
          <CardDescription className="text-base">
            Configure sua empresa e escolha quantos colaboradores pode adicionar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da Empresa *</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: Tech Solutions Lda"
              className="h-12"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+258 84 000 0000"
              className="h-12"
            />
          </div>

          {/* Package Selection */}
          <div className="space-y-3">
            <Label>Escolha o Pacote *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packageOptions.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                    selectedPackage === pkg.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 right-2">
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">Popular</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold">{pkg.name}</h4>
                    <p className="text-sm text-primary font-semibold">{pkg.price}</p>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {pkg.seats} Colaboradores
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {pkg.sessions} Sessões
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleCreateCompany}
            disabled={!companyName.trim() || submitting}
            className="w-full h-14 text-lg"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Criando Empresa...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Criar Empresa e Começar
              </>
            )}
          </Button>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">✨ O que acontece depois:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Sua empresa é criada com {packageOptions.find(p => p.id === selectedPackage)?.seats} lugares</li>
              <li>✓ Você vira gestor de RH automaticamente</li>
              <li>✓ Pode gerar códigos para colaboradores imediatamente</li>
              <li>✓ Cada código permite 1 colaborador registar-se</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




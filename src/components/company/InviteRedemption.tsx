import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface InviteRedemptionProps {
  onSuccess?: (companyId: string, companyName: string) => void;
}

export const InviteRedemption = ({ onSuccess }: InviteRedemptionProps) => {
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const handleRedeemInvite = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um código de convite',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Get auth session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: 'Erro',
          description: 'Você não está autenticado',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Call Edge Function to redeem invite
      const { data, error } = await supabase.functions.invoke('invite-redeem', {
        body: {
          invite_code: inviteCode.trim().toUpperCase(),
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setRedeemed(true);
        setCompanyName(data.company_name);
        toast({
          title: 'Sucesso',
          description: `Você foi adicionado a ${data.company_name}!`,
        });

        // Call callback if provided
        if (onSuccess) {
          onSuccess(data.company_id, data.company_name);
        }

        // Clear input
        setInviteCode('');

        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = `/company/dashboard`;
        }, 2000);
      } else {
        toast({
          title: 'Erro',
          description: data?.message || 'Falha ao resgatar convite',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error redeeming invite:', error);
      toast({
        title: 'Erro',
        description: error?.message || 'Erro ao resgatar convite',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleRedeemInvite();
    }
  };

  if (redeemed) {
    return (
      <Card className="w-full max-w-md mx-auto border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Sucesso!</h3>
              <p className="text-sm text-green-700 mt-1">
                Você foi adicionado a <strong>{companyName}</strong>
              </p>
              <p className="text-xs text-green-600 mt-2">
                Redirecionando para o dashboard...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Usar Código de Convite</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Código de Convite
          </label>
          <Input
            placeholder="Ex: MS-ABC123"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="font-mono"
          />
          <p className="text-xs text-gray-500 mt-2">
            Insira o código de convite recebido da sua empresa
          </p>
        </div>

        <Button
          onClick={handleRedeemInvite}
          disabled={loading || !inviteCode.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resgatando...
            </>
          ) : (
            'Resgatar Convite'
          )}
        </Button>

        <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
          <p>
            Ao usar este código, você será vinculado à empresa correspondente e
            poderá acessar todos os benefícios de bem-estar.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

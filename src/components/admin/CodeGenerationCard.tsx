import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserType, CodeStats } from '@/types/accessCodes';

interface CodeGenerationCardProps {
  userType: UserType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
  textColor: string;
  stats: CodeStats;
  onStatsUpdate: () => void;
}

export const CodeGenerationCard = ({
  userType,
  title,
  description,
  icon: Icon,
  bgColor,
  iconColor,
  textColor,
  stats,
  onStatsUpdate
}: CodeGenerationCardProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      // Use Edge Function instead of RPC to bypass PostgREST cache issues
      const { data, error } = await supabase.functions.invoke('generate_access_code', {
        body: { p_user_type: userType }
      });

      if (error) throw error;
      
      // Handle JSONB response
      let codeData;
      if (typeof data === 'string') {
        codeData = JSON.parse(data);
      } else if (Array.isArray(data) && data.length > 0) {
        codeData = data[0];
      } else {
        codeData = data;
      }
      
      const inviteCode = codeData?.invite_code || codeData;
      if (!inviteCode) throw new Error('Failed to generate code');
      
      setGeneratedCode(inviteCode);
      setIsCodeModalOpen(true);
      
      toast({
        title: 'Código Gerado',
        description: `Código ${inviteCode} criado com sucesso!`,
      });

      // Refresh stats
      onStatsUpdate();
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar código. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Código copiado para a área de transferência',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'used':
        return 'bg-blue-100 text-blue-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <Card className={`${bgColor} border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${bgColor} border border-white/20`}>
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsStatsModalOpen(true)}
                className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/30"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className={`text-xl font-bold ${textColor}`}>
              {title}
            </h3>
            <p className={`text-sm ${textColor} opacity-80 leading-relaxed`}>
              {description}
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Badge className={getStatusColor('active')}>
                  {stats.active} Ativos
                </Badge>
                <Badge className={getStatusColor('used')}>
                  {stats.used} Usados
                </Badge>
              </div>
              <div className={`text-sm font-medium ${textColor}`}>
                Total: {stats.total}
              </div>
            </div>
            
            {/* Generate Button */}
            <Button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className={`w-full ${textColor} bg-white/20 hover:bg-white/30 border border-white/30`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Código'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Code Modal */}
      <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              Código Gerado - {title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Código de Acesso:</div>
              <div className="font-mono text-lg font-bold text-gray-900">
                {generatedCode}
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Este código expira em 30 dias e pode ser usado para registar um novo {userType === 'personal' ? 'utilizador pessoal' : userType === 'hr' ? 'responsável de empresa' : userType === 'prestador' ? 'prestador' : 'colaborador'}.
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => copyToClipboard(generatedCode!)}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Código
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCodeModalOpen(false)}
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Modal */}
      <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              Estatísticas - {title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{stats.active}</div>
              <div className="text-sm text-green-600">Ativos</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{stats.used}</div>
              <div className="text-sm text-blue-600">Usados</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{stats.expired}</div>
              <div className="text-sm text-gray-600">Expirados</div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsStatsModalOpen(false)}
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

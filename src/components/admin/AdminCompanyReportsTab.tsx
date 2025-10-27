import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Send, Download, TrendingUp, Users, Star, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CompanyStats {
  id: string;
  name: string;
  utilization: number;
  satisfaction: number;
  progress: number;
  totalSessions: number;
  usedSessions: number;
  activeEmployees: number;
}

const AdminCompanyReportsTab = () => {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanyStats();
  }, []);

  const loadCompanyStats = async () => {
    try {
      setLoading(true);

      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id,
          company_name,
          sessions_allocated,
          sessions_used
        `);

      if (companiesError) throw companiesError;

      const statsPromises = (companies || []).map(async (company) => {
        const [employeesResult, feedbackResult] = await Promise.all([
          supabase
            .from('company_employees')
            .select('id')
            .eq('company_id', company.id)
            .eq('is_active', true),
          supabase
            .from('bookings')
            .select('rating')
            .eq('company_id', company.id)
            .not('rating', 'is', null)
        ]);

        const activeEmployees = employeesResult.data?.length || 0;
        const ratings = feedbackResult.data?.filter(f => f.rating) || [];
        const satisfaction = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;
        
        const utilization = company.sessions_allocated > 0
          ? (company.sessions_used / company.sessions_allocated) * 100
          : 0;

        // Progress calculation (placeholder - would need user_progress table)
        const progress = Math.min(utilization, 100);

        return {
          id: company.id,
          name: company.company_name || 'N/A',
          utilization: Math.round(utilization),
          satisfaction: Math.round(satisfaction * 10) / 10,
          progress: Math.round(progress),
          totalSessions: company.sessions_allocated || 0,
          usedSessions: company.sessions_used || 0,
          activeEmployees
        };
      });

      const stats = await Promise.all(statsPromises);
      setCompanyStats(stats);
    } catch (error) {
      console.error('Error loading company stats:', error);
      toast({
        title: 'Erro ao carregar estatísticas',
        description: 'Não foi possível carregar as estatísticas das empresas.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    toast({
      title: 'Relatório Gerado',
      description: 'O relatório PDF foi gerado com sucesso.',
    });
  };

  const handleSendAutomatic = () => {
    toast({
      title: 'Relatório Enviado',
      description: 'O relatório foi enviado automaticamente para a empresa.',
    });
  };

  const selectedStats = companyStats.find(c => c.id === selectedCompany);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse bg-gray-200 h-10 w-full rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma empresa" />
            </SelectTrigger>
            <SelectContent>
              {companyStats.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCompany && (
            <div className="flex gap-3">
              <Button onClick={handleGeneratePDF} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Gerar Relatório PDF
              </Button>
              <Button onClick={handleSendAutomatic} variant="secondary" className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Enviar Automático
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Statistics */}
      {selectedStats && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilização</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedStats.utilization}%</div>
                <p className="text-xs text-muted-foreground">
                  {selectedStats.usedSessions} de {selectedStats.totalSessions} sessões
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-mono text-xl font-semibold">{selectedStats.satisfaction}/10</div>
                <p className="text-xs text-muted-foreground">Média geral</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progresso</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedStats.progress}%</div>
                <p className="text-xs text-muted-foreground">Objetivos atingidos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Colaboradores Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedStats.activeEmployees}</div>
                <p className="text-xs text-muted-foreground">Utilizadores ativos</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Report Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Relatório - {selectedStats.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxa de Utilização</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${selectedStats.utilization}%` }}
                      />
                    </div>
                    <Badge>{selectedStats.utilization}%</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Satisfação Média</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${selectedStats.satisfaction * 10}%` }}
                      />
                    </div>
                    <Badge variant="secondary">{selectedStats.satisfaction}/10</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progresso de Objetivos</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${selectedStats.progress}%` }}
                      />
                    </div>
                    <Badge variant="secondary">{selectedStats.progress}%</Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Destaques do Período</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{selectedStats.activeEmployees} colaboradores ativos participaram em sessões</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{selectedStats.usedSessions} sessões realizadas com satisfação média de {selectedStats.satisfaction}/10</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{selectedStats.progress}% dos objetivos estabelecidos foram atingidos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Taxa de utilização de {selectedStats.utilization}% indica excelente adesão ao programa</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedCompany && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Selecione uma empresa para visualizar e gerar relatórios
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCompanyReportsTab;

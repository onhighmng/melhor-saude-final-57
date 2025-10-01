import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  Zap, 
  AlertTriangle,
  Activity,
  Database,
  Shield,
  TrendingUp
} from 'lucide-react';
import { comprehensiveSystemTester, SystemTestResult, PerformanceMetrics } from '@/utils/comprehensiveSystemTesting';
import LoadingSpinner from "@/components/ui/loading-spinner";

const ComprehensiveSystemTestPanel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SystemTestResult[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [testProgress, setTestProgress] = useState(0);

  const runComprehensiveTests = async () => {
    setIsRunning(true);
    setTestProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setTestProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const testResults = await comprehensiveSystemTester.runAllTests();
      
      clearInterval(progressInterval);
      setTestProgress(100);
      
      setResults(testResults.results);
      setPerformanceMetrics(testResults.performanceMetrics);
      setActiveTab('results');
    } catch (error) {
      console.error('Comprehensive testing failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const summary = comprehensiveSystemTester.getTestSummary();
  const performanceBottlenecks = comprehensiveSystemTester.getPerformanceBottlenecks();

  const getResultsByCategory = () => {
    const categories = {
      'Account Creation': results.filter(r => r.component.includes('Account Creation')),
      'Profile Management': results.filter(r => r.component === 'Profile Management'),
      'Company Management': results.filter(r => r.component === 'Company Management'),
      'Session Management': results.filter(r => r.component === 'Session Management'),
      'Change Requests': results.filter(r => r.component === 'Change Requests'),
      'Booking System': results.filter(r => r.component === 'Booking System'),
      'Page Performance': results.filter(r => r.action === 'Page load and render')
    };
    
    return categories;
  };

  const getStatusIcon = (result: string) => {
    return result === '✅ Pass' ? 
      <CheckCircle className="w-4 h-4 text-emerald-green" /> : 
      <XCircle className="w-4 h-4 text-warm-orange" />;
  };

  const getStatusBadge = (result: string) => {
    return result === '✅ Pass' ? 
      <Badge className="bg-emerald-green/20 text-emerald-green border-emerald-green/30">Pass</Badge> :
      <Badge className="bg-warm-orange/20 text-warm-orange border-warm-orange/30">Fail</Badge>;
  };

  const getPerformanceBadge = (time: number) => {
    if (time <= 200) return <Badge className="bg-emerald-green/20 text-emerald-green border-emerald-green/30">Fast</Badge>;
    if (time <= 500) return <Badge className="bg-vibrant-blue/20 text-vibrant-blue border-vibrant-blue/30">Good</Badge>;
    return <Badge className="bg-warm-orange/20 text-warm-orange border-warm-orange/30">Slow</Badge>;
  };

  const categorizedResults = getResultsByCategory();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Sistema de Testes Abrangente
          </CardTitle>
          <CardDescription>
            Validação completa de todos os fluxos de criação, interação e performance do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runComprehensiveTests} 
              disabled={isRunning}
              className="bg-royal-blue hover:bg-navy-blue"
            >
              {isRunning ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Executando Testes...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Executar Testes Abrangentes
                </>
              )}
            </Button>
          </div>

          {isRunning && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Progresso dos Testes</span>
                <span className="text-sm text-slate-grey">{testProgress}%</span>
              </div>
              <Progress value={testProgress} className="w-full" />
            </div>
          )}

          {results.length > 0 && (
            <Alert className="mb-6">
              <TrendingUp className="w-4 h-4" />
              <AlertDescription>
                <strong>Resumo Executivo:</strong> {summary.total} testes executados, 
                {summary.passed} aprovados ({summary.passRate}% taxa de sucesso), 
                {summary.failed} falharam. Tempo médio de resposta: {summary.averageResponseTime}ms, 
                {summary.performanceIssues} problemas de performance detectados.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-royal-blue" />
                    <span className="text-sm font-medium">Criação de Contas</span>
                  </div>
                  <div className="text-2xl font-bold text-navy-blue">
                    {categorizedResults['Account Creation'].length}
                  </div>
                  <div className="text-xs text-slate-grey">
                    {categorizedResults['Account Creation'].filter(r => r.result === '✅ Pass').length} aprovados
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-green" />
                    <span className="text-sm font-medium">Submissões</span>
                  </div>
                  <div className="text-2xl font-bold text-navy-blue">
                    {categorizedResults['Profile Management'].length + 
                     categorizedResults['Company Management'].length + 
                     categorizedResults['Session Management'].length + 
                     categorizedResults['Change Requests'].length + 
                     categorizedResults['Booking System'].length}
                  </div>
                  <div className="text-xs text-slate-grey">Documentos e formulários</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-vibrant-blue" />
                    <span className="text-sm font-medium">Performance</span>
                  </div>
                  <div className="text-2xl font-bold text-navy-blue">
                    {summary.averageResponseTime}ms
                  </div>
                  <div className="text-xs text-slate-grey">Tempo médio</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warm-orange" />
                    <span className="text-sm font-medium">Problemas</span>
                  </div>
                  <div className="text-2xl font-bold text-navy-blue">
                    {summary.performanceIssues}
                  </div>
                  <div className="text-xs text-slate-grey">Performance lenta</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4">
              {Object.entries(categorizedResults).map(([category, categoryResults]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {category}
                      <Badge variant="outline">
                        {categoryResults.filter(r => r.result === '✅ Pass').length}/{categoryResults.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categoryResults.slice(0, 3).map((result, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{result.action}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-grey">{result.timeToInteraction}ms</span>
                            {getStatusIcon(result.result)}
                          </div>
                        </div>
                      ))}
                      {categoryResults.length > 3 && (
                        <div className="text-xs text-slate-grey">
                          +{categoryResults.length - 3} mais testes...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Resultados Detalhados dos Testes</CardTitle>
                <CardDescription>
                  Todos os testes de criação, submissão e interação executados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Componente/Funcionalidade</TableHead>
                        <TableHead>Ação Executada</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Tempo (ms)</TableHead>
                        <TableHead>Validações</TableHead>
                        <TableHead>Erro/Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{result.component}</TableCell>
                          <TableCell>{result.action}</TableCell>
                          <TableCell>{getStatusBadge(result.result)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{result.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{result.timeToInteraction}</span>
                              {getPerformanceBadge(result.timeToInteraction)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {result.validationsPassed?.map((validation, idx) => (
                                <div key={idx} className="text-xs text-emerald-green">✓ {validation}</div>
                              ))}
                              {result.validationsFailed?.map((validation, idx) => (
                                <div key={idx} className="text-xs text-warm-orange">✗ {validation}</div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm max-w-xs">
                            {result.errorMessage && (
                              <div className="text-warm-orange">{result.errorMessage}</div>
                            )}
                            {result.lagDescription && (
                              <div className="text-vibrant-blue">{result.lagDescription}</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Performance</CardTitle>
                  <CardDescription>
                    Análise detalhada de tempos de resposta e gargalos do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-green">
                        {performanceMetrics.filter(p => p.timeToInteraction <= 200).length}
                      </div>
                      <div className="text-sm text-slate-grey">Respostas Rápidas (≤200ms)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-vibrant-blue">
                        {performanceMetrics.filter(p => p.timeToInteraction > 200 && p.timeToInteraction <= 500).length}
                      </div>
                      <div className="text-sm text-slate-grey">Respostas Boas (201-500ms)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warm-orange">
                        {performanceMetrics.filter(p => p.timeToInteraction > 500).length}
                      </div>
                      <div className="text-sm text-slate-grey">Respostas Lentas (&gt;500ms)</div>
                    </div>
                  </div>

                  {performanceBottlenecks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Gargalos de Performance</h3>
                      <div className="space-y-2">
                        {performanceBottlenecks.map((bottleneck, index) => (
                          <Alert key={index}>
                            <Clock className="w-4 h-4" />
                            <AlertDescription>
                              <strong>{bottleneck.componentName}</strong> - {bottleneck.actionTriggered}: 
                              <span className="text-warm-orange font-semibold"> {bottleneck.timeToInteraction}ms</span>
                              {bottleneck.lagDescription && (
                                <div className="text-sm text-slate-grey mt-1">{bottleneck.lagDescription}</div>
                              )}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Validações de Segurança</CardTitle>
                <CardDescription>
                  Testes de validação, autenticação e integridade de dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Shield className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Validações de Entrada:</strong> Todos os formulários testados incluem validação de email, 
                      força de senha, campos obrigatórios e detecção de duplicatas.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Controle de Acesso:</strong> Testes de criação de conta respeitam os níveis de permissão 
                      por função (Admin, HR, Prestador, Usuário).
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Database className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Integridade de Dados:</strong> Validações backend simuladas para todos os fluxos de 
                      submissão de documentos e atualizações de perfil.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ComprehensiveSystemTestPanel;
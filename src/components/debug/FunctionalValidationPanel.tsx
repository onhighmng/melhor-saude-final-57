import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlayCircle, CheckCircle, XCircle, AlertTriangle, Users, Shield, Smartphone, Code, Database, BarChart3, TableIcon } from 'lucide-react';
import { functionalValidator, ValidationResult } from '@/utils/functionalValidation';
import LoadingSpinner from "@/components/ui/loading-spinner";

const FunctionalValidationPanel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const runValidation = async () => {
    setIsRunning(true);
    try {
      const testResults = await functionalValidator.runAllTests();
      setResults(testResults);
      setActiveTab('results');
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const summary = functionalValidator.getTestSummary();

  const getResultsByCategory = () => {
    const categories = {
      'Authentication': results.filter(r => r.component.includes('Login') || r.component.includes('Registration') || r.component.includes('Password')),
      'Admin Dashboard': results.filter(r => r.role === 'Admin' && !r.component.includes('Edge Cases') && !r.component.includes('Security')),
      'HR Dashboard': results.filter(r => r.role === 'HR'),
      'Prestador Dashboard': results.filter(r => r.role === 'Prestador'),
      'User Dashboard': results.filter(r => r.role === 'User' && !r.component.includes('Edge Cases')),
      'Security & RLS': results.filter(r => r.component.includes('RLS') || r.component.includes('Security')),
      'Edge Cases': results.filter(r => r.component.includes('Edge Cases')),
      'UI Components': results.filter(r => r.component.includes('Navigation') || r.component.includes('Form') || r.component.includes('Modal') || r.component.includes('Loading')),
      'Responsive Design': results.filter(r => r.component.includes('Responsive'))
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

  const categorizedResults = getResultsByCategory();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            Validação Funcional Completa
          </CardTitle>
          <CardDescription>
            Teste abrangente de todos os elementos interativos e fluxos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runValidation} 
              disabled={isRunning}
              className="bg-royal-blue hover:bg-navy-blue"
            >
              {isRunning ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Executando Validação...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Executar Validação Completa
                </>
              )}
            </Button>
          </div>

          {results.length > 0 && (
            <Alert className="mb-6">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Resumo dos Testes:</strong> {summary.total} testes executados, 
                {summary.passed} aprovados ({summary.passRate}% taxa de sucesso), 
                {summary.failed} falharam
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <TableIcon className="w-4 h-4" />
              Resultados Detalhados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-royal-blue" />
                    <span className="text-sm font-medium">Dashboards</span>
                  </div>
                  <div className="text-2xl font-bold text-navy-blue">
                    {categorizedResults['Admin Dashboard'].length + 
                     categorizedResults['HR Dashboard'].length + 
                     categorizedResults['Prestador Dashboard'].length + 
                     categorizedResults['User Dashboard'].length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-green" />
                    <span className="text-sm font-medium">Segurança</span>
                  </div>
                  <div className="text-2xl font-bold text-navy-blue">
                    {categorizedResults['Security & RLS'].length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-vibrant-blue" />
                    <span className="text-sm font-medium">Responsivo</span>
                  </div>
                  <div className="text-2xl font-bold text-navy-blue">
                    {categorizedResults['Responsive Design'].length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warm-orange" />
                    <span className="text-sm font-medium">Edge Cases</span>
                  </div>
                  <div className="text-2xl font-bold text-navy-blue">
                    {categorizedResults['Edge Cases'].length}
                  </div>
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
                      {categoryResults.slice(0, 5).map((result, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{result.action}</span>
                          {getStatusIcon(result.result)}
                        </div>
                      ))}
                      {categoryResults.length > 5 && (
                        <div className="text-xs text-slate-grey">
                          +{categoryResults.length - 5} mais testes...
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
                <CardTitle>Resultados Detalhados da Validação</CardTitle>
                <CardDescription>
                  Todos os testes executados com resultados e notas técnicas
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
                        <TableHead>Mensagem de Erro</TableHead>
                        <TableHead>Nota Técnica</TableHead>
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
                          <TableCell className="text-warm-orange text-sm">
                            {result.errorMessage || '-'}
                          </TableCell>
                          <TableCell className="text-slate-grey text-sm max-w-xs">
                            {result.technicalNote || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default FunctionalValidationPanel;
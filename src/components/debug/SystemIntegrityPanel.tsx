import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  Database,
  Users,
  Lock
} from 'lucide-react';
import { systemValidator } from '@/utils/systemIntegrityValidator';
import { useToast } from '@/hooks/use-toast';

const SystemIntegrityPanel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [activeTest, setActiveTest] = useState('');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const runIntegrityTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults(null);
    
    try {
      // Phase 1: Concurrency Tests
      setActiveTest('Concurrency Tests');
      setProgress(10);
      const concurrencyResults = await systemValidator.testConcurrencyIntegrity();
      
      // Phase 2: Edge Case Tests
      setActiveTest('Edge Case Tests');
      setProgress(40);
      const edgeCaseResults = await systemValidator.testSessionBookingEdgeCases();
      
      // Phase 3: Security/RLS Tests
      setActiveTest('Security & RLS Tests');
      setProgress(70);
      const securityResults = await systemValidator.testRLSEnforcement();
      
      // Generate Report
      setActiveTest('Generating Report');
      setProgress(90);
      const report = systemValidator.generateIntegrityReport(
        concurrencyResults,
        edgeCaseResults,
        securityResults
      );
      
      setTestResults({
        concurrency: concurrencyResults,
        edgeCases: edgeCaseResults,
        security: securityResults,
        report
      });
      
      setProgress(100);
      setActiveTest('Complete');
      
      // Show summary toast
      const allTests = [
        ...concurrencyResults.flatMap(c => c.results),
        ...edgeCaseResults,
        ...securityResults
      ];
      const passedTests = allTests.filter(t => t.passed).length;
      const totalTests = allTests.length;
      
      toast({
        title: "System Validation Complete",
        description: `${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(1)}%)`,
        variant: passedTests === totalTests ? "default" : "destructive"
      });
      
    } catch (error: any) {
      console.error('Error running integrity tests:', error);
      toast({
        title: "Test Error",
        description: error.message || "Failed to run integrity tests",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setActiveTest('');
      setProgress(0);
    }
  };

  const downloadReport = () => {
    if (!testResults?.report) return;
    
    const blob = new Blob([testResults.report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-integrity-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTestStatusIcon = (passed: boolean) => {
    return passed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getPerformanceColor = (rate: number) => {
    if (rate === 0) return 'text-green-600';
    if (rate < 0.1) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            System Integrity Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Deep System Validation</h3>
              <p className="text-sm text-muted-foreground">
                Test concurrency, edge cases, and security enforcement
              </p>
            </div>
            <Button 
              onClick={runIntegrityTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Run Validation
                </>
              )}
            </Button>
          </div>
          
          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Current: {activeTest}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {testResults && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="concurrency">Concurrency</TabsTrigger>
            <TabsTrigger value="edge-cases">Edge Cases</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="report">Full Report</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Concurrency Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Concurrency Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {testResults.concurrency.map((test: any) => {
                    const passed = test.results.filter((r: any) => r.passed).length;
                    const total = test.results.length;
                    const rate = passed / total;
                    
                    return (
                      <div key={test.testName} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate">{test.testName}</span>
                          <Badge variant={rate === 1 ? "default" : "destructive"}>
                            {passed}/{total}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg: {test.performance.averageTime.toFixed(1)}ms | 
                          Failures: <span className={getPerformanceColor(test.performance.failureRate)}>
                            {(test.performance.failureRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        {test.raceConditions.length > 0 && (
                          <Alert variant="destructive" className="p-2">
                            <AlertTriangle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              {test.raceConditions.length} race condition(s) detected
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Edge Cases Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Edge Cases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {testResults.edgeCases.map((test: any) => (
                    <div key={test.test} className="flex items-center justify-between text-sm">
                      <span className="truncate">{test.test}</span>
                      {getTestStatusIcon(test.passed)}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Security Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Security & RLS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {testResults.security.map((test: any) => (
                    <div key={test.test} className="flex items-center justify-between text-sm">
                      <span className="truncate">{test.test}</span>
                      {getTestStatusIcon(test.passed)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Concurrency Tab */}
          <TabsContent value="concurrency" className="space-y-4">
            {testResults.concurrency.map((test: any) => (
              <Card key={test.testName}>
                <CardHeader>
                  <CardTitle className="text-lg">{test.testName}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Avg: {test.performance.averageTime.toFixed(1)}ms</span>
                    <span>Max: {test.performance.maxTime}ms</span>
                    <span className={getPerformanceColor(test.performance.failureRate)}>
                      Failure Rate: {(test.performance.failureRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {test.raceConditions.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Race Conditions Detected:</strong>
                        <ul className="mt-1 ml-4 list-disc">
                          {test.raceConditions.map((condition: string, idx: number) => (
                            <li key={idx} className="text-sm">{condition}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {test.results.map((result: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                        <span className="truncate">{result.test}</span>
                        <div className="flex items-center gap-2">
                          {result.timing && (
                            <span className="text-xs text-muted-foreground">
                              {result.timing}ms
                            </span>
                          )}
                          {getTestStatusIcon(result.passed)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Edge Cases Tab */}
          <TabsContent value="edge-cases" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testResults.edgeCases.map((test: any) => (
                <Card key={test.test}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getTestStatusIcon(test.passed)}
                      {test.test}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {test.error && (
                      <Alert variant="destructive" className="mb-3">
                        <AlertDescription className="text-sm">{test.error}</AlertDescription>
                      </Alert>
                    )}
                    {test.details && (
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testResults.security.map((test: any) => (
                <Card key={test.test}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getTestStatusIcon(test.passed)}
                      {test.test}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {test.error && (
                      <Alert variant="destructive" className="mb-3">
                        <AlertDescription className="text-sm">{test.error}</AlertDescription>
                      </Alert>
                    )}
                    {test.details && (
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Full Report Tab */}
          <TabsContent value="report" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Complete Validation Report</CardTitle>
                  <Button onClick={downloadReport} variant="outline" size="sm">
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto h-96 whitespace-pre-wrap">
                  {testResults.report}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SystemIntegrityPanel;
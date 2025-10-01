import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';

interface BulkUserData {
  name: string;
  email: string;
  role: 'user' | 'hr' | 'prestador';
}

interface ProcessResult {
  user: BulkUserData;
  status: 'success' | 'error' | 'duplicate';
  message?: string;
  index: number;
}

interface BulkUserUploadProps {
  companies: Array<{ name: string; users: any[] }>;
  onCreateUser: (userData: any) => Promise<void>;
}

const BulkUserUpload: React.FC<BulkUserUploadProps> = ({ companies, onCreateUser }) => {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const csvContent = "name,email,role\nJoão Silva,joao@exemplo.com,user\nMaria Santos,maria@exemplo.com,hr\nPedro Costa,pedro@exemplo.com,prestador";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_usuarios.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setResults([]);
        setShowResults(false);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo CSV ou Excel.",
          variant: "destructive"
        });
      }
    }
  };

  const validateUserData = (user: any, index: number, existingEmails: Set<string>): { isValid: boolean; error?: string } => {
    if (!user.name || typeof user.name !== 'string' || user.name.trim().length < 2) {
      return { isValid: false, error: "Nome deve ter pelo menos 2 caracteres" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email || !emailRegex.test(user.email)) {
      return { isValid: false, error: "Email inválido" };
    }

    if (existingEmails.has(user.email.toLowerCase())) {
      return { isValid: false, error: "Email duplicado no arquivo" };
    }

    const validRoles = ['user', 'hr', 'prestador'];
    if (!user.role || !validRoles.includes(user.role.toLowerCase())) {
      return { isValid: false, error: "Role deve ser: user, hr ou prestador" };
    }

    return { isValid: true };
  };

  const processFile = async () => {
    if (!file || !selectedCompany) {
      toast({
        title: "Dados incompletos",
        description: "Selecione uma empresa e um arquivo.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const text = await file.text();
      const parseResult = Papa.parse(text, { header: true, skipEmptyLines: true });
      
      if (parseResult.errors.length > 0) {
        toast({
          title: "Erro no arquivo",
          description: "Formato do CSV inválido.",
          variant: "destructive"
        });
        setProcessing(false);
        return;
      }

      const users: BulkUserData[] = parseResult.data as BulkUserData[];
      const processResults: ProcessResult[] = [];
      const existingEmails = new Set<string>();

      // Get existing company users to check for duplicates
      const selectedCompanyData = companies.find(c => c.name === selectedCompany);
      const companyUserEmails = new Set(
        selectedCompanyData?.users.map(u => u.email.toLowerCase()) || []
      );

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        setProgress(((i + 1) / users.length) * 100);

        // Validate user data
        const validation = validateUserData(user, i, existingEmails);
        
        if (!validation.isValid) {
          processResults.push({
            user,
            status: 'error',
            message: validation.error,
            index: i + 1
          });
          continue;
        }

        // Check for duplicates in existing company users
        if (companyUserEmails.has(user.email.toLowerCase())) {
          processResults.push({
            user,
            status: 'duplicate',
            message: "Email já existe na empresa",
            index: i + 1
          });
          continue;
        }

        existingEmails.add(user.email.toLowerCase());

        try {
          await onCreateUser({
            name: user.name.trim(),
            email: user.email.toLowerCase(),
            role: user.role.toLowerCase(),
            company: selectedCompany,
            companySessions: 0,
            isActive: true
          });

          processResults.push({
            user,
            status: 'success',
            message: "Utilizador criado com sucesso",
            index: i + 1
          });

          // Add small delay to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          processResults.push({
            user,
            status: 'error',
            message: "Erro ao criar utilizador",
            index: i + 1
          });
        }
      }

      setResults(processResults);
      setShowResults(true);
      
      const successCount = processResults.filter(r => r.status === 'success').length;
      const errorCount = processResults.filter(r => r.status === 'error').length;
      const duplicateCount = processResults.filter(r => r.status === 'duplicate').length;

      toast({
        title: "Processamento concluído",
        description: `${successCount} criados, ${errorCount} erros, ${duplicateCount} duplicados`,
      });

    } catch (error) {
      toast({
        title: "Erro no processamento",
        description: "Erro ao processar o arquivo.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setResults([]);
    setShowResults(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: ProcessResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <X className="w-4 h-4 text-red-600" />;
      case 'duplicate':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeVariant = (status: ProcessResult['status']) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'duplicate':
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload em Massa de Utilizadores</CardTitle>
          <CardDescription>
            Faça upload de um arquivo CSV ou Excel para criar múltiplos utilizadores de uma só vez.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Template de exemplo</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Baixe o template para ver o formato correto do arquivo.
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Baixar Template
            </Button>
          </div>

          {/* Company Selection */}
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.name} value={company.name}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo CSV/Excel</Label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivo
              </Button>
              {file && (
                <span className="text-sm text-muted-foreground">
                  {file.name}
                </span>
              )}
            </div>
          </div>

          {/* Progress */}
          {processing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando utilizadores...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={processFile} 
              disabled={!file || !selectedCompany || processing}
            >
              {processing ? "Processando..." : "Processar Arquivo"}
            </Button>
            {(file || showResults) && (
              <Button variant="outline" onClick={resetUpload} disabled={processing}>
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados do Processamento</CardTitle>
            <CardDescription>
              Resumo do processamento de {results.length} utilizadores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium">{result.user.name}</p>
                      <p className="text-sm text-muted-foreground">{result.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(result.status)}>
                      {result.status === 'success' && 'Sucesso'}
                      {result.status === 'error' && 'Erro'}
                      {result.status === 'duplicate' && 'Duplicado'}
                    </Badge>
                    {result.message && (
                      <span className="text-xs text-muted-foreground">
                        {result.message}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkUserUpload;
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, Users, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BulkInviteData {
  name: string;
  email: string;
  role: 'user' | 'hr';
  sessions_allocated: number;
}

interface BulkInviteResult {
  success: boolean;
  email: string;
  invite_code?: string;
  error?: string;
}

export const BulkInviteModal: React.FC<{
  companyId: string;
  onSuccess?: () => void;
}> = ({ companyId, onSuccess }) => {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvData, setCsvData] = useState<BulkInviteData[]>([]);
  const [results, setResults] = useState<BulkInviteResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [defaultSessions, setDefaultSessions] = useState(6);
  const [defaultRole, setDefaultRole] = useState<'user' | 'hr'>('user');

  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const parseCSV = (csvText: string): BulkInviteData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const data: BulkInviteData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 2) {
        const row: BulkInviteData = {
          name: values[0] || '',
          email: values[1] || '',
          role: (values[2] as 'user' | 'hr') || defaultRole,
          sessions_allocated: parseInt(values[3]) || defaultSessions
        };
        
        if (row.name && row.email) {
          data.push(row);
        }
      }
    }
    
    return data;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const parsedData = parseCSV(csvText);
      setCsvData(parsedData);
      
      toast({
        title: "CSV carregado",
        description: `${parsedData.length} colaboradores encontrados`
      });
    };
    
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = 'Nome,Email,Função,Sessões\nJoão Silva,joao@empresa.com,user,6\nMaria Santos,maria@empresa.com,hr,8';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_convites.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const processBulkInvites = async () => {
    if (csvData.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    
    const newResults: BulkInviteResult[] = [];
    
    for (let i = 0; i < csvData.length; i++) {
      const invite = csvData[i];
      
      try {
        // Generate unique invite code
        const inviteCode = generateInviteCode();
        
        // Create invite record
        const { error } = await supabase
          .from('invites')
          .insert({
            invite_code: inviteCode,
            company_id: companyId,
            email: invite.email,
            role: invite.role,
            invited_by: profile?.id,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            metadata: {
              name: invite.name,
              sessions_allocated: invite.sessions_allocated
            }
          });
        
        if (error) throw error;
        
        // Log admin action
        await supabase
          .from('admin_logs')
          .insert({
            admin_id: profile?.id,
            action: 'bulk_invite_created',
            entity_type: 'invite',
            details: {
              email: invite.email,
              role: invite.role,
              sessions_allocated: invite.sessions_allocated,
              invite_code: inviteCode
            }
          });
        
        newResults.push({
          success: true,
          email: invite.email,
          invite_code: inviteCode
        });
        
      } catch (error) {
        console.error('Error creating invite:', error);
        newResults.push({
          success: false,
          email: invite.email,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
      
      // Update progress
      const currentProgress = ((i + 1) / csvData.length) * 100;
      setProgress(currentProgress);
      setResults([...newResults]);
    }
    
    setIsProcessing(false);
    
    const successCount = newResults.filter(r => r.success).length;
    const errorCount = newResults.filter(r => !r.success).length;
    
    toast({
      title: "Convites processados",
      description: `${successCount} sucessos, ${errorCount} erros`
    });
    
    if (onSuccess) onSuccess();
  };

  const exportResults = () => {
    const csvContent = [
      'Email,Status,Código Convite,Erro',
      ...results.map(r => 
        `${r.email},${r.success ? 'Sucesso' : 'Erro'},${r.invite_code || ''},${r.error || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultados_convites_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setCsvData([]);
    setResults([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          Convites em Massa
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convites em Massa</DialogTitle>
          <DialogDescription>
            Carregue um ficheiro CSV com os dados dos colaboradores para criar convites automaticamente
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Descarregar Template</CardTitle>
              <CardDescription>
                Descarregue o template CSV para preencher com os dados dos colaboradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Descarregar Template CSV
              </Button>
            </CardContent>
          </Card>
          
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Carregar Ficheiro</CardTitle>
              <CardDescription>
                Selecione o ficheiro CSV preenchido com os dados dos colaboradores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Ficheiro CSV</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </div>
              
              {/* Default Values */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-role">Função Padrão</Label>
                  <Select value={defaultRole} onValueChange={(value: 'user' | 'hr') => setDefaultRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Utilizador</SelectItem>
                      <SelectItem value="hr">Recursos Humanos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-sessions">Sessões Padrão</Label>
                  <Input
                    id="default-sessions"
                    type="number"
                    min="1"
                    max="50"
                    value={defaultSessions}
                    onChange={(e) => setDefaultSessions(parseInt(e.target.value) || 6)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Preview Data */}
          {csvData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. Pré-visualização</CardTitle>
                <CardDescription>
                  {csvData.length} colaboradores encontrados no ficheiro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {csvData.map((invite, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{invite.name}</span>
                        <span className="text-muted-foreground ml-2">({invite.email})</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{invite.role}</Badge>
                        <Badge variant="secondary">{invite.sessions_allocated} sessões</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Process Invites */}
          {csvData.length > 0 && !isProcessing && results.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">4. Processar Convites</CardTitle>
                <CardDescription>
                  Clique para criar os convites para todos os colaboradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={processBulkInvites} className="w-full gap-2">
                  <Users className="h-4 w-4" />
                  Criar {csvData.length} Convites
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Processing */}
          {isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processando Convites...</CardTitle>
                <CardDescription>
                  A criar convites para os colaboradores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  {Math.round(progress)}% concluído
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Results */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados</CardTitle>
                <CardDescription>
                  {results.filter(r => r.success).length} sucessos, {results.filter(r => !r.success).length} erros
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">{result.email}</span>
                        {result.invite_code && (
                          <Badge variant="outline">{result.invite_code}</Badge>
                        )}
                      </div>
                      {result.error && (
                        <span className="text-sm text-red-500">{result.error}</span>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={exportResults} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Resultados
                  </Button>
                  <Button onClick={resetForm} variant="outline">
                    Novo Lote
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

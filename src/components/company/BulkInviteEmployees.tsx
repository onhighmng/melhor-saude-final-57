import React, { useState, useEffect, useRef } from 'react';
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
import { Upload, Download, Users, CheckCircle, XCircle, AlertCircle, FileText, Mail, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BulkEmployeeData {
  name: string;
  email: string;
  department: string;
  position: string;
  sessions_allocated: number;
}

interface BulkInviteResult {
  success: boolean;
  email: string;
  invite_code?: string;
  error?: string;
}

interface InviteStatus {
  id: string;
  email: string;
  invite_code: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  metadata?: any;
}

export const BulkInviteEmployees: React.FC = () => {
  const { t } = useTranslation('company');
  const { toast } = useToast();
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvData, setCsvData] = useState<BulkEmployeeData[]>([]);
  const [results, setResults] = useState<BulkInviteResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [defaultSessions, setDefaultSessions] = useState(6);
  const [inviteStatuses, setInviteStatuses] = useState<InviteStatus[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInviteStatuses();
    }
  }, [isOpen]);

  const loadInviteStatuses = async () => {
    if (!profile?.company_id) return;
    
    setIsLoadingStatuses(true);
    try {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInviteStatuses((data || []).map(invite => ({
        ...invite,
        status: invite.status as 'pending' | 'accepted' | 'expired' | 'cancelled',
        metadata: {}
      })) as InviteStatus[]);
    } catch (error) {
      console.error('Error loading invite statuses:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar status dos convites",
        variant: "destructive"
      });
    } finally {
      setIsLoadingStatuses(false);
    }
  };

  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const parseCSV = (csvText: string): BulkEmployeeData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const data: BulkEmployeeData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 2) {
        const row: BulkEmployeeData = {
          name: values[0] || '',
          email: values[1] || '',
          department: values[2] || '',
          position: values[3] || '',
          sessions_allocated: parseInt(values[4]) || defaultSessions
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
    const template = 'Nome,Email,Departamento,Cargo,Sessões\nJoão Silva,joao@empresa.com,IT,Desenvolvedor,6\nMaria Santos,maria@empresa.com,HR,Recrutadora,8';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_colaboradores.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const processBulkInvites = async () => {
    if (csvData.length === 0 || !profile?.company_id) return;
    
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    
    const newResults: BulkInviteResult[] = [];
    
    for (let i = 0; i < csvData.length; i++) {
      const employee = csvData[i];
      
      try {
        // Generate unique invite code
        const inviteCode = generateInviteCode();
        
        // Create invite record
        const { error } = await supabase
          .from('invites')
          .insert({
            invite_code: inviteCode,
            company_id: profile.company_id,
            email: employee.email,
            role: 'user',
            invited_by: profile.id,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            metadata: {
              name: employee.name,
              department: employee.department,
              position: employee.position,
              sessions_allocated: employee.sessions_allocated
            }
          });
        
        if (error) throw error;
        
        newResults.push({
          success: true,
          email: employee.email,
          invite_code: inviteCode
        });
        
      } catch (error) {
        console.error('Error creating invite:', error);
        newResults.push({
          success: false,
          email: employee.email,
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
    
    // Reload invite statuses
    loadInviteStatuses();
  };

  const resendInvite = async (inviteId: string) => {
    try {
      // Update expiry date
      const { error } = await supabase
        .from('invites')
        .update({
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        })
        .eq('id', inviteId);

      if (error) throw error;

      toast({
        title: "Convite reenviado",
        description: "O convite foi renovado e pode ser usado novamente"
      });

      loadInviteStatuses();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao reenviar convite",
        variant: "destructive"
      });
    }
  };

  const cancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('invites')
        .update({ status: 'cancelled' })
        .eq('id', inviteId);

      if (error) throw error;

      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso"
      });

      loadInviteStatuses();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao cancelar convite",
        variant: "destructive"
      });
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Aceite</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'expired':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Expirado</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convites em Massa para Colaboradores</DialogTitle>
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
              
              {/* Default Sessions */}
              <div className="space-y-2">
                <Label htmlFor="default-sessions">Sessões Padrão por Colaborador</Label>
                <Input
                  id="default-sessions"
                  type="number"
                  min="1"
                  max="50"
                  value={defaultSessions}
                  onChange={(e) => setDefaultSessions(parseInt(e.target.value) || 6)}
                />
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
                  {csvData.map((employee, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{employee.name}</span>
                        <span className="text-muted-foreground ml-2">({employee.email})</span>
                        {employee.department && (
                          <span className="text-muted-foreground ml-2">- {employee.department}</span>
                        )}
                      </div>
                      <Badge variant="secondary">{employee.sessions_allocated} sessões</Badge>
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

          {/* Invite Status Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status dos Convites</CardTitle>
              <CardDescription>
                Acompanhe o status de todos os convites enviados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStatuses ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">A carregar status dos convites...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-500">
                        {inviteStatuses.filter(i => i.status === 'pending').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-500">
                        {inviteStatuses.filter(i => i.status === 'accepted').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Aceites</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-500">
                        {inviteStatuses.filter(i => i.status === 'expired').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Expirados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-500">
                        {inviteStatuses.filter(i => i.status === 'cancelled').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Cancelados</p>
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {inviteStatuses.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{invite.metadata?.name || invite.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {invite.email} • {invite.metadata?.department && `${invite.metadata.department} • `}
                              {invite.metadata?.sessions_allocated} sessões
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Criado em {new Date(invite.created_at).toLocaleDateString('pt-PT')}
                              {invite.expires_at && (
                                <span> • Expira em {new Date(invite.expires_at).toLocaleDateString('pt-PT')}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusBadge(invite.status)}
                          <Badge variant="outline">{invite.invite_code}</Badge>
                          
                          {invite.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resendInvite(invite.id)}
                              >
                                <Mail className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelInvite(invite.id)}
                              >
                                ×
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {inviteStatuses.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum convite encontrado</p>
                        <p className="text-sm">Crie o primeiro convite para começar</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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

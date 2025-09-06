import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mail, Send, AlertTriangle, Settings, CheckCircle, XCircle } from 'lucide-react';
import { EmailAlert, AdminUser } from '@/types/admin';

interface EmailNotificationsPanelProps {
  alerts: EmailAlert[];
  users: AdminUser[];
  onSendAlert: (alertId: string) => Promise<void>;
  onCreateAlert: (alert: Omit<EmailAlert, 'id' | 'createdAt' | 'status'>) => Promise<void>;
}

const EmailNotificationsPanel = ({ alerts = [], users = [], onSendAlert, onCreateAlert }: EmailNotificationsPanelProps) => {
  const [alertSettings, setAlertSettings] = useState({
    lowSessionThreshold: 2,
    inactivityDays: 30,
    autoSendLowSessions: true,
    autoSendInactive: false
  });

  const [newAlert, setNewAlert] = useState({
    type: 'low_sessions' as const,
    recipientId: '',
    subject: '',
    message: ''
  });

  const pendingAlerts = alerts.filter(alert => alert.status === 'pending');
  const sentAlerts = alerts.filter(alert => alert.status === 'sent');
  const failedAlerts = alerts.filter(alert => alert.status === 'failed');

  // Auto-generate alerts based on settings
  const generateLowSessionAlerts = () => {
    const lowSessionUsers = users.filter(user => 
      user.companySessions - user.usedCompanySessions <= alertSettings.lowSessionThreshold
    );
    
    return lowSessionUsers.map(user => ({
      type: 'low_sessions' as const,
      recipientId: 'admin',
      recipientEmail: '',
      subject: `Sessões em Fim - ${user.name}`,
      message: `O utilizador ${user.name} (${user.email}) tem apenas ${user.companySessions - user.usedCompanySessions} sessões restantes.`
    }));
  };

  const generateInactiveAccountAlerts = () => {
    const inactiveUsers = users.filter(user => !user.isActive);
    
    return inactiveUsers.map(user => ({
      type: 'inactive_account' as const,
      recipientId: 'admin',
      recipientEmail: '', 
      subject: `Conta Inativa - ${user.name}`,
      message: `A conta de ${user.name} (${user.email}) está inativa há mais de ${alertSettings.inactivityDays} dias.`
    }));
  };

  const handleCreateAlert = async () => {
    if (!newAlert.recipientId || !newAlert.subject || !newAlert.message) return;
    
    const user = users.find(u => u.id === newAlert.recipientId);
    if (!user) return;

    await onCreateAlert({
      ...newAlert,
      recipientEmail: user.email
    });

    setNewAlert({
      type: 'low_sessions',
      recipientId: '',
      subject: '',
      message: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_sessions': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'inactive_account': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'low_sessions': return 'Sessões Baixas';
      case 'inactive_account': return 'Conta Inativa';
      case 'booking_reminder': return 'Lembrete Agendamento';  
      case 'feedback_received': return 'Feedback Recebido';
      default: return 'Outro';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Sistema de Notificações por Email
            {pendingAlerts.length > 0 && (
              <Badge variant="destructive">{pendingAlerts.length} pendentes</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="alerts">Alertas ({pendingAlerts.length})</TabsTrigger>
              <TabsTrigger value="create">Criar Alerta</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="space-y-4">
              {pendingAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>Nenhum alerta pendente</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Destinatário</TableHead>
                        <TableHead>Assunto</TableHead>
                        <TableHead>Criado</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getAlertIcon(alert.type)}
                              {getAlertTypeLabel(alert.type)}
                            </div>
                          </TableCell>
                          <TableCell>{alert.recipientEmail}</TableCell>
                          <TableCell className="max-w-xs truncate">{alert.subject}</TableCell>
                          <TableCell>{formatDate(alert.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => onSendAlert(alert.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Enviar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Recent Sent/Failed Alerts */}
              {(sentAlerts.length > 0 || failedAlerts.length > 0) && (
                <div className="mt-8">
                  <h4 className="font-medium mb-4">Histórico Recente</h4>
                  <div className="space-y-2">
                    {[...sentAlerts.slice(-3), ...failedAlerts.slice(-3)].map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {alert.status === 'sent' ? 
                            <CheckCircle className="w-4 h-4 text-green-500" /> :
                            <XCircle className="w-4 h-4 text-red-500" />
                          }
                          <span className="text-sm">{alert.subject}</span>
                        </div>
                        <Badge variant={alert.status === 'sent' ? 'default' : 'destructive'}>
                          {alert.status === 'sent' ? 'Enviado' : 'Falhou'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alert-type">Tipo de Alerta</Label>
                  <select
                    id="alert-type"
                    className="w-full p-2 border rounded-md"
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as any })}
                  >
                    <option value="low_sessions">Sessões Baixas</option>
                    <option value="inactive_account">Conta Inativa</option>
                    <option value="booking_reminder">Lembrete Agendamento</option>
                    <option value="feedback_received">Feedback Recebido</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="recipient">Destinatário</Label>
                  <select
                    id="recipient"
                    className="w-full p-2 border rounded-md"
                    value={newAlert.recipientId}
                    onChange={(e) => setNewAlert({ ...newAlert, recipientId: e.target.value })}
                  >
                    <option value="">Selecionar utilizador</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  value={newAlert.subject}
                  onChange={(e) => setNewAlert({ ...newAlert, subject: e.target.value })}
                  placeholder="Assunto"
                />
              </div>

              <div>
                <Label htmlFor="message">Mensagem</Label>
                <textarea
                  id="message"
                  className="w-full p-3 border rounded-md"
                  rows={4}
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  placeholder="Mensagem"
                />
              </div>

              <Button onClick={handleCreateAlert} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Criar e Enviar Alerta
              </Button>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="low-threshold">Limite Sessões Baixas</Label>
                  <Input
                    id="low-threshold"
                    type="number"
                    min="1"
                    max="10"
                    value={alertSettings.lowSessionThreshold}
                    onChange={(e) => setAlertSettings({ 
                      ...alertSettings, 
                      lowSessionThreshold: parseInt(e.target.value) || 2 
                    })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alertar quando restam X sessões ou menos
                  </p>
                </div>

                <div>
                  <Label htmlFor="inactive-days">Dias de Inatividade</Label>
                  <Input
                    id="inactive-days"
                    type="number"
                    min="1"
                    max="365"
                    value={alertSettings.inactivityDays}
                    onChange={(e) => setAlertSettings({ 
                      ...alertSettings, 
                      inactivityDays: parseInt(e.target.value) || 30 
                    })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alertar sobre contas inativas há X dias
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas Automáticos - Sessões Baixas</Label>
                    <p className="text-sm text-gray-500">Enviar automaticamente alertas de sessões baixas</p>
                  </div>
                  <Switch
                    checked={alertSettings.autoSendLowSessions}
                    onCheckedChange={(checked) => setAlertSettings({ 
                      ...alertSettings, 
                      autoSendLowSessions: checked 
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas Automáticos - Contas Inativas</Label>
                    <p className="text-sm text-gray-500">Enviar automaticamente alertas de contas inativas</p>
                  </div>
                  <Switch
                    checked={alertSettings.autoSendInactive}
                    onCheckedChange={(checked) => setAlertSettings({ 
                      ...alertSettings, 
                      autoSendInactive: checked 
                    })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => {
                    const alerts = generateLowSessionAlerts();
                    alerts.forEach(onCreateAlert);
                  }}
                  variant="outline"
                >
                  Gerar Alertas Sessões Baixas
                </Button>
                
                <Button 
                  onClick={() => {
                    const alerts = generateInactiveAccountAlerts();
                    alerts.forEach(onCreateAlert);
                  }}
                  variant="outline"
                >
                  Gerar Alertas Contas Inativas
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailNotificationsPanel;
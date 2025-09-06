import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, Calendar, User, Clock, AlertCircle } from 'lucide-react';

interface ManualSessionFlowProps {
  prestadorId: string;
}

interface ManualSession {
  id: string;
  user_id: string;
  prestador_id: string;
  client_name: string;
  client_email: string;
  session_date: string;
  duration: number;
  session_type: string;
  status: string;
  notes?: string;
  prestador_notes?: string;
  session_usage_id?: string;
  created_at: string;
}

const ManualSessionFlow = ({ prestadorId }: ManualSessionFlowProps) => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ManualSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingSession, setProcessingSession] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState<ManualSession | null>(null);

  // Create session form state
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    session_date: '',
    duration: 60,
    session_type: 'individual',
    notes: ''
  });

  useEffect(() => {
    fetchManualSessions();
  }, [prestadorId]);

  const fetchManualSessions = async () => {
    try {
      // Fetch bookings and join with user profiles
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          prestador_id,
          booking_date,
          duration,
          session_type,
          status,
          notes,
          prestador_notes,
          session_usage_id,
          created_at
        `)
        .eq('prestador_id', prestadorId)
        .in('status', ['scheduled', 'completed'])
        .order('booking_date', { ascending: false });

      if (error) throw error;

      // Get user profiles separately
      const userIds = data?.map(booking => booking.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const mappedSessions = data?.map(booking => {
        const profile = profiles?.find(p => p.user_id === booking.user_id);
        return {
          id: booking.id,
          user_id: booking.user_id,
          prestador_id: booking.prestador_id,
          client_name: profile?.name || 'Nome não disponível',
          client_email: profile?.email || 'Email não disponível',
          session_date: booking.booking_date,
          duration: booking.duration,
          session_type: booking.session_type,
          status: booking.status,
          notes: booking.notes,
          prestador_notes: booking.prestador_notes,
          session_usage_id: booking.session_usage_id,
          created_at: booking.created_at
        };
      }) || [];

      setSessions(mappedSessions);
    } catch (error: any) {
      console.error('Error fetching manual sessions:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar sessões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createManualSession = async () => {
    try {
      setLoading(true);

      // Find user by email
      console.log('Searching for email:', formData.client_email.trim());
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .eq('email', formData.client_email.trim())
        .maybeSingle();

      console.log('Search result:', { userProfile, userError });

      if (userError) {
        console.error('Error searching for user:', userError);
        throw new Error('Erro ao buscar cliente. Tente novamente.');
      }

      if (!userProfile) {
        throw new Error('Cliente não encontrado. Verifique o email.');
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: userProfile.user_id,
          prestador_id: prestadorId,
          booking_date: formData.session_date,
          duration: formData.duration,
          session_type: formData.session_type,
          status: 'scheduled',
          notes: formData.notes,
          prestador_notes: `Sessão criada manualmente pelo prestador`
        })
        .select()
        .maybeSingle();

      if (bookingError) throw bookingError;

      toast({
        title: "Sessão Criada!",
        description: `Sessão agendada para ${formData.client_name}`,
        variant: "default"
      });

      // Reset form and close dialog
      setFormData({
        client_name: '',
        client_email: '',
        session_date: '',
        duration: 60,
        session_type: 'individual',
        notes: ''
      });
      setShowCreateDialog(false);
      
      // Refresh sessions list
      await fetchManualSessions();

    } catch (error: any) {
      console.error('Error creating manual session:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar sessão",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async (session: ManualSession) => {
    try {
      setProcessingSession(session.id);

      // Use the existing session-management edge function
      const { data, error } = await supabase.functions.invoke('session-management', {
        body: {
          bookingId: session.id,
          action: 'complete_session'
        }
      });

      if (error) throw error;

      toast({
        title: "Sessão Concluída!",
        description: "A sessão foi marcada como concluída e deduzida da conta do cliente.",
        variant: "default"
      });

      setShowCompleteDialog(null);
      await fetchManualSessions();

    } catch (error: any) {
      console.error('Error completing session:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao concluir sessão",
        variant: "destructive",
      });
    } finally {
      setProcessingSession(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Agendada</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Concluída</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scheduledSessions = sessions.filter(s => s.status === 'scheduled');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Gestão Manual de Sessões
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Crie e gerencie sessões manualmente sem dependência do Calendly
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Sessão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Sessão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client_name">Nome do Cliente</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="client_email">Email do Cliente</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="session_date">Data e Hora</Label>
                  <Input
                    id="session_date"
                    type="datetime-local"
                    value={formData.session_date}
                    onChange={(e) => setFormData({...formData, session_date: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duração (min)</Label>
                    <Select value={formData.duration.toString()} onValueChange={(value) => setFormData({...formData, duration: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                        <SelectItem value="90">90 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="session_type">Tipo</Label>
                    <Select value={formData.session_type} onValueChange={(value) => setFormData({...formData, session_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="group">Grupo</SelectItem>
                        <SelectItem value="emergency">Emergência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Informações adicionais sobre a sessão..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={createManualSession} 
                  disabled={!formData.client_name || !formData.client_email || !formData.session_date || loading}
                  className="w-full"
                >
                  {loading ? 'Criando...' : 'Marcar como Agendada'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Scheduled Sessions */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Sessões Agendadas ({scheduledSessions.length})
          </h4>
          
          {scheduledSessions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma sessão agendada</p>
              <p className="text-sm">Clique em "Nova Sessão" para criar uma</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledSessions.map((session) => (
                <div key={session.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{session.client_name}</p>
                        <p className="text-sm text-muted-foreground">{session.client_email}</p>
                      </div>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(session.session_date)}</span>
                      <span>•</span>
                      <Clock className="w-4 h-4" />
                      <span>{session.duration} min</span>
                    </div>
                    
                    <Dialog open={showCompleteDialog?.id === session.id} onOpenChange={(open) => setShowCompleteDialog(open ? session : null)}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          disabled={processingSession === session.id}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Concluir Sessão
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Concluir Sessão</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium">{session.client_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(session.session_date)}
                            </p>
                          </div>

                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                              <div className="text-sm text-yellow-800">
                                <p className="font-medium">Atenção:</p>
                                <p>Esta ação irá deduzir automaticamente uma sessão da conta do cliente. Sessões da empresa têm prioridade sobre sessões pessoais.</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => setShowCompleteDialog(null)}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                            <Button 
                              onClick={() => completeSession(session)}
                              disabled={processingSession === session.id}
                              className="flex-1"
                            >
                              {processingSession === session.id ? 'Processando...' : 'Confirmar Conclusão'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {session.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        <strong>Notas:</strong> {session.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Sessions Summary */}
        {completedSessions.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Sessões Concluídas Recentes ({Math.min(completedSessions.length, 3)} de {completedSessions.length})
            </h4>
            
            <div className="space-y-2">
              {completedSessions.slice(0, 3).map((session) => (
                <div key={session.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{session.client_name}</span>
                      {session.session_usage_id && (
                        <Badge variant="outline" className="text-xs">
                          Sessão Deduzida ✓
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.session_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Box */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Como funciona:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Crie uma nova sessão inserindo os dados do cliente</li>
            <li>2. A sessão fica com status "Agendada"</li>
            <li>3. Após realizar a sessão, marque como "Concluída"</li>
            <li>4. Sistema deduz automaticamente: sessões da empresa primeiro, depois pessoais</li>
            <li>5. Cliente recebe notificação de conclusão</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualSessionFlow;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, SessionStatus } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Monitor, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Upload,
  Trash2,
  Save,
  Building2,
  User,
  Timer,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { emailService } from '@/services/emailService';

interface SessionDetailData {
  id: string;
  userName: string;
  userAvatar?: string;
  pillar: 'psicologica' | 'juridica' | 'financeira' | 'fisica';
  date: string;
  time: string;
  duration: number;
  location: 'online' | 'presencial';
  status: SessionStatus;
  deductionType: 'empresa' | 'pessoal';
  companyName?: string;
  notes?: string;
  chat_session_id?: string;
  topic?: string;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
  }>;
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

const pillarLabels = {
  psicologica: 'Saúde Mental',
  fisica: 'Bem-Estar Físico',
  financeira: 'Assistência Financeira',
  juridica: 'Assistência Jurídica'
};

export default function PrestadorSessionDetail() {
  const { id } = useParams();
  const { t } = useTranslation(['provider', 'user']);
  const { toast } = useToast();
  const [session, setSession] = useState<SessionDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      if (!id) return;

      try {
        const { data: booking, error } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles (name, avatar_url),
            companies (name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        if (booking) {
          const pillarMap: Record<string, 'psicologica' | 'juridica' | 'financeira' | 'fisica'> = {
            'saude_mental': 'psicologica',
            'assistencia_juridica': 'juridica',
            'assistencia_financeira': 'financeira',
            'bem_estar_fisico': 'fisica'
          };

          setSession({
            id: booking.id,
            userName: (booking.profiles as any)?.name as string || 'Utilizador',
            userAvatar: (booking.profiles as any)?.avatar_url as string,
            pillar: pillarMap[booking.pillar] || 'psicologica',
            date: booking.date,
            time: booking.start_time || '00:00',
            duration: 50,
            location: booking.meeting_type === 'online' ? 'online' : 'presencial',
            status: booking.status as SessionStatus,
            deductionType: booking.company_id ? 'empresa' : 'pessoal',
            companyName: (booking.companies as Record<string, unknown>)?.name as string,
            notes: booking.notes,
            chat_session_id: booking.chat_session_id,
            topic: booking.topic,
            attachments: []
          });
        }
      } catch (error) {
        // Silent fail for session loading
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [id]);
  const [privateNotes, setPrivateNotes] = useState('');
  const [timeUntilSession, setTimeUntilSession] = useState<string>('');
  const [noShowReason, setNoShowReason] = useState('');
  const [noShowDescription, setNoShowDescription] = useState('');
  const [showNoShowDialog, setShowNoShowDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [attachments, setAttachments] = useState<Array<Record<string, unknown>>>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (session) {
      setPrivateNotes(session.notes || '');
      setAttachments(session.attachments || []);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const updateCountdown = () => {
      const sessionDateTime = new Date(`${session.date}T${session.time}`);
      const now = new Date();
      const diff = sessionDateTime.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          setTimeUntilSession(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeUntilSession(`${minutes}m ${seconds}s`);
        } else {
          setTimeUntilSession(`${seconds}s`);
        }
      } else {
        setTimeUntilSession('');
      }
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(interval);
  }, [session?.date, session?.time]);

  useEffect(() => {
    if (session?.chat_session_id) {
      const fetchChatMessages = async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', session.chat_session_id)
          .order('created_at');
        
        if (!error && data) {
          setChatMessages(data);
        }
      };
      fetchChatMessages();
    }
  }, [session?.chat_session_id]);

  const formatSessionDateTime = () => {
    if (!session) return { date: '', time: '', dayOfWeek: '' };
    const dateTime = new Date(`${session.date}T${session.time}`);
    return {
      date: format(dateTime, "dd 'de' MMMM 'de' yyyy", { locale: pt }),
      time: format(dateTime, 'HH:mm'),
      dayOfWeek: format(dateTime, 'EEEE', { locale: pt })
    };
  };

  const savePrivateNotes = async () => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ notes: privateNotes })
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Notas guardadas", description: "Notas privadas atualizadas" });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao guardar notas", variant: "destructive" });
    }
  };

  const startSession = async () => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'in-progress' })
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Sessão iniciada", description: "Estado atualizado" });
      if (session) setSession({ ...session, status: 'in-progress' as SessionStatus });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao iniciar sessão", variant: "destructive" });
    }
  };

  const completeSession = async () => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Sessão concluída", description: "Estado atualizado com sucesso" });
      if (session) setSession({ ...session, status: 'completed' as SessionStatus });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao concluir sessão", variant: "destructive" });
    }
  };

  const markNoShow = async () => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'no_show',
          notes: `No-show: ${noShowReason} - ${noShowDescription}`
        })
        .eq('id', id);

      if (error) throw error;
      setShowNoShowDialog(false);
      toast({ title: "Marcado como faltoso", description: "Registo atualizado" });
      if (session) setSession({ ...session, status: 'no_show' as SessionStatus });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao marcar falta", variant: "destructive" });
    }
  };

  const cancelSession = async () => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Send cancellation email to user
      try {
        const { data: booking } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles (name, email),
            prestadores (name)
          `)
          .eq('id', id)
          .single();

        // Send cancellation email (method not implemented)
        // const userProfile = Array.isArray(booking?.profiles) ? booking.profiles[0] : booking?.profiles;
        // const providerProfile = Array.isArray(booking?.prestadores) ? booking.prestadores[0] : booking?.prestadores;
        // 
        // if (userProfile?.email && providerProfile?.name) {
        //   await emailService.sendBookingCancellation(userProfile.email, {
        //     userName: userProfile.name,
        //     providerName: providerProfile.name,
        //     date: booking.date,
        //     time: booking.start_time,
        //     pillar: booking.pillar
        //   });
        // }
      } catch (emailError) {
        // Don't block cancellation on email failure
      }

      setShowCancelDialog(false);
      toast({ title: "Sessão cancelada", description: "Cancelamento registado" });
      if (session) setSession({ ...session, status: 'cancelled' as SessionStatus });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao cancelar sessão", variant: "destructive" });
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(att => att.id !== attachmentId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p>A carregar sessão...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p>Sessão não encontrada</p>
      </div>
    );
  }

  const { date, time, dayOfWeek } = formatSessionDateTime();
  const canCancel = session.status === 'scheduled' || session.status === 'confirmed';
  const canStart = session.status === 'confirmed' && timeUntilSession === '';
  const canComplete = session.status === 'in-progress';

  return (
    <div className="min-h-screen bg-blue-50">
      <PageHeader
        title="Detalhes da Sessão"
        subtitle={`${session.userName} • ${pillarLabels[session.pillar]}`}
        showBackButton
        backUrl="/prestador/sessoes"
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={session.status} />
            {timeUntilSession && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Timer className="h-3 w-3 mr-1" />
                {timeUntilSession}
              </Badge>
            )}
          </div>
        }

      />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* User & Session Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={session.userAvatar} alt={session.userName} />
                      <AvatarFallback className="text-lg font-semibold">
                        {session.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{session.userName}</h2>
                      <p className="text-lg text-gray-600">{pillarLabels[session.pillar]}</p>
                    </div>
                  </div>
                  
                  {timeUntilSession && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">{timeUntilSession}</div>
                      <div className="text-sm text-gray-500">até iniciar</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Data e Hora</p>
                        <p className="text-gray-900">{date} às {time}</p>
                        <p className="text-sm text-gray-500 capitalize">{dayOfWeek}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        {session.location === 'online' ? (
                          <Monitor className="h-5 w-5 text-green-600" />
                        ) : (
                          <MapPin className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Local</p>
                        <p className="text-gray-900 capitalize">{session.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Duração</p>
                        <p className="text-gray-900">{session.duration} minutos</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                        {session.deductionType === 'empresa' ? (
                          <Building2 className="h-5 w-5 text-orange-600" />
                        ) : (
                          <User className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Dedução</p>
                        <p className="text-gray-900 capitalize">{session.deductionType}</p>
                        {session.companyName && (
                          <p className="text-sm text-gray-500">{session.companyName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pre-Diagnostic Information */}
            {session.chat_session_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {t('provider:preDiagnostic.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {session.topic && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {t('provider:preDiagnostic.topic')}
                      </p>
                      <p className="text-foreground">
                        {t(`user:topics.${session.pillar}.${session.topic}`)}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-3">
                      {t('provider:preDiagnostic.transcript')}
                    </h4>
                    <ScrollArea className="h-64 border rounded-lg p-3 bg-muted/30">
                      {chatMessages.length > 0 ? (
                        <div className="space-y-3">
                          {chatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-lg p-3 ${
                                  msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-xs opacity-70 mb-1">
                                  {msg.role === 'user' ? t('provider:preDiagnostic.user') : t('provider:preDiagnostic.assistant')}
                                </p>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          {t('provider:preDiagnostic.noData')}
                        </p>
                      )}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Private Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas Privadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Escreva as suas notas privadas aqui..."
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  className="min-h-[120px]"

                />
                <Button onClick={savePrivateNotes} className="gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Notas
                </Button>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Anexos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Anexar ficheiro</p>
                  <p className="text-sm text-gray-500">PDF, DOC, JPG até 10MB</p>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div key={String(attachment.id)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{String(attachment.name)}</p>
                            <p className="text-xs text-gray-500">
                              {(Number(attachment.size) / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                            variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(String(attachment.id))}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações da Sessão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {session.location === 'online' && canStart && (
                  <Button onClick={startSession} className="w-full gap-2" size="lg">
                    <Play className="h-5 w-5" />
                    Iniciar Sessão
                  </Button>
                )}

                {canComplete && (
                  <Button onClick={completeSession} className="w-full gap-2" size="lg">
                    <CheckCircle className="h-5 w-5" />
                    Concluir
                  </Button>
                )}

                <Button
                  onClick={() => setShowNoShowDialog(true)}
                    variant="outline"
                  className="w-full gap-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                >
                  <AlertTriangle className="h-5 w-5" />
                  Falta
                </Button>

                {canCancel && (
                  <Button
                    onClick={() => setShowCancelDialog(true)}
                      variant="outline"
                    className="w-full gap-2 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-5 w-5" />
                    Cancelar
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card>
              <CardHeader>
                <CardTitle>Estado da Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado Atual</span>
                    <StatusBadge status={session.status} />
                  </div>
                  
                  {session.status === 'completed' && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Quota já deduzida
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* No Show Dialog */}
      {showNoShowDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Registar Falta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Motivo da Falta
                </label>
                <Select value={noShowReason} onValueChange={setNoShowReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_response">Sem resposta</SelectItem>
                    <SelectItem value="technical_issues">Problemas técnicos</SelectItem>
                    <SelectItem value="personal_emergency">Emergência pessoal</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Observações (opcional)
                </label>
                <Textarea
                  value={noShowDescription}
                  onChange={(e) => setNoShowDescription(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  className="min-h-[80px]"

                />
              </div>

              <div className="flex gap-2">
                <Button
                    variant="outline"
                  onClick={() => setShowNoShowDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={markNoShow} className="flex-1">
                  Confirmar Falta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Cancelar Sessão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Tem a certeza de que pretende cancelar esta sessão? Esta ação não pode ser desfeita.
              </p>

              <div className="flex gap-2">
                <Button
                    variant="outline"
                  onClick={() => setShowCancelDialog(false)}
                  className="flex-1"
                >
                  Manter Sessão
                </Button>
                <Button
                  onClick={cancelSession}
                    variant="destructive"
                  className="flex-1"
                >
                  Cancelar Sessão
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
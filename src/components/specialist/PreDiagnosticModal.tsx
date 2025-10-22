import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, User, Bot, Calendar, Clock, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface PreDiagnosticModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: {
    chat_session_id?: string;
    user_name: string;
    company_name: string;
    pillar: string;
    date: string;
    time: string;
    topic?: string;
  };
}

// Mock chat messages for demonstration
const mockChatMessages: Record<string, ChatMessage[]> = {
  'chat-1': [
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Bem-vindo ao serviço de apoio psicológico. Pode partilhar o que o trouxe aqui hoje?',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      role: 'user',
      content: 'Olá, tenho sentido muito stress no trabalho ultimamente. Sinto-me constantemente sob pressão e isto está a afetar o meu sono.',
      created_at: new Date(Date.now() - 3540000).toISOString()
    },
    {
      id: '3',
      role: 'assistant',
      content: 'Compreendo. O stress laboral pode afetar diversos aspetos da nossa vida. Pode descrever um pouco mais sobre as situações específicas que lhe causam maior pressão?',
      created_at: new Date(Date.now() - 3480000).toISOString()
    },
    {
      id: '4',
      role: 'user',
      content: 'Principalmente os prazos apertados e a quantidade de trabalho. Sinto que nunca consigo terminar tudo e isso deixa-me ansioso.',
      created_at: new Date(Date.now() - 3420000).toISOString()
    },
    {
      id: '5',
      role: 'assistant',
      content: 'Isso é uma preocupação válida. É importante encontrarmos estratégias para gerir essa ansiedade. Já tentou técnicas de gestão de tempo ou estabelecer prioridades nas suas tarefas?',
      created_at: new Date(Date.now() - 3360000).toISOString()
    }
  ],
  'chat-2': [
    {
      id: '1',
      role: 'assistant',
      content: 'Bem-vindo ao serviço de assistência financeira. Como posso ajudar hoje?',
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '2',
      role: 'user',
      content: 'Tenho dificuldades em gerir as minhas finanças pessoais e gostaria de orientação.',
      created_at: new Date(Date.now() - 7140000).toISOString()
    }
  ],
  'chat-3': [
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Bem-vindo ao serviço de assistência jurídica. Em que posso ajudá-lo?',
      created_at: new Date(Date.now() - 14400000).toISOString()
    },
    {
      id: '2',
      role: 'user',
      content: 'Tenho algumas dúvidas sobre o meu contrato de trabalho, especialmente sobre as cláusulas de rescisão.',
      created_at: new Date(Date.now() - 14340000).toISOString()
    },
    {
      id: '3',
      role: 'assistant',
      content: 'Compreendo. As cláusulas de rescisão são um aspeto importante do contrato. Pode partilhar qual é a sua principal preocupação?',
      created_at: new Date(Date.now() - 14280000).toISOString()
    }
  ],
  'default': [
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Como posso ajudá-lo hoje?',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      role: 'user',
      content: 'Preciso de orientação sobre o tema que selecionei.',
      created_at: new Date(Date.now() - 3540000).toISOString()
    }
  ]
};

export function PreDiagnosticModal({ open, onOpenChange, session }: PreDiagnosticModalProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && session.chat_session_id) {
      fetchChatMessages();
    }
  }, [open, session.chat_session_id]);

  const fetchChatMessages = async () => {
    if (!session.chat_session_id) return;

    setLoading(true);
    try {
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.chat_session_id)
        .order('created_at');

      if (!error && data && data.length > 0) {
        setChatMessages(data);
      } else {
        // Fallback to mock data
        const mockData = mockChatMessages[session.chat_session_id] || mockChatMessages['default'];
        setChatMessages(mockData);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      // Use mock data on error
      const mockData = mockChatMessages[session.chat_session_id] || mockChatMessages['default'];
      setChatMessages(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getPillarLabel = (pillar: string) => {
    const labels = {
      psychological: 'Saúde Mental',
      physical: 'Bem-Estar Físico',
      financial: 'Assistência Financeira',
      legal: 'Assistência Jurídica'
    };
    return labels[pillar as keyof typeof labels] || pillar;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 space-y-4 border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <MessageSquare className="h-6 w-6 text-primary" />
                Pré-Diagnóstico da Sessão
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Transcrição completa da conversa inicial com o utilizador
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Session Info Card */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <User className="h-3 w-3" />
                {session.user_name}
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <FileText className="h-3 w-3" />
                {session.company_name}
              </Badge>
              <Badge variant="secondary" className="gap-1.5">
                {getPillarLabel(session.pillar)}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{session.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{session.time}</span>
              </div>
              {session.topic && (
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">Tema: {session.topic}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">A carregar conversa...</p>
              </div>
            </div>
          ) : chatMessages.length > 0 ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-4 space-y-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      {msg.role === 'user' ? (
                        <>
                          <User className="h-3 w-3" />
                          <span className="font-medium">Utilizador</span>
                        </>
                      ) : (
                        <>
                          <Bot className="h-3 w-3" />
                          <span className="font-medium">Assistente</span>
                        </>
                      )}
                      <span className="opacity-50">
                        {format(new Date(msg.created_at), 'HH:mm', { locale: pt })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
              <MessageSquare className="h-12 w-12 text-muted-foreground opacity-50" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Sem dados de pré-diagnóstico
                </p>
                <p className="text-xs text-muted-foreground">
                  Esta sessão não possui transcrição de conversa inicial
                </p>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 pt-4 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {chatMessages.length > 0
                ? `${chatMessages.length} mensagem${chatMessages.length !== 1 ? 's' : ''} na conversa`
                : 'Nenhuma mensagem disponível'}
            </p>
            <Button onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

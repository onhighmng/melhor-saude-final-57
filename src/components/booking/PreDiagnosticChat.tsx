import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ChevronLeft, Loader2 } from 'lucide-react';
import { BookingBanner } from './BookingBanner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BookingPillar } from './BookingFlow';
import { getTopicPillarId } from '@/utils/pillarMapping';
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from '@/components/ui/chat-input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PreDiagnosticChatProps {
  pillar: BookingPillar;
  topic: string;
  onBack: () => void;
  onComplete: (sessionId: string) => void;
  // Legal assessment context (if applicable)
  legalContext?: {
    selectedTopics?: string[];
    selectedSymptoms?: string[];
    additionalNotes?: string;
  };
}

export const PreDiagnosticChat = ({ pillar, topic, onBack, onComplete, legalContext }: PreDiagnosticChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const initializeChat = async (retryCount = 0) => {
    const maxRetries = 3;
    setIsInitializing(true);
    setInitError(false);
    
    try {
      // Convert BookingPillar to topic pillar ID for database and translations
      const topicPillarId = getTopicPillarId(pillar);
      
      // Create chat session - handle guest users by allowing null user_id
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user?.id || null,
          pillar: topicPillarId,
          status: 'active',
          ai_resolution: false,
        })
        .select()
        .single();

      if (sessionError) {
        console.error('[PreDiagnosticChat] Session creation error:', sessionError);
        throw sessionError;
      }
      
      console.log('[PreDiagnosticChat] Session created:', session.id);
      setSessionId(session.id);
      setIsInitializing(false);
      setMessages([]);
    } catch (error) {
      console.error('[PreDiagnosticChat] Error initializing chat:', error);
      
      if (retryCount < maxRetries) {
        // Retry with exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        console.log('[PreDiagnosticChat] Retrying in', delay, 'ms');
        setTimeout(() => initializeChat(retryCount + 1), delay);
      } else {
        // All retries failed
        setIsInitializing(false);
        setInitError(true);
        toast({
          title: 'Erro',
          description: 'Não foi possível iniciar a sessão de chat',
          variant: 'destructive',
        });
        setMessages([]);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isInitializing) return;
    if (!sessionId) {
      toast({
        title: 'Erro',
        description: 'Session not ready. Please wait...',
        variant: 'destructive',
      });
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to UI immediately
    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Save user message to database
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: userMessage,
      });

      // Get topic name for context
      const topicPillarId = getTopicPillarId(pillar);
      const topicKey = `user:topics.${topicPillarId}.${topic}.name`;
      const topicName = topic;

      // Build context from user selections
      let contextInfo = `Topic: ${topicName}`;
      
      if (legalContext) {
        if (legalContext.selectedTopics && legalContext.selectedTopics.length > 0) {
          const topicNames = legalContext.selectedTopics.map(topicId => {
            const topicMap: Record<string, string> = {
              family: 'Direito de Família',
              labor: 'Direito do Trabalho',
              consumer: 'Direito do Consumidor',
              housing: 'Direito Habitacional',
              debt: 'Dívidas e Crédito',
              criminal: 'Direito Criminal',
            };
            return topicMap[topicId] || topicId;
          }).join(', ');
          contextInfo += `\nLegal Areas: ${topicNames}`;
        }
        
        if (legalContext.selectedSymptoms && legalContext.selectedSymptoms.length > 0) {
          const symptomNames = legalContext.selectedSymptoms.map(symptomId => {
            const symptomMap: Record<string, string> = {
              divorce: 'Processo de divórcio ou separação',
              custody: 'Questões de guarda de filhos',
              alimony: 'Pensão alimentícia',
              unfairDismissal: 'Demissão injusta',
              unpaidWages: 'Salários não pagos',
              workplaceHarassment: 'Assédio no trabalho'
            };
            return symptomMap[symptomId] || symptomId;
          }).join(', ');
          contextInfo += `\nSpecific Issues: ${symptomNames}`;
        }
        
        if (legalContext.additionalNotes) {
          contextInfo += `\nAdditional Context: ${legalContext.additionalNotes}`;
        }
      }

      // Call AI edge function with full conversation history
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
        'prediagnostic-chat',
        {
          body: {
            messages: [...messages, userMsg].map(m => ({
              role: m.role,
              content: m.content,
            })),
            pillar: topicPillarId,
            topic: topicName,
            context: contextInfo,
          },
        }
      );

      if (aiError) {
        console.error('[PreDiagnosticChat] AI call error:', aiError);
        throw aiError;
      }

      if (!aiResponse?.message) {
        throw new Error('No response from AI');
      }

      // Add AI response to UI
      const assistantMsg: Message = {
        role: 'assistant',
        content: aiResponse.message,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Save AI response to database
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: aiResponse.message,
      });

    } catch (error) {
      console.error('[PreDiagnosticChat] Error sending message:', error);
      
      // Show user-friendly error
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem',
        variant: 'destructive',
      });
      
      // Remove the user message from UI on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBookSession = () => {
    // Allow booking even without sessionId - generate temp ID if needed
    const bookingSessionId = sessionId || `temp-${Date.now()}`;
    onComplete(bookingSessionId);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Conte-nos mais sobre a sua situação</h2>
          <p className="text-sm text-muted-foreground">As suas respostas ajudarão o especialista a preparar-se melhor.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Conversa</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {isInitializing && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Initializing secure chat session...</p>
                </div>
              )}
              {initError && (
                <div className="text-center py-8">
                  <p className="text-sm text-destructive mb-4">Failed to initialize chat session</p>
                  <Button onClick={() => initializeChat(0)} size="sm" variant="outline">
                    Retry
                  </Button>
                </div>
              )}
              {!isInitializing && !initError && messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Comece por descrever a sua situação. O assistente está pronto para ajudá-lo.</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onSubmit={handleSend}
              loading={isLoading}
            >
              <ChatInputTextArea
                placeholder="Escreva aqui os detalhes da sua situação..."
                disabled={isLoading || isInitializing}
                className="min-h-[60px]"
              />
              <ChatInputSubmit
                disabled={!input.trim() || isLoading || isInitializing}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </ChatInputSubmit>
            </ChatInput>
          </div>

          <BookingBanner onBookSession={handleBookSession} />
        </CardContent>
      </Card>
    </div>
  );
};

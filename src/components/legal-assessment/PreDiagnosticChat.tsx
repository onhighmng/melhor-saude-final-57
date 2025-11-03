import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PreDiagnosticChatProps {
  onBack: () => void;
  onComplete: (sessionId: string) => void;
}

const PreDiagnosticChat: React.FC<PreDiagnosticChatProps> = ({ onBack, onComplete }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou seu assistente de pré-diagnóstico jurídico. Estou aqui para ajudá-lo a organizar suas questões antes da sua consulta com o especialista humano. Por favor, descreva sua situação jurídica da forma mais detalhada possível.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Create chat session when component mounts
    createChatSession();
  }, []);

  const createChatSession = async () => {
    if (!user?.id) return;
    
    try {
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          pillar: 'assistencia_juridica',
          status: 'active',
          ai_resolution: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating chat session:', error);
      } else if (session) {
        setChatSessionId(session.id);
      }
    } catch (error) {
      console.error('Error creating chat session:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const messageContent = input;
    setInput('');
    setIsLoading(true);

    try {
      // Save user message to database
      if (chatSessionId) {
        await supabase.from('chat_messages').insert({
          session_id: chatSessionId,
          role: 'user',
          content: messageContent
        });
      }

      const { data, error } = await supabase.functions.invoke('legal-chat', {
        body: {
          messages: [...messages, userMessage],
          mode: 'prediagnostic'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to database
      if (chatSessionId) {
        await supabase.from('chat_messages').insert({
          session_id: chatSessionId,
          role: 'assistant',
          content: data.response
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar sua mensagem. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-soft-white">
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={onBack}>
              ← Voltar
            </Button>
            <Button variant="outline" onClick={() => onComplete(chatSessionId || '')}>
              Concluir Mais Tarde
            </Button>
          </div>

          <Card className="mb-6 p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Pré-Diagnóstico Jurídico</h3>
                <p className="text-sm text-muted-foreground">
                  Este diagnóstico será compartilhado com seu especialista para preparar melhor sua consulta.
                </p>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Descreva sua situação jurídica..."
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Pressione Enter para enviar, Shift+Enter para nova linha
              </p>
            </div>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button onClick={onComplete} size="lg">
              Finalizar Pré-Diagnóstico
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreDiagnosticChat;

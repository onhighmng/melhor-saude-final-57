import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  from: "user" | "bot";
  text: string;
  timestamp: number;
  confidence?: number;
}

const quickChips = [
  "Agendar sessão",
  "Pedidos de troca", 
  "Problemas de login"
];

// Removed - now using edge function

async function createSupportTicket(
  userId: string | null,
  chatSessionId: string,
  thread: ChatMessage[]
) {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        subject: 'Escalado do Chat - Assistente Virtual',
        description: `Chat escalado. Histórico:\n${thread.map(m => `${m.from}: ${m.text}`).join('\n')}`,
        status: 'open',
        priority: 'medium',
        category: 'chat_escalation'
      } as any)
      .select()
      .single();

    if (error) throw error;

    // Update chat session
    await supabase
      .from('chat_sessions')
      .update({ status: 'resolved' })
      .eq('id', chatSessionId);

    return { id: data.ticket_number };
  } catch (error) {
    console.error('Error creating support ticket:', error);
    throw error;
  }
}

export function SupportAssistant() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "bot",
      text: "Olá! Sou o assistente virtual da OnHigh Management. Como posso ajudar hoje?",
      timestamp: Date.now(),
      confidence: 1
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Initialize chat session
  useEffect(() => {
    const initChatSession = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: user?.id || null,
            pillar: 'geral',
            status: 'active'
          })
          .select()
          .single();

        if (error) throw error;
        setChatSessionId(data.id);
      } catch (error) {
        console.error('Error creating chat session:', error);
        // Continue without session ID - graceful degradation
      }
    };

    initChatSession();
  }, [user]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !chatSessionId) return;

    const userMessage: ChatMessage = {
      from: "user",
      text: message.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowEscalation(false);

    try {
      // Call edge function for chat response
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          sessionId: chatSessionId,
          message: message.trim(),
          userId: user?.id,
          pillar: 'geral'
        }
      });

      if (error) throw error;

      const botMessage: ChatMessage = {
        from: "bot",
        text: data.message,
        timestamp: Date.now(),
        confidence: data.confidence
      };

      setMessages(prev => [...prev, botMessage]);

      // Show escalation if confidence is low or suggested
      if (data.confidence < 0.5 || data.suggestEscalation) {
        setShowEscalation(true);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        from: "bot",
        text: "Desculpe, ocorreu um erro. Tente novamente ou contacte o nosso suporte humano.",
        timestamp: Date.now(),
        confidence: 0
      };
      setMessages(prev => [...prev, errorMessage]);
      setShowEscalation(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalation = async () => {
    if (!chatSessionId) return;

    try {
      const ticket = await createSupportTicket(user?.id || null, chatSessionId, messages);

      toast({
        title: "Pedido enviado",
        description: `Ticket ${ticket.id} criado. A nossa equipa entrará em contacto brevemente.`,
        variant: "default"
      });

      setShowEscalation(false);
      
      const confirmationMessage: ChatMessage = {
        from: "bot",
        text: `Perfeito! Criei o ticket ${ticket.id} para si. A nossa equipa de suporte humano entrará em contacto consigo brevemente através do email.`,
        timestamp: Date.now(),
        confidence: 1
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o ticket. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleQuickChip = (chipText: string) => {
    handleSendMessage(chipText);
  };

  return (
    <div className="space-y-4">
      <div className="font-['Baskervville'] text-xl font-semibold mb-4">
        Assistente Virtual
      </div>

      {/* Chat Window */}
      <div 
        className="h-[min(70vh,640px)] overflow-y-auto rounded-xl border bg-white p-4 space-y-3"
        role="log"
        aria-live="polite"
        aria-label="Chat do assistente virtual"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-2xl font-['Noto_Serif'] ${
                message.from === 'user'
                  ? 'bg-primary/10 border-primary/20 border ml-auto'
                  : 'bg-gray-50 border'
              }`}
            >
              {message.from === 'bot' && (
                <div className="text-xs text-gray-500 mb-1">Assistente</div>
              )}
              <div className="text-sm">{message.text}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 border p-3 rounded-2xl max-w-[75%]">
              <div className="text-xs text-gray-500 mb-1">Assistente</div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {showEscalation && (
          <div className="flex justify-center">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl max-w-md text-center">
              <CheckCircle className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="font-['Noto_Serif'] text-sm text-blue-800 mb-3">
                Precisa de ajuda mais específica?
              </p>
              <Button
                onClick={handleEscalation}
                size="sm"
                className="font-['Noto_Serif']"
              >
                Encaminhar para a equipa
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Chips */}
      <div className="flex flex-wrap gap-2">
        {quickChips.map((chip, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleQuickChip(chip)}
            disabled={isLoading}
            className="font-['Noto_Serif'] text-xs"
          >
            {chip}
          </Button>
        ))}
      </div>

      {/* Message Composer */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escreva a sua questão…"
          disabled={isLoading}
          className="font-['Noto_Serif']"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(inputValue);
            }
          }}
          aria-label={t('support.messageField')}
        />
        <Button
          onClick={() => handleSendMessage(inputValue)}
          disabled={isLoading || !inputValue.trim()}
          aria-label={t('support.sendMessage')}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
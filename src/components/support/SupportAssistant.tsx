import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

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

// Helper function placeholder
async function getBotReply(message: string): Promise<{ text: string; confidence: number }> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lowerMessage = message.toLowerCase();
  
  // Low confidence responses that trigger escalation
  if (lowerMessage.includes("humano") || lowerMessage.includes("atendente") || lowerMessage.includes("falar com alguém")) {
    return {
      text: "Compreendo que pretende falar com um humano. Posso encaminhar o seu pedido para a nossa equipa de suporte.",
      confidence: 0.3
    };
  }
  
  if (lowerMessage.includes("agendar") || lowerMessage.includes("marcar")) {
    return {
      text: "Para agendar uma sessão, pode aceder à secção 'Marcar Sessão' no seu painel. Lá pode escolher o tipo de apoio e o horário que melhor se adequa às suas necessidades.",
      confidence: 0.8
    };
  }
  
  if (lowerMessage.includes("login") || lowerMessage.includes("acesso")) {
    return {
      text: "Se tem problemas de acesso, certifique-se de que está a usar o email correto e a palavra-passe. Pode usar a opção 'Esqueceu a palavra-passe?' se necessário.",
      confidence: 0.7
    };
  }
  
  // Default response with medium confidence
  return {
    text: "Obrigado pela sua questão. Estou aqui para ajudar com informações sobre a nossa plataforma. Pode ser mais específico sobre o que precisa?",
    confidence: 0.5
  };
}

async function createSupportTicket(ticket: {
  source: 'chat' | 'form';
  thread?: ChatMessage[];
  [key: string]: any;
}) {
  // Save to localStorage for demo
  const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
  const newTicket = {
    id: `AS-2025-${String(Date.now()).slice(-6)}`,
    ...ticket,
    createdAt: new Date().toISOString(),
    status: 'open'
  };
  tickets.push(newTicket);
  localStorage.setItem('support_tickets', JSON.stringify(tickets));
  
  console.log('Create ticket', newTicket);
  return { id: newTicket.id };
}

export function SupportAssistant() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "bot",
      text: "Olá! Sou o assistente virtual da Melhor Saúde. Como posso ajudar hoje?",
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

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('support_chat_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the initial bot message
      localStorage.setItem('support_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

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
      const response = await getBotReply(message);
      
      const botMessage: ChatMessage = {
        from: "bot",
        text: response.text,
        timestamp: Date.now(),
        confidence: response.confidence
      };

      setMessages(prev => [...prev, botMessage]);

      // Show escalation if confidence is low
      if (response.confidence < 0.5) {
        setShowEscalation(true);
      }
    } catch (error) {
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
    try {
      const ticket = await createSupportTicket({
        source: 'chat',
        thread: messages
      });

      toast({
        title: "Pedido enviado",
        description: `Ticket #${ticket.id} criado. Um humano entrará em contacto brevemente.`,
        variant: "default"
      });

      setShowEscalation(false);
      
      const confirmationMessage: ChatMessage = {
        from: "bot",
        text: `Perfeito! Criei o ticket #${ticket.id} para si. A nossa equipa entrará em contacto consigo brevemente.`,
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
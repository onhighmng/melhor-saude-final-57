import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Phone, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from '@/components/ui/chat-input';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PhysicalWellnessAssessment {
  selectedTopics: string[];
  selectedSymptoms: string[];
  additionalNotes: string;
}

interface PhysicalWellnessChatInterfaceProps {
  assessment: PhysicalWellnessAssessment;
  onBack: () => void;
  onComplete: () => void;
  onChooseHuman?: () => void;
}

const PhysicalWellnessChatInterface: React.FC<PhysicalWellnessChatInterfaceProps> = ({
  assessment,
  onBack,
  onComplete,
  onChooseHuman
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.body.classList.add('physical-wellness-page');
    return () => {
      document.body.classList.remove('physical-wellness-page');
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setHasInteracted(true);
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('physical-wellness-chat', {
        body: {
          messages: [...messages, userMessage],
          assessment
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem. Tente novamente.',
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
    <div className="min-h-screen flex flex-col">
      {/* Header - Always show in top-left */}
      <div className="absolute top-0 left-0 flex items-center gap-4 px-8 py-6 z-10">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-semibold">Assistente de Bem-estar Físico</h2>
        </div>
        <InteractiveHoverButton 
          onClick={onChooseHuman}
          text="Solicitar Sessão 1-on-1"
          icon={<Phone className="h-4 w-4" />}
          className="text-sm px-10 py-4 min-w-[280px]"
        />
      </div>

      {/* Centered Interface - Only show when user hasn't interacted */}
      {!hasInteracted && (
        <div className="flex-1 flex items-center justify-center px-8 py-8">
          <div className="w-full max-w-6xl text-center space-y-8">
            {/* Title */}
            <h1 className="text-2xl font-semibold">Conversa comigo, com privacidade e atenção.</h1>

            {/* Input Area */}
            <div className="w-full">
              <ChatInput
                value={input}
                onChange={e => setInput(e.target.value)}
                onSubmit={sendMessage}
                loading={isLoading}
                variant="unstyled"
                className="flex items-end gap-2 !rounded-full"
              >
                <ChatInputTextArea
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className="min-h-[60px] text-lg !rounded-full"
                />
                <ChatInputSubmit
                  disabled={!input.trim() || isLoading}
                  className="!rounded-full"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </ChatInputSubmit>
              </ChatInput>
            </div>

            {/* Prompt Suggestions */}
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                "Gostaria de partilhar o que \"sinto\"",
                "Já percebi o que preciso",
                "Estou um pouco indeciso sobre o que preciso"
              ].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(prompt);
                    setHasInteracted(true);
                  }}
                  className="px-6 py-3 h-12 whitespace-nowrap text-center bg-white hover:bg-green-600 hover:text-white border border-gray-300 hover:border-green-600 transition-colors rounded-full text-base font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages - Only show when user has interacted */}
      {hasInteracted && (
        <div className="flex-1 px-8 py-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-base whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-base">A escrever...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input Area - Only show when user has interacted */}
      {hasInteracted && (
        <div className="bg-transparent backdrop-blur-sm px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <ChatInput
              value={input}
              onChange={e => setInput(e.target.value)}
              onSubmit={sendMessage}
              loading={isLoading}
              variant="unstyled"
              className="flex items-end gap-2 !rounded-full"
            >
              <ChatInputTextArea
                placeholder="Digite sua pergunta..."
                disabled={isLoading}
                className="min-h-[60px] text-lg !rounded-full"
              />
              <ChatInputSubmit
                disabled={!input.trim() || isLoading}
                className="!rounded-full"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </ChatInputSubmit>
            </ChatInput>
          </div>
        </div>
      )}

      {/* Solicitar Sessão 1-on-1 Button - Only show when user has interacted */}
      {hasInteracted && (
        <div className="px-8 py-4">
          <div className="max-w-5xl mx-auto flex justify-center">
            <InteractiveHoverButton 
              onClick={onChooseHuman}
              text="Solicitar Sessão 1-on-1"
              icon={<Phone className="h-4 w-4" />}
              className="text-sm px-10 py-4 min-w-[280px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysicalWellnessChatInterface;

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Phone, X } from 'lucide-react';
import { useChatSession } from '@/hooks/useChatSession';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SpecialistContactCard } from './SpecialistContactCard';
import { ChatExitFeedbackButtons } from './ChatExitFeedbackButtons';
import { ChatIntroSection } from './ChatIntroSection';
import { BookingBanner } from './BookingBanner';
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from '@/components/ui/chat-input';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

interface UniversalAIChatProps {
  onClose: () => void;
  initialPillar?: string;
}

export const UniversalAIChat = ({
  onClose,
  initialPillar
}: UniversalAIChatProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [showPhoneCard, setShowPhoneCard] = useState(false);
  const [phoneContext, setPhoneContext] = useState('');
  const [showExitFeedback, setShowExitFeedback] = useState(false);
  const [showBookingBanner, setShowBookingBanner] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout>();
  const {
    sessionId,
    messages,
    isLoading,
    pillar,
    createSession,
    sendMessage,
    addMessage
  } = useChatSession(user?.id);

  useEffect(() => {
    if (initialPillar) {
      createSession(initialPillar);
    }
  }, [initialPillar, createSession]);

  useEffect(() => {
    if (messages.length > 0) {
      setHasInteracted(true);
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      role: 'user' as const,
      content: input
    };
    
    addMessage(userMessage);
    setInput('');
    setHasInteracted(true);
    
    try {
      await sendMessage(input);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContactRequest = () => {
    toast({
      title: "Estamos disponíveis 24/7",
      description: "A nossa equipa entrará em contacto consigo o mais breve possível.",
      duration: 10000,
    });
  };

  const handleFeedbackComplete = () => {
    // Dispatch custom event to notify JourneyProgressBar
    window.dispatchEvent(new CustomEvent('milestoneCompleted', { detail: { id: 'specialist' } }));
    
    setShowExitFeedback(false);
    onClose();
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-white">
            <X className="h-4 w-4" />
            Fechar
          </Button>
          <div>
            <h2 className="text-3xl font-semibold">Fale com um Especialista da Melhor Saúde</h2>
            {pillar && <p className="text-base text-muted-foreground capitalize mt-1">
              {pillar === 'saude_mental' ? 'Saúde Mental' : 
               pillar === 'bem_estar_fisico' ? 'Bem-estar Físico' : 
               pillar === 'assistencia_financeira' ? 'Assistência Financeira' : 
               'Assistência Jurídica'}
            </p>}
          </div>
        </div>
        <InteractiveHoverButton 
          onClick={handleContactRequest}
          text="Solicitar chamada 24/7"
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
                onSubmit={handleSend}
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
              onSubmit={handleSend}
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

      {/* Modals */}
      {showPhoneCard && (
        <SpecialistContactCard
          context={phoneContext}
          onClose={() => setShowPhoneCard(false)}
          onContactRequest={handleContactRequest}
        />
      )}

      {showExitFeedback && (
        <ChatExitFeedbackButtons
          onComplete={handleFeedbackComplete}
          onClose={() => setShowExitFeedback(false)}
        />
      )}

      {showBookingBanner && (
        <BookingBanner
          onClose={() => setShowBookingBanner(false)}
          onBookSession={() => {
            setShowBookingBanner(false);
            navigate('/user/book');
          }}
        />
      )}
    </div>
  );
};
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Phone, X } from 'lucide-react';
import { useChatSession } from '@/hooks/useChatSession';
import { useAuth } from '@/contexts/AuthContext';
import { SpecialistContactCard } from './SpecialistContactCard';
import { ChatExitFeedbackButtons } from './ChatExitFeedbackButtons';
import { ChatIntroSection } from './ChatIntroSection';
import { BookingBanner } from './BookingBanner';
interface UniversalAIChatProps {
  onClose: () => void;
  initialPillar?: string;
}
export const UniversalAIChat = ({
  onClose,
  initialPillar
}: UniversalAIChatProps) => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [showPhoneCard, setShowPhoneCard] = useState(false);
  const [phoneContext, setPhoneContext] = useState('');
  const [showExitFeedback, setShowExitFeedback] = useState(false);
  const [showBookingBanner, setShowBookingBanner] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);
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
    if (user && !sessionId) {
      createSession();
    }
  }, [user, sessionId, createSession]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    // Show banner after 3+ exchanges
    if (messages.length >= 6) {
      setShowBookingBanner(true);
    }
  }, [messages]);

  // Inactivity timer for fallback message
  useEffect(() => {
    if (messages.length === 0 && showIntro) {
      // Start 20s timer for fallback message
      inactivityTimerRef.current = setTimeout(() => {
        setShowFallbackMessage(true);
      }, 20000);
    }
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [messages.length, showIntro]);
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Hide intro once user sends first message
    if (showIntro) {
      setShowIntro(false);
      setShowFallbackMessage(false);
    }
    const message = input;
    setInput('');
    const response = await sendMessage(message);
    if (response?.action === 'provide_phone') {
      setShowPhoneCard(true);
      setPhoneContext(response.phone_context || '');
    }
  };
  const handleSelectPrompt = async (prompt: string) => {
    setShowIntro(false);
    setShowFallbackMessage(false);

    // Automatically send the prompt instead of just setting it
    const response = await sendMessage(prompt);
    if (response?.action === 'provide_phone') {
      setShowPhoneCard(true);
      setPhoneContext(response.phone_context || '');
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleClose = () => {
    setShowExitFeedback(true);
  };
  const handleFeedbackComplete = () => {
    setShowExitFeedback(false);
    onClose();
  };
  const handleBookSession = () => {
    navigate('/user/book-session');
    onClose();
  };
  return <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Fale com um Especialista da Melhor Saúde

          </h2>
            {pillar && <p className="text-sm text-muted-foreground capitalize">
                {pillar === 'saude_mental' ? 'Saúde Mental' : pillar === 'bem_estar_fisico' ? 'Bem-estar Físico' : pillar === 'assistencia_financeira' ? 'Assistência Financeira' : 'Assistência Jurídica'}
              </p>}
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {/* Show intro section if no messages */}
            {showIntro && messages.length === 0 && <ChatIntroSection onSelectPrompt={handleSelectPrompt} />}

            {/* Show fallback message after 20s inactivity */}
            {showFallbackMessage && messages.length === 0 && !showIntro && <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm">Se preferir falar com um especialista humano, pode agendar uma sessão</p>
                </div>
              </div>}

            {messages.map((message, index) => <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>)}

            {isLoading && <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">A escrever...</span>
                  </div>
                </div>
              </div>}

            {showPhoneCard && <SpecialistContactCard pillar={pillar || 'general'} context={phoneContext} sessionId={sessionId || ''} />}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Escreva a sua mensagem..." className="resize-none" rows={2} disabled={isLoading || showPhoneCard} />
            <Button onClick={handleSend} disabled={isLoading || !input.trim() || showPhoneCard}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Permanent 1-on-1 Booking Section */}
        <div className="bg-muted/50 border-t p-4">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Se as suas questões são complexas, solicite uma sessão 1-on-1 com um especialista.
            </p>
            <Button onClick={handleBookSession} variant="outline" size="sm" className="w-full sm:w-auto">
              <Phone className="h-4 w-4 mr-2" />
              Solicitar Sessão 1-on-1
            </Button>
          </div>
        </div>

      </div>

      {showExitFeedback && <ChatExitFeedbackButtons sessionId={sessionId || ''} pillar={pillar} onClose={handleFeedbackComplete} />}
    </div>;
};
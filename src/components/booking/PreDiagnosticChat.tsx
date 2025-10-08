import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PreDiagnosticChatProps {
  pillar: BookingPillar;
  topic: string;
  onBack: () => void;
  onComplete: (sessionId: string) => void;
}

export const PreDiagnosticChat = ({ pillar, topic, onBack, onComplete }: PreDiagnosticChatProps) => {
  const { t } = useTranslation(['user', 'common']);
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
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

  const initializeChat = async () => {
    try {
      console.log('[PreDiagnosticChat] Initializing chat with user:', user);
      console.log('[PreDiagnosticChat] Pillar:', pillar, 'Topic:', topic);
      
      // Convert BookingPillar to topic pillar ID for database and translations
      const topicPillarId = getTopicPillarId(pillar);
      
      // Create chat session - handle guest users by allowing null user_id
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user?.id || null,
          pillar: topicPillarId, // Store the topic pillar ID in database
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

      // Add welcome message
      const topicKey = `user:topics.${topicPillarId}.${topic}.name`;
      const topicName = t(topicKey);
      console.log('[PreDiagnosticChat] Topic key:', topicKey, 'Translation:', topicName);
      
      const welcomeMessage = {
        role: 'assistant' as const,
        content: t('user:booking.directFlow.chatWelcome', { topic: topicName }),
      };
      
      setMessages([welcomeMessage]);

      // Save welcome message to database
      await supabase.from('chat_messages').insert({
        session_id: session.id,
        role: 'assistant',
        content: welcomeMessage.content,
      });
    } catch (error) {
      console.error('[PreDiagnosticChat] Error initializing chat:', error);
      
      // Show user-friendly error and allow them to continue
      toast({
        title: t('errors:title'),
        description: t('errors:chatInitFailed') || 'Could not start chat session. Please try again.',
        variant: 'destructive',
      });
      
      // Still show UI for demo purposes
      const fallbackMessage = {
        role: 'assistant' as const,
        content: t('user:booking.directFlow.chatWelcome', { topic }),
      };
      setMessages([fallbackMessage]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Save user message
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: userMessage,
      });

      // In a real implementation, you would call an AI service here
      // For now, we'll use a simple acknowledgment
      const aiResponse = {
        role: 'assistant' as const,
        content: t('user:booking.directFlow.chatAcknowledge'),
      };

      setMessages(prev => [...prev, aiResponse]);

      // Save AI response
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: aiResponse.content,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('errors:messageSendFailed'),
        variant: 'destructive',
      });
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
    if (sessionId) {
      onComplete(sessionId);
    }
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
          {t('common:actions.back')}
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{t('user:booking.directFlow.chatTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('user:booking.directFlow.chatSubtitle')}</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">{t('user:booking.directFlow.conversation')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
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
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('user:booking.directFlow.chatPlaceholder')}
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <BookingBanner onBookSession={handleBookSession} />
        </CardContent>
      </Card>
    </div>
  );
};

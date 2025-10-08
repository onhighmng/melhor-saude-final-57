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
  // Legal assessment context (if applicable)
  legalContext?: {
    selectedTopics?: string[];
    selectedSymptoms?: string[];
    additionalNotes?: string;
  };
}

export const PreDiagnosticChat = ({ pillar, topic, onBack, onComplete, legalContext }: PreDiagnosticChatProps) => {
  const { t } = useTranslation(['user', 'common']);
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
      console.log('[PreDiagnosticChat] Initializing chat (attempt', retryCount + 1, ') with user:', user);
      console.log('[PreDiagnosticChat] Pillar:', pillar, 'Topic:', topic);
      
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
          title: t('errors:title'),
          description: t('errors:chatInitFailed') || 'Could not start chat session. Please try again.',
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
        title: t('errors:title'),
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
      const topicName = t(topicKey);

      // Build context from user selections
      let contextInfo = `Topic: ${topicName}`;
      
      if (legalContext) {
        if (legalContext.selectedTopics && legalContext.selectedTopics.length > 0) {
          const topicNames = legalContext.selectedTopics.map(topicId => {
            const topicMap: Record<string, string> = {
              family: t('user:legal.topics.family.title'),
              labor: t('user:legal.topics.labor.title'),
              consumer: t('user:legal.topics.consumer.title'),
              housing: t('user:legal.topics.housing.title'),
              debt: t('user:legal.topics.debt.title'),
              criminal: t('user:legal.topics.criminal.title'),
            };
            return topicMap[topicId] || topicId;
          }).join(', ');
          contextInfo += `\nLegal Areas: ${topicNames}`;
        }
        
        if (legalContext.selectedSymptoms && legalContext.selectedSymptoms.length > 0) {
          const symptomNames = legalContext.selectedSymptoms.map(symptomId => 
            t(`user:legal.symptoms.${symptomId}.text`)
          ).join(', ');
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
        title: t('errors:title'),
        description: t('errors:messageSendFailed') || 'Failed to send message. Please try again.',
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
          {t('common:actions.back')}
        </Button>
        <div className="flex-1">
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
                  <p className="text-sm">{t('user:booking.directFlow.chatEmptyState')}</p>
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
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('user:booking.directFlow.chatPlaceholder')}
                className="min-h-[60px] resize-none"
                disabled={isLoading || isInitializing}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isInitializing}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <BookingBanner onBookSession={handleBookSession} />
        </CardContent>
      </Card>
    </div>
  );
};
